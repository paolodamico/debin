import { Waku, WakuMessage } from "js-waku";
import {
  kea,
  actions,
  reducers,
  listeners,
  afterMount,
  connect,
  path,
} from "kea";
import { loaders } from "kea-loaders";
import { ConnectionStatus } from "../types";
import { connectionLogicType } from "./connectionLogicType";
import { messageLogic } from "./messageLogic";

export const connectionLogic = kea<connectionLogicType>([
  path(["src", "logics", "connectionLogic"]),
  connect(() => ({
    values: [messageLogic, ["sentMessage"]],
  })),
  actions({
    setConnectionStatus: (status: ConnectionStatus) => ({ status }),
    setWakuInstance: (instance: Waku) => ({ instance }),
    retrieveMessage: (
      contentTopic: string,
      symmetricKey: Uint8Array,
      callback: (messages: WakuMessage[]) => void
    ) => ({
      contentTopic,
      symmetricKey,
      callback,
    }),
    initWaku: true,
  }),
  reducers({
    connectionStatus: [
      ConnectionStatus.Uninitialized as ConnectionStatus,
      {
        setConnectionStatus: (_, { status }) => status,
      },
    ],
    wakuInstance: [
      null as Waku | null,
      {
        setWakuInstance: (_, { instance }) => instance,
      },
    ],
  }),
  listeners(({ values, actions }) => ({
    initWaku: async () => {
      if (values.connectionStatus !== ConnectionStatus.Uninitialized) {
        console.warn("Waku instance already initialized.");
        return;
      }

      actions.setConnectionStatus(ConnectionStatus.Initialized);
      const waku = await Waku.create({ bootstrap: { default: true } });
      actions.setWakuInstance(waku);

      await waku.waitForRemotePeer();
      actions.setConnectionStatus(ConnectionStatus.Ready);
    },
    retrieveMessage: async ({ symmetricKey, contentTopic, callback }) => {
      if (
        !values.wakuInstance ||
        values.connectionStatus !== ConnectionStatus.Ready
      ) {
        throw new Error(
          "Cannot send message if Waku is not properly connected."
        );
      }

      // Retrieve message
      const messages = await values.wakuInstance.store.queryHistory(
        [contentTopic],
        {
          decryptionKeys: [symmetricKey],
        }
      );
      callback(messages);
    },
  })),
  loaders(({ values, actions }) => ({
    sentMessageState: [
      false,
      {
        send: async ({
          wakuMessage,
          symmetricKey,
        }: {
          wakuMessage: WakuMessage;
          symmetricKey: Uint8Array;
        }) => {
          if (
            !values.wakuInstance ||
            values.connectionStatus !== ConnectionStatus.Ready
          ) {
            throw new Error(
              "Cannot send message if Waku is not properly connected."
            );
          }

          // Send message
          await values.wakuInstance?.relay.send(wakuMessage);

          // Verify message was properly sent
          actions.retrieveMessage(
            wakuMessage.contentTopic || "",
            symmetricKey,
            messageLogic.actions.verifySentMessages
          );

          return true;
        },
      },
    ],
  })),
  afterMount(({ actions }) => {
    actions.initWaku();
  }),
]);
