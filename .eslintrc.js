module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  extends: [
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["import", "@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-expressions": ["off"],
    "comma-dangle": ["error", "always-multiline"],
    "max-len": ["warn", { code: 100, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreComments: true }],
    "no-async-promise-executor": ["off"],
    "no-empty-pattern": ["off"],
    "no-prototype-builtins": ["off"],
    "no-undef": ["error"],
    "no-var": ["error"],
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "double", { allowTemplateLiterals: true, avoidEscape: true }],
    "semi": ["error", "always"],
    "sort-keys": ["off"],
    "spaced-comment": ["off"],
  },
};
