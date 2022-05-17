import { kea, reducers, selectors, path } from "kea";
import { loaders } from "kea-loaders";
import type { ipfsLogicType } from "./ipfsLogicType";
import { messageLogic } from "./messageLogic";

const IPFS_UPLOAD_RELAY = "https://ipfs.debin.io/";

// TODO: Convert to vanilla function
export const ipfsLogic = kea<ipfsLogicType>([
  path(["src", "logics", "ipfsLogic"]),
  loaders(() => ({
    _uploadedFile: [
      null as null | string,
      {
        uploadToIpfs: async (payload: { content: string; iv: string }) => {
          const response = await fetch(IPFS_UPLOAD_RELAY, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: new Headers({ "Content-Type": "application/json" }),
          });

          const { cid } = await response.json();

          messageLogic.actions.updateSentMessage({
            confirmed: true,
            messageId: cid,
          });

          return cid;
        },
      },
    ],
  })),
]);

export const retrieveFromIpfs = async (
  cid: string
): Promise<Record<string, string>> => {
  const response = await fetch(`https://${cid}.ipfs.dweb.link`);
  return (await response.json()) as Record<string, string>;
};
