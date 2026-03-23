import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Cấu hình riêng cho các quy tắc (rules)
    rules: {
      // Cho phép sử dụng 'any'
      "@typescript-eslint/no-explicit-any": "off",
      // Thêm dòng này nếu muốn cho phép dùng 'any' trong mảng/rest params
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;