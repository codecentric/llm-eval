import { Client, Config, createClient } from "@hey-api/client-fetch";

import { exceptionHandler } from "./exception-handler";

export const initClient = (config: Config): Client => {
  const client = createClient(config);
  client.interceptors.error.use(exceptionHandler);

  return client;
};
