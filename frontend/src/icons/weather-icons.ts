import {
  html,
  svg,
  type SVGTemplateResult,
  type TemplateResult,
} from "lit";

export type WeatherVisualKind =
  | "sunny"
  | "clear-night"
  | "mostly-sunny"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "cloudy"
  | "light-shower-day"
  | "light-shower-night"
  | "rain"
  | "heavy-rain"
  | "storm-day"
  | "storm-night"
  | "fog"
  | "wind"
  | "snow"
  | "cyclone";

/**
 * Resolve BOM's 19 `icon_descriptor` values or standard Home Assistant condition names
 * into multi-color day/night illustrative icon variants.
 */
export function resolveWeatherVisualKind(
  iconDescriptor: string | null | undefined,
  haCondition: string | null | undefined,
  isNight: boolean
): WeatherVisualKind {
  const desc = (iconDescriptor ?? "").trim().toLowerCase();

  switch (desc) {
    case "sunny":
      return isNight ? "clear-night" : "sunny";
    case "clear":
      return isNight ? "clear-night" : "sunny";
    case "mostly_sunny":
      return isNight ? "partly-cloudy-night" : "mostly-sunny";
    case "partly_cloudy":
      return isNight ? "partly-cloudy-night" : "partly-cloudy-day";
    case "cloudy":
      return "cloudy";
    case "light_shower":
    case "light_showers":
    case "light_rain":
    case "shower":
    case "showers":
      return isNight ? "light-shower-night" : "light-shower-day";
    case "rain":
    case "heavy_shower":
    case "heavy_showers":
      return "heavy-rain";
    case "storm":
    case "storms":
      return isNight ? "storm-night" : "storm-day";
    case "fog":
    case "haze":
    case "hazy":
    case "dust":
    case "dusty":
      return "fog";
    case "wind":
    case "windy":
      return "wind";
    case "snow":
    case "frost":
      return "snow";
    case "cyclone":
    case "tropical_cyclone":
      return "cyclone";
  }

  const cond = (haCondition ?? "").trim().toLowerCase();
  switch (cond) {
    case "sunny":
      return isNight ? "clear-night" : "sunny";
    case "clear-night":
      return "clear-night";
    case "partlycloudy":
      return isNight ? "partly-cloudy-night" : "partly-cloudy-day";
    case "cloudy":
      return "cloudy";
    case "rainy":
      return isNight ? "light-shower-night" : "light-shower-day";
    case "pouring":
      return "heavy-rain";
    case "lightning":
    case "lightning-rainy":
      return isNight ? "storm-night" : "storm-day";
    case "fog":
      return "fog";
    case "windy":
    case "windy-variant":
      return "wind";
    case "snowy":
    case "snowy-rainy":
    case "hail":
      return "snow";
    case "exceptional":
      return "cyclone";
    default:
      return isNight ? "partly-cloudy-night" : "partly-cloudy-day";
  }
}

const sunElements = (cx = 16, cy = 15, r = 7.2) => svg`
  <g>
    <g stroke="#f6bd2b" stroke-width="2.1" stroke-linecap="round">
      <line x1=${cx} y1=${cy - r - 4.2} x2=${cx} y2=${cy - r - 1.8} />
      <line x1=${cx} y1=${cy + r + 1.8} x2=${cx} y2=${cy + r + 4.2} />
      <line x1=${cx - r - 4.2} y1=${cy} x2=${cx - r - 1.8} y2=${cy} />
      <line x1=${cx + r + 1.8} y1=${cy} x2=${cx + r + 4.2} y2=${cy} />
      <line x1=${cx - (r + 2.8) * 0.71} y1=${cy - (r + 2.8) * 0.71} x2=${cx - (r + 0.9) * 0.71} y2=${cy - (r + 0.9) * 0.71} />
      <line x1=${cx + (r + 0.9) * 0.71} y1=${cy + (r + 0.9) * 0.71} x2=${cx + (r + 2.8) * 0.71} y2=${cy + (r + 2.8) * 0.71} />
      <line x1=${cx + (r + 2.8) * 0.71} y1=${cy - (r + 2.8) * 0.71} x2=${cx + (r + 0.9) * 0.71} y2=${cy - (r + 0.9) * 0.71} />
      <line x1=${cx - (r + 0.9) * 0.71} y1=${cy + (r + 0.9) * 0.71} x2=${cx - (r + 2.8) * 0.71} y2=${cy + (r + 2.8) * 0.71} />
    </g>
    <circle cx=${cx} cy=${cy} r=${r} fill="#f8c630" />
  </g>
`;

