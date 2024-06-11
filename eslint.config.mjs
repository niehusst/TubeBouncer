import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  {languageOptions: { globals: globals.webextensions }},
  pluginJs.configs.recommended,
];
