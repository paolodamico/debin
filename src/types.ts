import protobuf from "protobufjs";

export type StorageType = "waku" | "ipfs";

export enum ConnectionStatus {
  Uninitialized = "uninitialized",
  Initialized = "initialized",
  Connecting = "connecting",
  Ready = "ready",
}

export enum RetrieveErrors {
  MissingEncryptionKey = "missingEncryptionKey",
  NotFound = "notFound",
  InvalidIPFSFile = "invalidIPFSFile",
}

export interface MessageForm {
  message: string;
  password: string;
  storage: StorageType;
  connectionReady: boolean; // For internal use to ensure messages are only submitted after a connection is established
}

export interface SentMessageInterface {
  messageId?: string;
  encryptionKey: string; // URL-friendly encryption key
  contentHash: string;
  contentTopic?: string;
  storage: StorageType;
  confirmed?: boolean; // After confirmation has been received from relay nodes with the message and hash is verified
  submissionStartTime: number; // Time when the submission started
}

export interface BinMessageInterface {
  timestamp: Date;
  content: string;
}

export interface RetrieveParams {
  messageId: string;
  encryptionKey?: string;
  storage: StorageType;
}

export interface BinMessagePayload
  extends Omit<BinMessageInterface, "timestamp"> {
  timestamp: number;
}

export const BinMessage = new protobuf.Type("BinMessage")
  .add(new protobuf.Field("timestamp", 1, "uint64"))
  .add(new protobuf.Field("content", 10, "string"));
