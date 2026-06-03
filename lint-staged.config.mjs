export default {
  // API 2.0 app
  "apps/apiV2/**/*.{mjs,js,ts}": (filenames) => [
    `pnpm --filter apiV2 exec eslint --fix -- ${filenames.join(" ")}`,
    `pnpm --filter apiV2 exec prettier --write -- ${filenames.join(" ")}`,
  ],
  "apps/apiV2/**/*.{json,md}": (filenames) =>
    `pnpm --filter apiV2 exec prettier --write -- ${filenames.join(" ")}`,
};
