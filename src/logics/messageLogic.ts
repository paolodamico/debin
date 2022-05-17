import { generateSymmetricKey, WakuMessage } from "js-waku";
import {
  kea,
  selectors,
  path,
  actions,
  listeners,
  reducers,
  connect,
} from "kea";
import { loaders } from "kea-loaders";
import {
  BinMessage,
  BinMessageInterface,
  BinMessagePayload,
  MessageForm,
  RetrieveErrors,
  SentMessageInterface,
  StorageType,
} from "../types";
import { connectionLogic } from "./connectionLogic";
import { messageLogicType } from "./messageLogicType";
import { v4 as uuid4 } from "uuid";
import { digestToHex } from "../utils";
import { retrieveLogic } from "./retrieveLogic";
import { ipfsLogic, retrieveFromIpfs } from "./ipfsLogic";

export function parseMessage(
  wakuMessage: WakuMessage
): BinMessageInterface | null {
  // Empty message?
  if (!wakuMessage.payload) return null;

  // Decode the protobuf payload
  const { content, timestamp: rawTimestamp } = BinMessage.decode(
    wakuMessage.payload
  ) as unknown as BinMessagePayload;

  const timestamp = new Date();
  timestamp.setTime(rawTimestamp);

  return { content, timestamp };
}

export const getContentTopic = (messageId: string): string =>
  `/de-bin/0/${messageId}/proto`;

