import { actions, kea, listeners, path, reducers, selectors } from "kea";
import { urlToAction } from "kea-router";
import {
  BinMessageInterface,
  ConnectionStatus,
  RetrieveErrors,
  RetrieveParams,
} from "../types";
import { sceneLogic, urls } from "./sceneLogic";
import type { retrieveLogicType } from "./retrieveLogicType";
import { messageLogic } from "./messageLogic";
import { connectionLogic } from "./connectionLogic";

export const retrieveLogic = kea<retrieveLogicType>([
  path(["src", "logics", "appLogic"]),
  actions({
    setParams: (params: RetrieveParams) => ({ params }),
    setRetrievedMessage: (message: BinMessageInterface) => ({ message }),
    setRetrieveMessageError: (error: RetrieveErrors) => ({ error }),
  }),
  reducers({
    params: [
      null as RetrieveParams | null,
      {
        setParams: (_, { params }) => params,
      },
    ],
    retrievedMessage: [
      null as BinMessageInterface | null,
      {
        setRetrievedMessage: (_, { message }) => message,
      },
    ],
    retrievedMessageError: [
      null as RetrieveErrors | null,
      {
        setRetrieveMessageError: (_, { error }) => error,
      },
    ],
  }),
  listeners(({ values, actions }) => ({
    [connectionLogic.actionTypes.setConnectionStatus]: async ({ status }) => {
      if (
        values.params?.encryptionKey &&
        status === ConnectionStatus.Ready &&
        !values.retrievedMessage
      ) {
        messageLogic.actions.retrieveMessage(
          values.params.messageId,
          values.params.encryptionKey,
          values.params.storage
        );
      }
    },
    setParams: async ({ params }) => {
      if (!params.encryptionKey) {
        actions.setRetrieveMessageError(RetrieveErrors.MissingEncryptionKey);
      }

      if (
        connectionLogic.values.connectionStatus === ConnectionStatus.Ready &&
        params.encryptionKey
      ) {
        messageLogic.actions.retrieveMessage(
          params.messageId,
          params.encryptionKey,
          params.storage
        );
      }
    },
  })),
  selectors(() => ({
    retrievedMessageUrl: [
      (s) => [s.params],
      (params): string | null =>
        params
          ? // Note: Using hash routing for now
            `${window.location.origin}/#/m/${params.messageId}?key=${params.encryptionKey}`
          : null,
    ],
  })),
  urlToAction(({ actions, values }) => ({
    [urls.retrieveMessage(":messageId")]: ({ messageId }, { key, s }) => {
      if (!messageId) {
        throw new Error("`messageId` must be set.");
      }
      actions.setParams({ messageId, encryptionKey: key, storage: s });
    },
    "/*": () => {
      // :TRICKY: Deploying on IPFS doesn't support well root routing of any path to the same SPA. Non-pretty hack below.
      if (window.location.hash.replace("#", "").startsWith("/m/")) {
        const { messageId, key, storage } = sceneLogic.values.params;
        actions.setParams({ messageId, encryptionKey: key, storage });
      }
    },
  })),
]);
