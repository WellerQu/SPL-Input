module.exports = {
  "extends": [
    "react-app",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "warn",
    "no-alert": "warn",
    "camelcase": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "react-hooks/rules-of-hooks": "error", // 检查 Hook 的规则
    "react-hooks/exhaustive-deps": "warn" // 检查 effect 的依赖
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}