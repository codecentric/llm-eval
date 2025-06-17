import {
  callApi as clientCallApi,
  withConfig as withClientConfig,
} from "@/app/utils/backend-client/client";
import {
  callApi as serverCallApi,
  withConfig as withServerConfig,
} from "@/app/utils/backend-client/server";

vi.mock("@/app/utils/backend-client/client");
vi.mock("@/app/utils/backend-client/server");
vi.mock("@/app/client");

vi.mocked(withClientConfig).mockImplementation((call) => call);
vi.mocked(withServerConfig).mockImplementation((call) => call);

vi.mocked(clientCallApi).mockImplementation((call, options) =>
  call(options).then((r) => r.data),
);

vi.mocked(serverCallApi).mockImplementation((call, options) =>
  call(options).then((r) => r.data),
);
