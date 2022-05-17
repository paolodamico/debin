import "./SendMessage.scss";
import { Form, Field } from "kea-forms";
import { useActions, useValues } from "kea";
import { messageLogic } from "../logics/messageLogic";
import { sendLogic } from "../logics/sendLogic";
import { Button } from "../components/Button";
import clsx from "clsx";
import { InProgressText } from "../components/InProgressText";
import { InputWithCopy } from "../components/InputWithCopy";
import { NewMessageButton } from "../components/NewMessageButton";

export default function SendMessage() {
  const { binMessageHasErrors, binMessageTouched, binMessageErrors } =
    useValues(sendLogic);
  const { submitBinMessage } = useActions(sendLogic);
  const {
    sentMessageUrl,
    submissionLoading,
    submissionCompleted,
    sentMessage,
  } = useValues(messageLogic);

  return (
    <div className="scene scene-send">
      <Form
        logic={sendLogic}
        formKey="binMessage"
        enableFormOnSubmit
        className="message-form"
      >
        <Field name="message">
          {({ value, onChange }) => (
            <textarea
              placeholder="Share anything here, emojis 🔥 and multi-line supported."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
              autoCorrect="off"
              autoCapitalize="off"
              disabled={submissionLoading || submissionCompleted}
              onKeyDown={(e) =>
                e.metaKey && e.key === "Enter" && submitBinMessage()
              }
            />
          )}
        </Field>
        <div className="mt">
          <Field name="storage">
            {({ value, onChange }) => (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="waku">💨 Temporary storage (Waku)</option>
                <option value="ipfs">🌎 Permanent storage (IPFS) [Beta]</option>
              </select>
            )}
          </Field>
        </div>
        <Button
          className="mt"
          block
          type="submit"
          disabled={
            (binMessageHasErrors && binMessageTouched) || submissionCompleted
          }
          loading={submissionLoading || !!binMessageErrors.connectionReady}
          state={
            submissionCompleted
              ? "success"
              : !!binMessageErrors.connectionReady
              ? "danger"
              : undefined
          }
        >
          {binMessageErrors.connectionReady
            ? binMessageErrors.connectionReady
            : submissionLoading
            ? "Submitting"
            : submissionCompleted
            ? "Link is ready!"
            : "Submit and share"}
        </Button>
        {submissionLoading && (
          <div className="mt mb">
            <InProgressText
              items={[
                "Generating random identifier ...",
                "Encrypting your message ...",
                "Transmitting message ...",
                "Confirming with network ...",
              ]}
            />
          </div>
        )}
        <div
          className={clsx(
            "share-link",
            !submissionLoading && sentMessageUrl && "shown"
          )}
        >
          <label>
            Your link
            {sentMessage?.storage === "ipfs" &&
              " (please note IPFS propagation may take ~1 hour)"}
          </label>
          <InputWithCopy val={sentMessageUrl ?? ""} />
          <div style={{ marginTop: "3em", marginBottom: "5em" }}>
            <NewMessageButton />
          </div>
        </div>
      </Form>
    </div>
  );
}
