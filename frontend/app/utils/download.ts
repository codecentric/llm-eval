import { Options } from "@hey-api/client-fetch";

import { withConfig } from "@/app/utils/backend-client/client";
import {
  DataShape,
  ServiceCall,
  ServiceCallOptionalOptions,
  ServiceCallRequiredOptions,
} from "@/app/utils/backend-client/service-call";

export type DownloadOptions = {
  filename?: string;
  onStart?: () => Promise<void> | void;
  onFinish?: () => Promise<void> | void;
};

export async function downloadFileFromApi<
  Data extends DataShape,
  Response,
  TError,
>(
  service: ServiceCallOptionalOptions<Data, Response, TError, true>,
  options?: Options<Data, true>,
  downloadOptions?: DownloadOptions,
): Promise<void>;

export async function downloadFileFromApi<
  Data extends DataShape,
  Response,
  TError,
>(
  service: ServiceCallRequiredOptions<Data, Response, TError, true>,
  options: Options<Data, true>,
  downloadOptions?: DownloadOptions,
): Promise<void>;

export async function downloadFileFromApi<
  Data extends DataShape,
  Response,
  TError,
>(
  service: ServiceCall<Data, Response, TError, true>,
  options: Options<Data, true> | undefined,
  downloadOptions?: DownloadOptions,
): Promise<void> {
  const getData = async () => {
    // @ts-expect-error fine for runtime
    const response = await withConfig(service)({
      ...options,
      throwOnError: true,
      parseAs: "stream",
    });

    return response.data as ReadableStream;
  };

  await downloadFile(getData, downloadOptions);
}

export type BlobDownloadData = Blob | (() => Promise<Blob>);
export type StreamDownloadData =
  | ReadableStream
  | (() => Promise<ReadableStream>);
export type DownloadData = BlobDownloadData | StreamDownloadData;

export const downloadFile = async (
  data: DownloadData,
  downloadOptions?: DownloadOptions,
) => {
  try {
    if ("showSaveFilePicker" in window) {
      await downloadWithFileApi(data, downloadOptions);
    } else {
      await downloadWithObjectUrl(data, downloadOptions);
    }
  } finally {
    await downloadOptions?.onFinish?.();
  }
};

const downloadWithFileApi = async (
  data: DownloadData,
  downloadOptions?: DownloadOptions,
) => {
  try {
    const newHandle = await window.showSaveFilePicker({
      suggestedName: downloadOptions?.filename,
    });

    await downloadOptions?.onStart?.();

    const writableStream = await newHandle.createWritable();

    try {
      await writeFile(writableStream, data);
    } finally {
      await writableStream.close();
    }
  } catch (e) {
    if (e instanceof DOMException) {
      if (e.name === "AbortError") {
        // do not throw an exception if the download dialog was aborted
        return;
      }
    }

    throw e;
  }
};

const downloadWithObjectUrl = async (
  data: DownloadData,
  downloadOptions?: DownloadOptions,
) => {
  await downloadOptions?.onStart?.();

  const url = URL.createObjectURL(await createFileBlob(data));

  try {
    const downloadElement = document.createElement("a");
    document.body.appendChild(downloadElement);

    try {
      downloadElement.href = url;
      if (downloadOptions?.filename) {
        downloadElement.download = downloadOptions?.filename;
      }
      downloadElement.click();
    } finally {
      downloadElement.remove();
    }
  } finally {
    window.URL.revokeObjectURL(url);
  }
};

const createFileBlob = async (data: DownloadData) => {
  const fileData = typeof data === "function" ? await data() : data;

  if (fileData instanceof ReadableStream) {
    const chunks = [];

    const reader = fileData.getReader();

    // can't use async iterator here because of Safari
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
    }

    return new Blob(chunks);
  } else {
    return fileData;
  }
};

const writeFile = async (
  writableStream: FileSystemWritableFileStream,
  data: DownloadData,
) => {
  const fileData = typeof data === "function" ? await data() : data;

  if (fileData instanceof ReadableStream) {
    for await (const chunk of fileData) {
      await writableStream.write(chunk);
    }
  } else {
    await writableStream.write(fileData);
  }
};