const moonElement = (tx = 0, ty = 0) => svg`
  <path
    transform="translate(${tx}, ${ty})"
    d="M18.2 7.2A8.3 8.3 0 0 0 10.6 18.8 8.4 8.4 0 0 0 22.4 20.1 6.9 6.9 0 0 1 18.2 7.2Z"
    fill="#9eb1c4"
  />
`;

const cloudLight = (tx = 0, ty = 0) => svg`
  <path
    transform="translate(${tx}, ${ty})"
    d="M13.2 26.8H29.4A5.4 5.4 0 0 0 30.1 16.1 7.6 7.6 0 0 0 15.6 14.3 6.2 6.2 0 0 0 13.2 26.8Z"
    fill="#f1f5f9"
  />
`;

const cloudDarkBack = (tx = 0, ty = 0) => svg`
  <path
    transform="translate(${tx}, ${ty})"
    d="M9.5 23.6H23.2A4.6 4.6 0 0 0 23.8 14.5 6.4 6.4 0 0 0 11.5 13 5.2 5.2 0 0 0 9.5 23.6Z"
    fill="#94a8be"
  />
`;

const rainDrops = (count: 2 | 3 | 4 = 3, yStart = 28.5) => {
  if (count === 2) {
    return svg`
      <g fill="#4cc9f0">
        <circle cx="18.5" cy=${yStart + 1.5} r="1.45" />
        <circle cx="24.5" cy=${yStart + 3.2} r="1.45" />
      </g>
    `;
  }
  if (count === 4) {
    return svg`
      <g stroke="#4cc9f0" stroke-width="2.1" stroke-linecap="round">
        <line x1="14.5" y1=${yStart} x2="12.8" y2=${yStart + 5} />
        <line x1="19.5" y1=${yStart + 0.8} x2="17.8" y2=${yStart + 5.8} />
        <line x1="24.5" y1=${yStart} x2="22.8" y2=${yStart + 5} />
        <line x1="29.2" y1=${yStart + 0.8} x2="27.5" y2=${yStart + 5.8} />
      </g>
    `;
  }
  return svg`
    <g fill="#4cc9f0">
      <circle cx="16.5" cy=${yStart + 1.2} r="1.4" />
      <circle cx="21.5" cy=${yStart + 3.6} r="1.4" />
      <circle cx="26.2" cy=${yStart + 1.4} r="1.4" />
    </g>
  `;
};

const lightningBolt = () => svg`
  <polygon
    points="22.8,22.2 18.2,29.2 21.8,29.2 19.9,35.6 27.4,27.3 23.4,27.3"
    fill="#38bdf8"
    stroke="#0d1e33"
    stroke-width="0.6"
    stroke-linejoin="round"
  />
`;