export const messageLogic = kea<messageLogicType>([
  path(["src", "logics", "messageLogic"]),
  connect({
    actions: [ipfsLogic, ["uploadToIpfs"]],
  }),
  actions({
    verifySentMessages: (messages: WakuMessage[]) => ({ messages }),
    receiveMessage: (messages: WakuMessage[]) => ({ messages }),
    updateSentMessage: (payload: Partial<SentMessageInterface>) => ({
      payload,
    }),
    retrieveMessage: (
      messageId: string,
      encryptionKey: string,
      storage: StorageType
    ) => ({
      messageId,
      encryptionKey,
      storage,
    }),
    processIpfsMessage: (
      response: Record<string, any>,
      symmetricKey: Uint8Array
    ) => ({ response, symmetricKey }),
  }),
  reducers({
    sentMessage: [
      null as null | SentMessageInterface,
      {
        updateSentMessage: (state, { payload }) =>
          state ? { ...state, ...payload } : null,
      },
    ],
  }),
  loaders(({ actions }) => ({
    sentMessage: [
      null as null | SentMessageInterface,
      {
        encodeAndSend: async ({ storage, message }: MessageForm) => {
          const submissionStartTime = new Date().getTime();

          // Generate message hash for verification
          const msgUtf8 = new TextEncoder().encode(message);
          const contentHash = digestToHex(
            await crypto.subtle.digest("SHA-256", msgUtf8)
          );

          // Generate key for encryption
          const symmetricKey = generateSymmetricKey();

          // Encode encryption key for sharing
          const encryptionKey = encodeURIComponent(
            Buffer.from(symmetricKey.buffer).toString("base64")
          );

          let messageId: string | undefined = undefined;
          let contentTopic: string | undefined = undefined;

          if (storage === "waku") {
            // Generate ContentTopic
            messageId = uuid4();
            contentTopic = getContentTopic(messageId);

            // Encode message to protobuf
            const protoMsg = BinMessage.create({
              timestamp: new Date().getTime(),
              content: message,
            });
            const wakuPayload = BinMessage.encode(protoMsg).finish();

            // Prepare message for Waku
            const wakuMessage = await WakuMessage.fromBytes(
              wakuPayload,
              contentTopic,
              {
                symKey: symmetricKey,
              }
            );

            // Send message for Waku
            connectionLogic.actions.send({ wakuMessage, symmetricKey });
          } else {
            // Encrypt payload
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encoder = new TextEncoder();
            const encodedKey = await crypto.subtle.importKey(
              "raw",
              symmetricKey.buffer,
              "AES-GCM",
              false,
              ["encrypt", "decrypt"]
            );
            const encryptedContent = Buffer.from(
              await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                encodedKey,
                encoder.encode(message)
              )
            ).toString("base64");

            // Upload to IPFS
            actions.uploadToIpfs({
              content: encryptedContent,
              iv: Buffer.from(iv).toString("base64"),
            });
          }

          return {
            encryptionKey,
            messageId,
            contentHash,
            contentTopic,
            submissionStartTime,
            storage,
          };
        },
      },
    ],
  })),
  listeners(({ values, actions }) => ({
    verifySentMessages: async ({ messages }, breakpoint) => {
      console.log("Verifying posted Waku message received...");

      if (!values.sentMessage) {
        throw new Error(
          "`sentMessage` improperly not set in `verifyIncomingSentMessage`"
        );
      }

      for (const wakuMessage of messages) {
        const parsedMessage = parseMessage(wakuMessage);

        if (parsedMessage && parsedMessage.content) {
          const candidateUtf8 = new TextEncoder().encode(parsedMessage.content);
          const candidateHash = digestToHex(
            await crypto.subtle.digest("SHA-256", candidateUtf8)
          );

          if (values.sentMessage?.contentHash === candidateHash) {
            // If submission is too fast, wait up until 7 seconds for all UI animations to complete
            const remainingTime =
              7000 -
              (new Date().getTime() - values.sentMessage.submissionStartTime);
            await breakpoint(Math.max(0, remainingTime));

            console.log("Message succesfully verified with network!");
            actions.updateSentMessage({ confirmed: true });
          }
        }
      }
    },
    receiveMessage: async ({ messages }) => {
      for (const wakuMessage of messages) {
        const parsedMessage = parseMessage(wakuMessage);

        if (parsedMessage) {
          retrieveLogic.actions.setRetrievedMessage(parsedMessage);
          return;
        }
      }

      retrieveLogic.actions.setRetrieveMessageError(RetrieveErrors.NotFound);
    },
    retrieveMessage: async ({ messageId, encryptionKey, storage }) => {
      console.log("Initiating message retrieval...");

      const symmetricKey = new Uint8Array(
        Buffer.from(decodeURIComponent(encryptionKey), "base64")
      );

      if (storage === "ipfs") {
        try {
          const response = await retrieveFromIpfs(messageId);
          actions.processIpfsMessage(response, symmetricKey);
        } catch {
          retrieveLogic.actions.setRetrieveMessageError(
            RetrieveErrors.NotFound
          );
        }
      } else {
        const contentTopic = getContentTopic(messageId);

        connectionLogic.actions.retrieveMessage(
          contentTopic,
          symmetricKey,
          actions.receiveMessage
        );
      }
    },
    processIpfsMessage: async ({ response, symmetricKey }) => {
      const { content, iv, timestamp } = response;

      if (!content || !iv || !timestamp) {
        retrieveLogic.actions.setRetrieveMessageError(
          RetrieveErrors.InvalidIPFSFile
        );
      }

      const encodedKey = await crypto.subtle.importKey(
        "raw",
        symmetricKey.buffer,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
      );

      const decoder = new TextDecoder();
      const decryptedContent = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(Buffer.from(iv, "base64")) },
        encodedKey,
        new Uint8Array(Buffer.from(content, "base64"))
      );
      retrieveLogic.actions.setRetrievedMessage({
        content: decoder.decode(decryptedContent),
        timestamp: new Date(timestamp * 1000),
      });
    },
  })),
  selectors(() => ({
    sentMessageUrl: [
      (s) => [s.sentMessage],
      (sentMessage): string | null =>
        // TODO: Consider support for non-hash routing set by an env var
        sentMessage
          ? `${window.location.origin}/#/m/${sentMessage.messageId}?key=${sentMessage.encryptionKey}&s=${sentMessage.storage}`
          : null,
    ],
    submissionLoading: [
      (s) => [s.sentMessage, s.sentMessageLoading],
      (sentMessage, sentMessageLoading): boolean =>
        sentMessageLoading || (!!sentMessage && !sentMessage.confirmed),
    ],
    submissionCompleted: [
      (s) => [s.sentMessage],
      (sentMessage): boolean => !!sentMessage?.confirmed,
    ],
  })),
]);
