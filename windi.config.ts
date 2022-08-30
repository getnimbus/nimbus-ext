import defaultTheme from "windicss/defaultTheme";
import { defineConfig } from "windicss/helpers";

function rem2px(input, fontSize = 16) {
  if (input == null) {
    return input;
  }
  switch (typeof input) {
    case "object":
      if (Array.isArray(input)) {
        return input.map((val) => rem2px(val, fontSize));
      } else {
        const ret = {};
        for (const key in input) {
          ret[key] = rem2px(input[key]);
        }
        return ret;
      }
    case "string":
      return input.replace(
        /(\d*\.?\d+)rem$/,
        (_, val) => parseFloat(val) * fontSize + "px"
      );
    default:
      return input;
  }
}

console.log({
  default: defaultTheme.borderRadius,
  change: rem2px(defaultTheme.borderRadius),
});
export default defineConfig({
  content: ["./src/**/*.{html,js,svelte}"],
  darkMode: "media",
  theme: {
    borderRadius: rem2px(defaultTheme.borderRadius),
    columns: rem2px(defaultTheme.columns),
    fontSize: rem2px(defaultTheme.fontSize),
    lineHeight: rem2px(defaultTheme.lineHeight),
    maxWidth: rem2px(defaultTheme.maxWidth),
    spacing: rem2px(defaultTheme.spacing),
    minHeight: rem2px(defaultTheme.minHeight),
    width: rem2px(defaultTheme.width),
    height: rem2px(defaultTheme.height),
  },
});
