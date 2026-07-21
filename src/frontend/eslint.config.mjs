import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    // Legacy UI snapshot. The active Next.js application uses the root
    // app/components/lib directories, while this source tree is kept only
    // for historical reference.
    "src/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
