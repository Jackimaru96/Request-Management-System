import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  {
    rules: {
      "no-console": 2,
      "react/react-in-jsx-scope": 0,
      "@typescript-eslint/explicit-function-return-type": 2,
      curly: [2, "all"],
      "no-plusplus": [2, { allowForLoopAfterthoughts: true }],
      complexity: [1, 20],
    },
  },
];
