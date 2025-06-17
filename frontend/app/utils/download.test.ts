import "@/app/test-utils/mock-client";

import { MockInstance } from "@vitest/spy";

import { evaluationsGetResultsExport } from "@/app/client";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import {
  downloadFile,
  downloadFileFromApi,
  DownloadOptions,
} from "@/app/utils/download";

describe("download utils", () => {
  const features = {
    fileApi: "File API",
    objectURL: "Object URL",
  };

  describe.each([features.fileApi, features.objectURL])(
    "with %s",
    (feature) => {
      const mocks: MockInstance[] = [];

      const registerMock = <T extends MockInstance>(mock: T) => {
        mocks.push(mock);

        return mock;
      };

      const testQuery = evaluationsGetResultsExport<true>;
      const mockedGet = registerMock(vi.mocked(testQuery));

      const createObjectURL = registerMock(vi.fn());
      window.URL.createObjectURL = createObjectURL;
      const revokeObjectURL = registerMock(vi.fn());
      window.URL.revokeObjectURL = revokeObjectURL;
      const showSaveFilePicker = registerMock(vi.fn());

      let testStream: ReadableStream;
      let testLink: HTMLAnchorElement;
      let fileHandle: FileSystemFileHandle;
      let fileStream: FileSystemWritableFileStream;

      const testBlob = new Blob(["abc"], { type: "text/plain" });
      const objectUrl = "http://localhost:3000/TestURL";
      const testFilename = "testfile";

      beforeEach(() => {
        mockObjectUrl();
        mockFileApi();

        testStream = new ReadableStream({
          start(controller) {
            controller.enqueue("abc");
            controller.close();
          },
        });
      });

      afterEach(() => {
        mocks.forEach((mock) => {
          mock.mockRestore();
        });
      });

      describe.each([true, false])("with filename: %o", (withFilename) => {
        let options: DownloadOptions | undefined = undefined;

        if (withFilename) {
          options = options ?? {};
          options.filename = testFilename;
        }

        describe("downloadFileFromApi", () => {
          it("should call the API and download the file", async () => {
            mockedGet.mockResolvedValue(successfulServiceResponse(testStream));

            await downloadFileFromApi(
              mockedGet,
              {
                path: { evaluation_id: "123" },
              },
              options,
            );

            if (feature === features.objectURL) {
              validateTestLink(withFilename);
            }

            if (feature === features.fileApi) {
              validateFileApi(true, withFilename);
            }
          });
        });

        describe("downloadFile", () => {
          it.each([
            { type: "blob", data: () => testBlob, isStream: false },
            {
              type: "function returning a blob",
              data: () => async () => testBlob,
              isStream: false,
            },
            { type: "stream", data: () => testStream, isStream: true },
            {
              type: "function returning a stream",
              data: () => async () => testStream,
              isStream: true,
            },
          ])("should download a $type", async ({ data, isStream }) => {
            await downloadFile(data(), options);

            if (feature === features.objectURL) {
              validateTestLink(withFilename);
            }

            if (feature === features.fileApi) {
              validateFileApi(isStream, withFilename);
            }
          });
        });
      });

      if (feature === features.fileApi) {
        it("should abort if save dialog was closed", async () => {
          showSaveFilePicker.mockRejectedValue(
            new DOMException("Abort", "AbortError"),
          );

          await downloadFile(testBlob);

          expect(fileStream.write).not.toHaveBeenCalled();
        });
      }

      const mockFileApi = () => {
        if (feature === features.fileApi) {
          window.showSaveFilePicker = showSaveFilePicker;

          fileStream = {
            write: registerMock(vi.fn()),
            close: registerMock(vi.fn()),
          } as unknown as FileSystemWritableFileStream;

          fileHandle = {
            createWritable: registerMock(vi.fn(() => fileStream)),
          } as unknown as FileSystemFileHandle;

          showSaveFilePicker.mockResolvedValue(fileHandle);
        }
      };

      const mockObjectUrl = () => {
        if (feature === features.objectURL) {
          // @ts-expect-error showSaveFilePicker is not optional therefore we need to ignore this error
          delete window["showSaveFilePicker"];

          testLink = document.createElement("a");
          registerMock(
            vi.spyOn(testLink, "click").mockImplementation(() => {}),
          );
          registerMock(vi.spyOn(testLink, "remove"));

          registerMock(vi.spyOn(document, "createElement")).mockReturnValue(
            testLink,
          );

          createObjectURL.mockReturnValue(objectUrl);
        }
      };

      const validateFileApi = (
        isStream: boolean,
        withFilename: boolean = false,
      ) => {
        expect(showSaveFilePicker).toHaveBeenCalledWith({
          suggestedName: withFilename ? testFilename : undefined,
        });
        if (isStream) {
          expect(fileStream.write).toHaveBeenCalledWith("abc");
        } else {
          expect(fileStream.write).toHaveBeenCalledWith(testBlob);
        }
        expect(fileStream.close).toHaveBeenCalled();
      };

      const validateTestLink = (withFilename: boolean = false) => {
        expect(createObjectURL).toHaveBeenCalled();
        expect(testLink.href).toEqual(objectUrl);
        expect(testLink.download).toEqual(withFilename ? testFilename : "");
        expect(testLink.click).toHaveBeenCalled();
        expect(testLink.remove).toHaveBeenCalled();
        expect(revokeObjectURL).toHaveBeenCalled();
      };
    },
  );
});
