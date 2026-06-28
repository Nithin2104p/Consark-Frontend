module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Hooks rules (invalid usage, deps arrays)
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // JSX issues
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",

    // Accessibility basics
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",

    // TypeScript / general
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-console": "warn",
  },
};

