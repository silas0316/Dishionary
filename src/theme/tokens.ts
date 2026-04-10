/** Programmatic access to DIshionary tokens (mirrors tokens.css). */
export const colors = {
  red: {
    dark: "#731906",
    main: "#f23f19",
    light: "#fc8d84",
    tint: "#feedec",
  },
  green: {
    dark: "#2a400e",
    main: "#6b992e",
    light: "#8cc63f",
    tint: "#d4fdaf",
  },
  black: {
    main: "#000000",
    b500: "#2c2c2c",
    b300: "#6b6b6b",
    b100: "#9d9d9d",
    b50: "#f1f1f1",
  },
  white: "#ffffff",
  white2: "#f4f3f1",
  white80: "rgba(255,255,255,0.8)",
  white65: "rgba(255,255,255,0.65)",
} as const;

export const fonts = {
  display: '"Oleo Script", "Noto Sans Thai", cursive, serif',
  body: '"Plus Jakarta Sans", system-ui, sans-serif',
} as const;
