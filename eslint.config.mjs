import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const TASK_TWO_ONLY =
  "Task 2 state code must not reach the landing page. Keep the landing bundle free of Redux.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/features/landing/**/*.{ts,tsx}",
      "src/app/(landing)/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react-redux", message: TASK_TWO_ONLY },
            { name: "@reduxjs/toolkit", message: TASK_TWO_ONLY },
          ],
          patterns: [
            { group: ["@/store", "@/store/**"], message: TASK_TWO_ONLY },
            {
              group: [
                "@/features/auth",
                "@/features/auth/**",
                "@/features/teams",
                "@/features/teams/**",
                "@/features/players",
                "@/features/players/**",
              ],
              message: TASK_TWO_ONLY,
            },
          ],
        },
      ],
    },
  },
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
