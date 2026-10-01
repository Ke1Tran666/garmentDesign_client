/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",

  tailwindStylesheet: "./src/shared/styles/index.css",

  tailwindFunctions: ["clsx", "cn", "cva", "twMerge"],

  // Plugin Tailwind phải đặt cuối nếu sau này có thêm plugin.
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
