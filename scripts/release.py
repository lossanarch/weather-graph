#!/usr/bin/env python3
"""Cut a Weather Graph release.

Bumps the semantic version everywhere it is recorded, rebuilds the bundled card,
runs the test suites, then commits, tags and pushes. Run with --dry-run first to
see what would change.

    python3 scripts/release.py patch            # 1.4.0 -> 1.4.1
    python3 scripts/release.py minor            # 1.4.1 -> 1.5.0
    python3 scripts/release.py major --pre rc   # 1.5.0 -> 2.0.0-rc.1
    python3 scripts/release.py prerelease       # 2.0.0-rc.1 -> 2.0.0-rc.2
    python3 scripts/release.py patch            # 2.0.0-rc.2 -> 2.0.0
    python3 scripts/release.py 2.1.0            # explicit version
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

REPO_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = Path("frontend")
CARD_BUNDLE = Path("custom_components/weather_graph/frontend/weather-graph-card.js")
RELEASE_SUBJECT = "chore: release "
BUMPS = ("major", "minor", "patch", "prerelease")

# https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
SEMVER_RE = re.compile(
    r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
    r"(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?"
    r"(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$"
)
PRERELEASE_ID_RE = re.compile(r"^[0-9A-Za-z-]+$")


class ReleaseError(Exception):
    """A problem the user needs to fix before releasing."""


@dataclass(frozen=True)
class Version:
    major: int
    minor: int
    patch: int
    pre: tuple[str, ...] = ()
    build: tuple[str, ...] = ()

    @classmethod
    def parse(cls, text: str) -> Version:
        match = SEMVER_RE.match(text.strip())
        if not match:
            raise ReleaseError(f"{text!r} is not a semantic version (e.g. 1.4.0 or 2.0.0-rc.1).")
        major, minor, patch, pre, build = match.groups()
        return cls(
            int(major),
            int(minor),
            int(patch),
            tuple(pre.split(".")) if pre else (),
            tuple(build.split(".")) if build else (),
        )

    def __str__(self) -> str:
        text = f"{self.major}.{self.minor}.{self.patch}"
        if self.pre:
            text += "-" + ".".join(self.pre)
        if self.build:
            text += "+" + ".".join(self.build)
        return text

    @property
    def core(self) -> Version:
        return Version(self.major, self.minor, self.patch)

    def _precedence_key(self) -> tuple:
        # A release outranks its prereleases; numeric identifiers sort below alphanumeric ones.
        pre_key = tuple((0, int(p), "") if p.isdigit() else (1, 0, p) for p in self.pre)
        return (self.major, self.minor, self.patch, 0 if self.pre else 1, pre_key)

    def __lt__(self, other: Version) -> bool:
        return self._precedence_key() < other._precedence_key()

    def __le__(self, other: Version) -> bool:
        return self._precedence_key() <= other._precedence_key()


def bump_version(current: Version, bump: str, pre_id: str | None = None) -> Version:
    """Next version for a bump keyword or an explicit version string.

    Follows npm's rules: bumping a prerelease without --pre finalises it when the
    prerelease already belongs to that bump (2.0.0-rc.2 + major -> 2.0.0).
    """
    if pre_id is not None and not PRERELEASE_ID_RE.match(pre_id):
        raise ReleaseError(f"--pre {pre_id!r} must contain only letters, digits and hyphens.")

    if bump not in BUMPS:
        if pre_id is not None:
            raise ReleaseError("--pre only applies to major, minor, patch and prerelease bumps.")
        target = Version.parse(bump)
        if target <= current:
            raise ReleaseError(f"{target} is not newer than the current version {current}.")
        return target

    if bump == "prerelease":
        pre_id = pre_id or (current.pre[0] if current.pre and not current.pre[0].isdigit() else "rc")
        if current.pre and current.pre[0] == pre_id and current.pre[-1].isdigit():
            return Version(
                current.major,
                current.minor,
                current.patch,
                (*current.pre[:-1], str(int(current.pre[-1]) + 1)),
            )
        base = current.core if current.pre else Version(current.major, current.minor, current.patch + 1)
        if current.pre and Version(base.major, base.minor, base.patch, (pre_id, "1")) <= current:
            raise ReleaseError(
                f"{base}-{pre_id}.1 would sort before {current}; pick a later identifier."
            )
        return Version(base.major, base.minor, base.patch, (pre_id, "1"))

    finalise = current.pre and pre_id is None
    if bump == "major":
        if finalise and current.minor == 0 and current.patch == 0:
            nxt = current.core
        else:
            nxt = Version(current.major + 1, 0, 0)
    elif bump == "minor":
        if finalise and current.patch == 0:
            nxt = current.core
        else:
            nxt = Version(current.major, current.minor + 1, 0)
    else:
        nxt = current.core if finalise else Version(current.major, current.minor, current.patch + 1)

    return Version(nxt.major, nxt.minor, nxt.patch, (pre_id, "1")) if pre_id else nxt


@dataclass(frozen=True)
class VersionFile:
    """A file holding the version; `pattern` captures the version in group 1."""

    path: Path
    pattern: str

    def _matches(self, root: Path) -> tuple[str, list[re.Match[str]]]:
        text = (root / self.path).read_text(encoding="utf-8")
        return text, list(re.finditer(self.pattern, text, flags=re.MULTILINE))

    def read_version(self, root: Path) -> str:
        _, matches = self._matches(root)
        if len(matches) != 1:
            raise ReleaseError(f"Expected one version in {self.path}, found {len(matches)}.")
        return matches[0].group(1)

    def write_version(self, root: Path, new: str) -> None:
        text, matches = self._matches(root)
        if len(matches) != 1:
            raise ReleaseError(f"Expected one version in {self.path}, found {len(matches)}.")
        start, end = matches[0].span(1)
        (root / self.path).write_text(text[:start] + new + text[end:], encoding="utf-8")


VERSION = r'"([^"]+)"'
VERSION_FILES = (
    VersionFile(Path("custom_components/weather_graph/manifest.json"), rf"^  \"version\": {VERSION}"),
    VersionFile(Path("frontend/package.json"), rf"^  \"version\": {VERSION}"),
    # package-lock.json repeats the version at the top and under packages[""].
    VersionFile(Path("frontend/package-lock.json"), rf"^  \"version\": {VERSION}"),
    VersionFile(
        Path("frontend/package-lock.json"),
        rf'^    "": \{{\n(?:      .*\n)*?      "version": {VERSION}',
    ),
    VersionFile(Path("pyproject.toml"), rf"^version = {VERSION}"),
    VersionFile(Path("frontend/src/weather-graph-card.ts"), rf"^const CARD_VERSION = {VERSION};"),
)


def read_current_version(root: Path = REPO_ROOT) -> Version:
    """The version every file agrees on; fails loudly if they drift apart."""
    found: dict[str, list[str]] = {}
    for vf in VERSION_FILES:
        found.setdefault(vf.read_version(root), []).append(str(vf.path))
    if len(found) != 1:
        detail = "; ".join(f"{v} in {', '.join(sorted(set(paths)))}" for v, paths in found.items())
        raise ReleaseError(f"Version files disagree: {detail}.")
    return Version.parse(next(iter(found)))


def write_version(root: Path, new: Version) -> list[Path]:
    """Rewrite every version string and return the files touched."""
    lock = root / "frontend/package-lock.json"
    expected_lock = json.loads(lock.read_text(encoding="utf-8"))
    expected_lock["version"] = str(new)
    expected_lock["packages"][""]["version"] = str(new)

    for vf in VERSION_FILES:
        vf.write_version(root, str(new))

    if json.loads(lock.read_text(encoding="utf-8")) != expected_lock:
        raise ReleaseError("Updating frontend/package-lock.json changed more than its version.")
    for path in ("custom_components/weather_graph/manifest.json", "frontend/package.json"):
        json.loads((root / path).read_text(encoding="utf-8"))
    if read_current_version(root) != new:
        raise ReleaseError("Version files did not all update; check the diff.")
    return sorted({vf.path for vf in VERSION_FILES})


def build_release_notes(subjects: list[str]) -> str:
    """Group conventional-commit subjects into Markdown release notes."""
    sections: dict[str, list[str]] = {"Features": [], "Fixes": [], "Other changes": []}
    for subject in subjects:
        if subject.startswith(RELEASE_SUBJECT):
            continue
        match = re.match(r"^(\w+)(?:\([^)]*\))?(!)?:\s*(.+)$", subject)
        kind, breaking, summary = match.groups() if match else ("", None, subject)
        line = f"- {summary[0].upper()}{summary[1:]}" if summary else f"- {subject}"
        if breaking:
            line += " (breaking)"
        if kind == "feat":
            sections["Features"].append(line)
        elif kind == "fix":
            sections["Fixes"].append(line)
        else:
            sections["Other changes"].append(line)
    blocks = [f"### {title}\n" + "\n".join(lines) for title, lines in sections.items() if lines]
    return "\n\n".join(blocks) if blocks else "- Maintenance release"


def git(*args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", *args], cwd=REPO_ROOT, capture_output=True, text=True, check=False
    )
    if check and result.returncode != 0:
        raise ReleaseError(f"git {' '.join(args)} failed:\n{result.stderr.strip()}")
    return result.stdout.strip()


def run(cmd: list[str], cwd: Path) -> None:
    print(f"$ {' '.join(cmd)}", flush=True)
    if subprocess.run(cmd, cwd=REPO_ROOT / cwd, check=False).returncode != 0:
        raise ReleaseError(f"{' '.join(cmd)} failed.")


def previous_release_ref() -> str | None:
    tag = git("describe", "--tags", "--abbrev=0", "--match", "v[0-9]*", check=False)
    if tag:
        return tag
    commit = git("log", "-1", "--format=%H", "--fixed-strings", f"--grep={RELEASE_SUBJECT}")
    return commit or None


def commit_subjects_since(ref: str | None) -> list[str]:
    log = git("log", "--format=%s", f"{ref}..HEAD" if ref else "HEAD")
    return [line for line in log.splitlines() if line]


def preflight(args: argparse.Namespace, tag: str) -> str:
    branch = git("rev-parse", "--abbrev-ref", "HEAD")
    if branch == "HEAD":
        raise ReleaseError("HEAD is detached; check out a branch first.")
    if branch != "main" and not args.any_branch:
        raise ReleaseError(f"Releases are cut from main, not {branch} (use --any-branch to override).")
    if git("status", "--porcelain"):
        raise ReleaseError("The working tree has uncommitted changes; commit or stash them first.")
    if git("tag", "-l", tag):
        raise ReleaseError(f"Tag {tag} already exists.")
    if not args.no_push:
        git("fetch", args.remote, branch)
        behind = git("rev-list", "--count", f"HEAD..{args.remote}/{branch}", check=False)
        if behind and behind != "0":
            raise ReleaseError(
                f"{branch} is {behind} commit(s) behind {args.remote}/{branch}; pull first."
            )
    return branch


def parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bump the version, rebuild, test, commit, tag and push a release.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split("\n\n", 2)[-1] if __doc__ else None,
    )
    parser.add_argument("bump", help="major, minor, patch, prerelease, or an explicit version")
    parser.add_argument("--pre", metavar="ID", help="make a prerelease, e.g. --pre rc -> X.Y.Z-rc.1")
    parser.add_argument("--dry-run", action="store_true", help="show what would happen, change nothing")
    parser.add_argument("--skip-tests", action="store_true", help="build but skip Vitest and pytest")
    parser.add_argument("--no-push", action="store_true", help="commit and tag locally only")
    parser.add_argument("--remote", default="origin", help="remote to push to (default: origin)")
    parser.add_argument(
        "--no-github-release",
        action="store_true",
        help="don't create a GitHub release even if the gh CLI is installed",
    )
    parser.add_argument("--any-branch", action="store_true", help="allow releasing from a branch other than main")
    parser.add_argument("-y", "--yes", action="store_true", help="don't ask for confirmation")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        current = read_current_version()
        new = bump_version(current, args.bump, args.pre)
        tag = f"v{new}"
        notes = build_release_notes(commit_subjects_since(previous_release_ref()))

        print(f"Releasing {current} -> {new} (tag {tag})\n")
        print(notes, "\n")

        if args.dry_run:
            print("Would update: " + ", ".join(sorted({str(vf.path) for vf in VERSION_FILES})))
            print(f"Would rebuild {CARD_BUNDLE}" + ("" if args.skip_tests else " and run the tests"))
            print(f'Would commit "{RELEASE_SUBJECT}{new}" and tag {tag}')
            if not args.no_push:
                print(f"Would push the branch and {tag} to {args.remote}")
            return 0

        branch = preflight(args, tag)
        if not args.yes:
            answer = input(f"Cut {tag} from {branch}? [y/N] ").strip().lower()
            if answer not in {"y", "yes"}:
                print("Aborted.")
                return 1

        touched = write_version(REPO_ROOT, new)
        try:
            run(["npm", "run", "build:all"], FRONTEND_DIR)
            if not args.skip_tests:
                run(["npm", "test"], FRONTEND_DIR)
                run([sys.executable, "-m", "pytest", "-q"], Path("."))
        except ReleaseError:
            git("checkout", "--", *map(str, touched), str(CARD_BUNDLE))
            print("Reverted the version bump.", file=sys.stderr)
            raise

        git("add", *map(str, touched), str(CARD_BUNDLE))
        stray = git("status", "--porcelain", "--untracked-files=no")
        unstaged = [line for line in stray.splitlines() if line[1] != " "]
        if unstaged:
            raise ReleaseError("The build changed files outside the release:\n" + "\n".join(unstaged))
        git("commit", "-m", f"{RELEASE_SUBJECT}{new}")
        # Verbatim, or git strips the "###" headings as comments.
        git("tag", "-a", tag, "--cleanup=verbatim", "-m", f"Weather Graph {new}\n\n{notes}")
        print(f"Committed and tagged {tag}.")

        if args.no_push:
            print(f"Push when ready: git push --atomic {args.remote} {branch} {tag}")
            return 0

        git("push", "--atomic", args.remote, f"HEAD:refs/heads/{branch}", f"refs/tags/{tag}")
        print(f"Pushed {branch} and {tag} to {args.remote}.")

        if args.no_github_release:
            return 0
        if shutil.which("gh") is None:
            print("Install the GitHub CLI (gh) to publish GitHub releases automatically; "
                  "HACS offers versions from GitHub releases.")
            return 0
        gh = ["gh", "release", "create", tag, "--title", tag, "--notes", notes, "--verify-tag"]
        if new.pre:
            gh.append("--prerelease")
        run(gh, Path("."))
        return 0
    except ReleaseError as err:
        print(f"release: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
