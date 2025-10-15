export enum StoreKey {
  Client = "client",
  Thread = "thread",
  KV = "idb-kv",
  Block = "block",
  Answer = "answer",
  File = "file",
  Model = "model-v2",
}

export const MAX_VERSION = 99999999;

export const ACCEPT_FILES = [".txt", ".pdf"];

export enum SlotId {
  PendingTheadBlock = "thread-block-action",
  ThreadInputBox = "thread-input-box",
}

export const MOBILE_WIDTH = 640;

export enum DefaultValue {
  Avatar = "DEFAULT_AVATAR",
  ThreadIcon = "DEFAULT_THREAD_ICON",
}
