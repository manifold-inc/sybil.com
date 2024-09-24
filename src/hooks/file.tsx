/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from "react";
import to from "await-to-js";
import { Box, FolderPlus, RotateCw, Trash, Upload } from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { match } from "ts-pattern";

import { useAuth } from "@/app/_components/providers";
import Modal from "@/components/shared/modal";
import { ACCEPT_FILES } from "@/constant";
import { Locale } from "@/locales";
import { reactClient } from "@/trpc/react";
import { formatBytes } from "@/utils/format";
import { createLogger } from "@/utils/logger";

const logger = createLogger({ prefix: "[File]" });

function uploadFileToS3(
  presignedUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ type: string; content: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Event listener for upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = event.loaded / event.total;
        onProgress?.(percentComplete);
      }
    });

    // Event listener for when the request has completed successfully
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        logger.log("File successfully uploaded to S3");
        resolve({ content: xhr.responseText, type: xhr.responseType });
      } else {
        logger.error("Failed to upload file to S3", xhr.status);
        reject(new Error(`HTTP status ${xhr.status}`));
      }
    });

    // Event listener for errors during the upload
    xhr.addEventListener("error", () => {
      logger.error("Error uploading file to S3");
      reject(new Error("An error occurred during the upload"));
    });

    // Set up and send the request
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.send(file);
  });
}

export type ThreadFile = {
  id: string; // temp nano id
  key: string; // s3 key
  status: "added" | "validating" | "uploading" | "uploaded" | "error";
  progress: number;
  file: File;
};

export function FileListModel(props: {
  files: ThreadFile[];
  updateFiles: (updater: (files: ThreadFile[]) => ThreadFile[] | void) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const createFile = reactClient.file.createFile.useMutation();
  const deleteFiles = reactClient.file.deleteFiles.useMutation();

  function updateFile(id: string, updater: (file: ThreadFile) => void) {
    props.updateFiles((files) => {
      files.forEach((_f) => {
        if (_f.id !== id) return;
        updater(_f);
      });
    });
  }

  async function uploadFile(f: ThreadFile) {
    // get presigned url
    updateFile(f.id, (file) => (file.status = "validating"));

    const [error, presigned] = await to(
      createFile.mutateAsync({
        name: f.file.name,
        mime: f.file.type,
        size: f.file.size,
      }),
    );

    if (error) {
      updateFile(f.id, (file) => (file.status = "error"));
      logger.error(error);
      return;
    }

    updateFile(f.id, (file) => {
      file.key = presigned.key;
      file.status = "uploading";
    });

    const [uploadError] = await to(
      uploadFileToS3(presigned?.presignedUrl, f.file, (percent) => {
        updateFile(f.id, (file) => (file.progress = percent));
      }),
    );

    if (uploadError) {
      updateFile(f.id, (file) => (file.status = "error"));
      logger.error(error);
      return;
    }

    updateFile(f.id, (file) => {
      file.status = "uploaded";
    });
  }

  // select files from disk
  function addFiles() {
    const dom = document.createElement("input");
    dom.accept = ACCEPT_FILES.join(",");
    dom.type = "file";
    dom.multiple = true;

    dom.addEventListener("change", () => {
      logger.log("got files", dom.files);
      if (dom.files) {
        const newFiles = Array.from(dom.files).map((f) => {
          return {
            id: nanoid(),
            file: f,
            status: "added",
            progress: 0,
          } as ThreadFile;
        });

        props.updateFiles((files) => {
          return files.concat(newFiles);
        });

        newFiles.forEach(uploadFile);
      }
    });

    dom.click();
  }

  const { status } = useAuth();

  return (
    <>
      <button
        onClick={() => {
          if (status === "UNAUTHED") {
            toast.error("You need to be signed for file searches");
            return;
          }
          setIsOpen(true);
        }}
        disabled={status === "LOADING"}
        className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium text-gray-600"
      >
        <FolderPlus className="h-5 w-5" />
        {props.files.length ? (
          <>
            {props.files.length} {Locale.Home.FileButton}
          </>
        ) : (
          Locale.Home.FileButton
        )}
      </button>
      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={Locale.FileList.Title}
      >
        {props.files.length === 0 && (
          <div className="flex w-full flex-col items-center justify-center py-8 opacity-50">
            <Box width={25} height={24} />
            <div className="mt-2 text-xs dark:text-gray-800">
              {Locale.FileList.Empty}
            </div>
          </div>
        )}

        <div className="mt-2 flex flex-col">
          {props.files.map((f, i) => {
            return (
              <div
                key={i}
                className="relative z-20 mb-2 flex items-center justify-between rounded-md border bg-gray-50 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              >
                <div
                  style={{ width: f.progress * 100 + "%" }}
                  className="absolute bottom-0 left-0 top-0 -z-10 h-full bg-neutral-900 transition-all"
                />
                <div className="flex-1">
                  <div className="truncate text-sm font-semibold">
                    {f.file.name}
                  </div>
                  <div className="mt-1 text-xs">{formatBytes(f.file.size)}</div>
                </div>
                {match(f.status)
                  .with("added", () => {
                    return (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            void uploadFile(f);
                          }}
                        >
                          <Upload />
                        </button>
                        <button
                          onClick={() => {
                            props.updateFiles((files) => {
                              files.splice(i, 1);
                            });
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                  .with("uploading", () => {
                    return (
                      <div className="text-xs">
                        {(f.progress * 100).toFixed(0)}%
                      </div>
                    );
                  })
                  .with("uploaded", () => {
                    return (
                      <button
                        onClick={() => {
                          props.updateFiles((files) => {
                            files.splice(i, 1);
                          });
                          if (f.key) {
                            deleteFiles.mutate({ keys: [f.key] });
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    );
                  })
                  .with("error", () => {
                    return (
                      <div className="flex gap-2">
                        <button onClick={() => void uploadFile(f)}>
                          <RotateCw /> Retry
                        </button>
                        <button
                          onClick={() => {
                            props.updateFiles((files) => {
                              files.splice(i, 1);
                            });
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                  .otherwise(() => (
                    <div className="text-xs">{f.status}</div>
                  ))}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end text-gray-800">
          <button className="inline-flex items-center gap-2" onClick={addFiles}>
            <Upload className="h-4 w-4" />
            {Locale.FileList.Add}
          </button>
        </div>
      </Modal>
    </>
  );
}
