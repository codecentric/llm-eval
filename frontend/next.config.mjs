import createMDX from "@next/mdx";
import { config as dotenvConfig } from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: "standalone",
  eslint: {
    dirs: ["."],
  },
  transpilePackages: ["echarts", "zrender"],
  env: {
    // This will load variables from .env.services
    // TODO: this should be changed for containerized environment.
    ...(process.env.RUN_IN_CONTAINER
      ? {}
      : {
          ...dotenvConfig({
            path: "../.env.services",
          }).parsed,
          ...dotenvConfig({ path: "../.env" }).parsed,
        }),
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [
      ["remark-gfm"],
      ["remark-frontmatter"],
      ["remark-mdx-frontmatter", { name: "metadata" }],
    ],
    rehypePlugins: [],
  },
});

export default withNextIntl(withMDX(nextConfig));