export function renderWeatherIconInner(
  kind: WeatherVisualKind
): SVGTemplateResult {
  switch (kind) {
    case "sunny":
      return sunElements(20, 20, 8.2);

    case "clear-night":
      return svg`
        <path
          d="M23.5 8.5A11.2 11.2 0 1 0 32.5 24.5 9.2 9.2 0 0 1 23.5 8.5Z"
          fill="#cbd5e1"
        />
      `;

    case "mostly-sunny":
      return svg`
        <g>
          ${sunElements(15.5, 15.5, 6.8)}
          ${cloudLight(2, 2)}
        </g>
      `;

    case "partly-cloudy-day":
      return svg`
        <g>
          ${sunElements(15, 15, 6.5)}
          ${cloudDarkBack(5, 1)}
          ${cloudLight(1, 2.5)}
        </g>
      `;

    case "partly-cloudy-night":
      return svg`
        <g>
          ${moonElement(-1, 0)}
          ${cloudDarkBack(5, 2)}
          ${cloudLight(1, 3)}
        </g>
      `;

    case "cloudy":
      return svg`
        <g>
          ${cloudDarkBack(0, -1)}
          ${cloudLight(1, 3)}
        </g>
      `;

    case "light-shower-day":
      return svg`
        <g>
          ${sunElements(14.5, 13.5, 5.8)}
          ${cloudLight(0, 0)}
          ${rainDrops(3, 28)}
        </g>
      `;

    case "light-shower-night":
      return svg`
        <g>
          ${moonElement(-2, -2)}
          ${cloudDarkBack(4, -1)}
          ${cloudLight(0, 0.5)}
          ${rainDrops(3, 28.5)}
        </g>
      `;

    case "rain":
    case "heavy-rain":
      return svg`
        <g>
          ${cloudDarkBack(0, -2.5)}
          ${cloudLight(1, 0)}
          ${rainDrops(4, 28.2)}
        </g>
      `;

    case "storm-day":
      return svg`
        <g>
          ${sunElements(14.5, 13.8, 6.1)}
          ${cloudLight(0.5, 0.5)}
          ${lightningBolt()}
        </g>
      `;

    case "storm-night":
      return svg`
        <g>
          ${moonElement(-2, -2)}
          ${cloudDarkBack(3, -1.5)}
          ${cloudLight(0.5, 0.5)}
          ${lightningBolt()}
        </g>
      `;

    case "fog":
      return svg`
        <g>
          ${cloudLight(-1, -2)}
          <g stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round">
            <line x1="10" y1="28.5" x2="30" y2="28.5" />
            <line x1="12.5" y1="33" x2="27.5" y2="33" />
          </g>
        </g>
      `;

    case "wind":
      return svg`
        <g fill="none" stroke="#e2e8f0" stroke-width="2.3" stroke-linecap="round">
          <path d="M7 16.5H25.5A3.5 3.5 0 1 0 22 13" />
          <path d="M5 22H29.5A3.8 3.8 0 1 1 25.8 25.8" />
          <path d="M9 27.5H20.5" />
        </g>
      `;

    case "snow":
      return svg`
        <g>
          ${cloudLight(0, -1)}
          <g fill="#bae6fd">
            <circle cx="16" cy="30.5" r="1.8" />
            <circle cx="22" cy="33" r="1.8" />
            <circle cx="27.5" cy="30.5" r="1.8" />
          </g>
        </g>
      `;

    case "cyclone":
      return svg`
        <g fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
          <circle cx="20" cy="20" r="5" />
          <path d="M20 15C26 15 30 10 31 7" />
          <path d="M20 25C14 25 10 30 9 33" />
        </g>
      `;
  }
}

export function renderWeatherIconHtml(
  kind: WeatherVisualKind,
  size = 36
): TemplateResult {
  return html`
    <svg
      width=${size}
      height=${size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      ${renderWeatherIconInner(kind)}
    </svg>
  `;
}

export function renderWeatherIconInSvg(
  kind: WeatherVisualKind,
  x: number,
  y: number,
  size = 32
): SVGTemplateResult {
  return svg`
    <svg
      x=${x}
      y=${y}
      width=${size}
      height=${size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      ${renderWeatherIconInner(kind)}
    </svg>
  `;
}

export function renderRainDropletHtml(size = 18): TemplateResult {
  return html`
    <svg
      width=${size}
      height=${size}
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 2.2C10 2.2 3.2 10.4 3.2 15.1A6.8 6.8 0 0 0 16.8 15.1C16.8 10.4 10 2.2 10 2.2Z"
        fill="#4cc9f0"
      />
    </svg>
  `;
}

export function renderWindLegendArrowHtml(size = 16): TemplateResult {
  return html`
    <svg
      width=${size}
      height=${size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 2.2L16.4 17.4L10 13.9L3.6 17.4L10 2.2Z"
        fill="currentColor"
      />
    </svg>
  `;
}
