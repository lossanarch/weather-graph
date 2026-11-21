"""Tests for scripts/release.py."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("release", REPO_ROOT / "scripts" / "release.py")
release = importlib.util.module_from_spec(_spec)
sys.modules["release"] = release
_spec.loader.exec_module(release)

V = release.Version.parse


@pytest.mark.parametrize(
    ("current", "bump", "pre", "expected"),
    [
        ("1.4.0", "patch", None, "1.4.1"),
        ("1.4.0", "minor", None, "1.5.0"),
        ("1.4.3", "major", None, "2.0.0"),
        ("1.4.0", "major", "rc", "2.0.0-rc.1"),
        ("1.4.0", "minor", "beta", "1.5.0-beta.1"),
        ("1.4.0", "prerelease", None, "1.4.1-rc.1"),
        ("2.0.0-rc.1", "prerelease", None, "2.0.0-rc.2"),
        ("2.0.0-beta.3", "prerelease", "rc", "2.0.0-rc.1"),
        ("2.0.0-rc.2", "major", None, "2.0.0"),
        ("2.0.0-rc.2", "patch", None, "2.0.0"),
        ("1.5.0-rc.1", "minor", None, "1.5.0"),
        ("1.5.1-rc.1", "minor", None, "1.6.0"),
        ("1.5.0-rc.1", "major", None, "2.0.0"),
        ("1.4.0", "2.1.0", None, "2.1.0"),
        ("1.4.0", "1.5.0-rc.1", None, "1.5.0-rc.1"),
    ],
)
def test_bump_version(current: str, bump: str, pre: str | None, expected: str) -> None:
    assert str(release.bump_version(V(current), bump, pre)) == expected


@pytest.mark.parametrize(
    ("current", "bump", "pre", "message"),
    [
        ("1.4.0", "1.4.0", None, "not newer"),
        ("1.4.0", "1.3.9", None, "not newer"),
        ("1.4.0", "1.4", None, "not a semantic version"),
        ("1.4.0", "minor", "rc 1", "letters, digits and hyphens"),
        ("1.4.0", "2.0.0", "rc", "--pre only applies"),
        ("2.0.0-rc.2", "prerelease", "beta", "would sort before"),
    ],
)
def test_bump_version_rejects(current: str, bump: str, pre: str | None, message: str) -> None:
    with pytest.raises(release.ReleaseError, match=message):
        release.bump_version(V(current), bump, pre)


def test_semver_precedence_matches_the_spec() -> None:
    ordered = [
        "1.0.0-alpha",
        "1.0.0-alpha.1",
        "1.0.0-alpha.beta",
        "1.0.0-beta",
        "1.0.0-beta.2",
        "1.0.0-beta.11",
        "1.0.0-rc.1",
        "1.0.0",
        "1.0.1",
        "1.10.0",
    ]
    versions = [V(v) for v in ordered]
    assert sorted(reversed(versions)) == versions
    assert str(V("1.2.3-rc.1+build.5")) == "1.2.3-rc.1+build.5"


def _copy_version_files(dest: Path) -> None:
    for path in {vf.path for vf in release.VERSION_FILES}:
        (dest / path).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(REPO_ROOT / path, dest / path)


def test_write_version_updates_every_file_and_nothing_else(tmp_path: Path) -> None:
    _copy_version_files(tmp_path)
    current = release.read_current_version(tmp_path)
    lock_before = (tmp_path / "frontend/package-lock.json").read_text()

    touched = release.write_version(tmp_path, V("9.8.7-rc.1"))

    assert release.read_current_version(tmp_path) == V("9.8.7-rc.1")
    assert {str(p) for p in touched} == {str(vf.path) for vf in release.VERSION_FILES}
    lock_after = (tmp_path / "frontend/package-lock.json").read_text()
    changed = [
        (a, b) for a, b in zip(lock_before.splitlines(), lock_after.splitlines()) if a != b
    ]
    assert len(changed) == 2
    assert all(str(current) in a and "9.8.7-rc.1" in b for a, b in changed)
    manifest = json.loads((tmp_path / "custom_components/weather_graph/manifest.json").read_text())
    assert manifest["version"] == "9.8.7-rc.1"


def test_read_current_version_reports_drift(tmp_path: Path) -> None:
    _copy_version_files(tmp_path)
    pyproject = tmp_path / "pyproject.toml"
    text = pyproject.read_text()
    current = release.read_current_version(tmp_path)
    pyproject.write_text(text.replace(f'version = "{current}"', 'version = "0.0.1"'))
    with pytest.raises(release.ReleaseError, match=r"0\.0\.1 in pyproject\.toml"):
        release.read_current_version(tmp_path)


def test_build_release_notes_groups_conventional_commits() -> None:
    notes = release.build_release_notes(
        [
            "fix(editor): preview the selected palette",
            "chore: release 1.3.0",
            "feat(card): UV time summary field",
            "feat!: drop YAML-only setup",
            "docs: explain palettes",
            "Tidy things up",
        ]
    )
    assert notes == (
        "### Features\n- UV time summary field\n- Drop YAML-only setup (breaking)\n\n"
        "### Fixes\n- Preview the selected palette\n\n"
        "### Other changes\n- Explain palettes\n- Tidy things up"
    )
    assert release.build_release_notes(["chore: release 1.0.0"]) == "- Maintenance release"


@pytest.fixture
def git_repo(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    _copy_version_files(tmp_path)
    bundle = tmp_path / release.CARD_BUNDLE
    bundle.parent.mkdir(parents=True, exist_ok=True)
    bundle.write_text("// bundle\n")

    def sh(*args: str) -> None:
        subprocess.run(args, cwd=tmp_path, check=True, capture_output=True)

    sh("git", "init", "-q", "-b", "main")
    sh("git", "config", "user.email", "dev@example.com")
    sh("git", "config", "user.name", "Dev")
    sh("git", "add", "-A")
    sh("git", "commit", "-qm", "chore: release 1.0.0")
    (tmp_path / "README.md").write_text("docs\n")
    sh("git", "add", "-A")
    sh("git", "commit", "-qm", "feat(card): add a thing")
    monkeypatch.setattr(release, "REPO_ROOT", tmp_path)
    return tmp_path


def test_main_commits_and_tags_a_release(git_repo: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []

    def fake_run(cmd: list[str], cwd: Path) -> None:
        commands.append(cmd)
        if cmd[:3] == ["npm", "run", "build:all"]:
            (git_repo / release.CARD_BUNDLE).write_text("// rebuilt\n")

    monkeypatch.setattr(release, "run", fake_run)
    current = release.read_current_version(git_repo)
    expected = release.bump_version(current, "minor")

    assert release.main(["minor", "--no-push", "--yes"]) == 0

    assert release.read_current_version(git_repo) == expected
    assert [c[:3] for c in commands] == [
        ["npm", "run", "build:all"],
        ["npm", "test"],
        [sys.executable, "-m", "pytest"],
    ]
    log = subprocess.run(
        ["git", "log", "-1", "--format=%s"], cwd=git_repo, capture_output=True, text=True
    ).stdout.strip()
    assert log == f"chore: release {expected}"
    tag_message = subprocess.run(
        ["git", "tag", "-l", "--format=%(contents)", f"v{expected}"],
        cwd=git_repo,
        capture_output=True,
        text=True,
    ).stdout
    assert "### Features\n- Add a thing" in tag_message
    status = subprocess.run(
        ["git", "status", "--porcelain"], cwd=git_repo, capture_output=True, text=True
    ).stdout
    assert status == ""


def test_main_reverts_when_the_build_fails(
    git_repo: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    def failing_run(cmd: list[str], cwd: Path) -> None:
        (git_repo / release.CARD_BUNDLE).write_text("// half-built\n")
        raise release.ReleaseError("npm run build:all failed.")

    monkeypatch.setattr(release, "run", failing_run)
    current = release.read_current_version(git_repo)

    assert release.main(["patch", "--no-push", "--yes"]) == 1

    assert release.read_current_version(git_repo) == current
    assert "build:all failed" in capsys.readouterr().err
    status = subprocess.run(
        ["git", "status", "--porcelain"], cwd=git_repo, capture_output=True, text=True
    ).stdout
    assert status == ""
    tags = subprocess.run(["git", "tag"], cwd=git_repo, capture_output=True, text=True).stdout
    assert tags == ""


def test_main_refuses_a_dirty_tree(git_repo: Path, capsys: pytest.CaptureFixture[str]) -> None:
    (git_repo / "README.md").write_text("edited\n")
    assert release.main(["patch", "--no-push", "--yes"]) == 1
    assert "uncommitted changes" in capsys.readouterr().err
