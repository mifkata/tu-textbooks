import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [
      // dependencies and build output
      "**/node_modules/**",
      "**/dist/**",
      "**/.astro/**",
      // lock files
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      // OCR pipeline: temp working files and generated docs from source material
      "microprocessor-systems/tmp/**",
      "microprocessor-systems/docs/**",
      // subject workspaces: raw source docs, OCR output, extracted markdown
      "subjects/**",
    ],
  },
];
