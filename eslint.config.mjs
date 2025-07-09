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
  pluginJs.configs.recommended,
];
