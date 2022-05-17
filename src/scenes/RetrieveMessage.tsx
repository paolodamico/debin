import { useValues } from "kea";
import { InProgressText } from "../components/InProgressText";
import { InputWithCopy } from "../components/InputWithCopy";
import { NewMessageButton } from "../components/NewMessageButton";
import { Spinner } from "../components/Spinner";
import { connectionLogic } from "../logics/connectionLogic";
import { retrieveLogic } from "../logics/retrieveLogic";
import { ConnectionStatus, RetrieveErrors } from "../types";
import { ReactComponent as IconNotFound } from "../assets/icon-not-found.svg";
import "./RetrieveMessage.scss";

const ERROR_MESSAGES: Record<RetrieveErrors, string> = {
  [RetrieveErrors.MissingEncryptionKey]:
    "Your link is invalid (decryption key is missing). Please check it and try again.",
  [RetrieveErrors.NotFound]:
    "We couldn’t find this message. It may have been lost or your link is invalid. Please check with the sender.",
  [RetrieveErrors.InvalidIPFSFile]:
    "Your link is invalid. The IPFS CID is not a valid Debin message.",
};

function Loading(): JSX.Element {
  const { connectionStatus } = useValues(connectionLogic);
  return (
    <div className="loading">
      <Spinner size="lg" />
      <div className="mt">
        {connectionStatus === ConnectionStatus.Ready ? (
          <InProgressText
            items={[
              "Fetching message ...",
              "Decrypting message ...",
              "Preparing emojis 😉",
              "Almost there ...",
            ]}
          />
        ) : (
          <div className="connection-text">
            Connecting to decentralized network ...
          </div>
        )}
      </div>
    </div>
  );
}

function Errored({ error }: { error: RetrieveErrors }): JSX.Element {
  return (
    <div className="errored">
      <IconNotFound className="error-icon" />
      <div className="error-message">{ERROR_MESSAGES[error]}</div>
      <div style={{ marginTop: "3em" }}>
        <NewMessageButton />
      </div>
    </div>
  );
}

export default function RetrieveMessage(): JSX.Element {
  const { retrievedMessage } = useValues(retrieveLogic);
  const { retrievedMessageUrl, retrievedMessageError } =
    useValues(retrieveLogic);

  if (retrievedMessageError) {
    return (
      <div className="scene scene-retrieve">
        <Errored error={retrievedMessageError} />
      </div>
    );
  }

  if (!retrievedMessage) {
    return (
      <div className="scene scene-retrieve">
        <Loading />
      </div>
    );
  }

  return (
    <div className="scene scene-retrieve">
      <div className="message-form">
        <h2>Your shared message</h2>
        <textarea value={retrievedMessage.content} disabled />
        <div className="mt">
          <InputWithCopy val={retrievedMessageUrl ?? ""} />
        </div>
        <div style={{ marginTop: "3em" }}>
          <NewMessageButton />
        </div>
      </div>
    </div>
  );
}
