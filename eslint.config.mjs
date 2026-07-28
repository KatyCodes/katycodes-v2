import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "outputs/**", "work/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["app/**/*.ts", "tests/**/*.ts", "vite.config.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
