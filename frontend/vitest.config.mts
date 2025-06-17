import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import tsconfigPaths from "vite-tsconfig-paths";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    mdx({
      remarkPlugins: [
        remarkGfm,
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "metadata" }],
      ],
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      exclude: [
        "app/client/**", // exclude generated API client
        ...coverageConfigDefaults.exclude,
      ],
    },
    server: {
      deps: {
        inline: ["next"],
      },
    },
    setupFiles: ["./test-setup.ts"],
    env: {
      DEBUG_PRINT_LIMIT: "100000",
    },
    testTimeout: 30000,
  },
});
