// lint-staged.config.js
export default {
  // Web app
  "apps/web/**/*.{js,ts,svelte}": (filenames) => [
    `pnpm --filter web exec eslint --fix -- ${filenames.join(" ")}`,
    `pnpm --filter web exec prettier --write -- ${filenames.join(" ")}`,
  ],
  "apps/web/**/*.{json,css,md}": (filenames) =>
    `pnpm --filter web exec prettier --write -- ${filenames.join(" ")}`,

  // API app
  "apps/api/**/*.{js,ts}": (filenames) => [
    `pnpm --filter api exec eslint --fix -- ${filenames.join(" ")}`,
    `pnpm --filter api exec prettier --write -- ${filenames.join(" ")}`,
  ],
  "apps/api/**/*.{json,css,md}": (filenames) =>
    `pnpm --filter api exec prettier --write -- ${filenames.join(" ")}`,

  // UI package
  "packages/ui/**/*.{js,ts,svelte}": (filenames) => [
    `pnpm --filter @repo/ui exec eslint --fix -- ${filenames.join(" ")}`,
    `pnpm --filter @repo/ui exec prettier --write -- ${filenames.join(" ")}`,
  ],
  "packages/ui/**/*.{json,css,md}": (filenames) =>
    `pnpm --filter @repo/ui exec prettier --write -- ${filenames.join(" ")}`,
};
