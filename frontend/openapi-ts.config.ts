import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: `${process.env.BACKEND_BASE_URL}/openapi.json`,
  output: {
    format: "prettier",
    path: "./app/client",
  },
  plugins: [
    ...defaultPlugins,
    "@hey-api/client-fetch",
    {
      enums: "typescript",
      name: "@hey-api/typescript",
    },
  ],
});
