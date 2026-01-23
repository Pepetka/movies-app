// @ts-check
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
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
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": [
        "error",
        {
          type: "line-length",
          order: "desc",
          internalPattern: ["^\\$[^/]+/.+"],
          newlinesBetween: 1,
          sortSideEffects: true,
          groups: [
            ["builtin", "type-builtin", "external", "type-external"],
            ["internal", "type-internal"],
            ["parent", "type-parent", "sibling", "type-sibling", "side-effect"],
            "unknown",
            ["style", "side-effect-style"],
          ],
        },
      ],
    },
  },
];
