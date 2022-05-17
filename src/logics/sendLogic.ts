import { connect, kea, listeners, path, selectors } from "kea";
import { forms } from "kea-forms";
import { ConnectionStatus, MessageForm } from "../types";
import { connectionLogic } from "./connectionLogic";
import { messageLogic } from "./messageLogic";

import type { sendLogicType } from "./sendLogicType";

export const sendLogic = kea<sendLogicType>([
  path(["src", "logics", "sendLogic"]),
  connect({
    actions: [connectionLogic, ["setConnectionStatus"]],
  }),
  forms(() => ({
    // Message to be sent
    binMessage: {
      defaults: {
        message: "",
        password: "",
        connectionReady: false,
        storage: "waku",
      } as MessageForm,
      errors: ({ message, connectionReady, storage }) => ({
        message: !message
          ? "You don't want to send an empty message, right?"
          : undefined,
        connectionReady:
          !connectionReady && storage === "waku"
            ? "Please wait until a connection to the network is established"
            : undefined,
      }),
      submit: async (payload, breakpoint) => {
        // TODO: Prevent submission if Waku is not ready
        messageLogic.actions.encodeAndSend(payload);
        breakpoint();
      },
    },
  })),
  listeners(({ actions }) => ({
    setConnectionStatus: async ({ status }) => {
      if (status === ConnectionStatus.Ready) {
        actions.setBinMessageValue("connectionReady", true);
      }
    },
  })),
]);
