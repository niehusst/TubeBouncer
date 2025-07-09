import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: { 
      sourceType: "module",
      globals: { ...globals.browser, ...globals.webextensions },
    }
  },
  // {
  //   files: ["**/*.js"],
  //   languageOptions: { globals.browser }
  // },
  // {
  //   files: ["**/*.js"],
  //   languageOptions: { globals: globals.webextensions }
  // },
  pluginJs.configs.recommended,
];
