import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import ts from "typescript-eslint";
import turboPlugin from "eslint-plugin-turbo";

export const config = [
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "no-console": "error",
      "turbo/no-undeclared-env-vars": "warn",
      "no-undef": "off",
    },
  },
];
