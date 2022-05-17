import { ReactComponent as IconSend } from "../assets/icon-send.svg";
import { Button } from "./Button";

export function NewMessageButton(): JSX.Element {
  /* TODO: Link handling to use router for SPA navigation */
  return (
    <a href="/">
      <Button block icon={<IconSend style={{ fontSize: "1.1em" }} />}>
        Send new message
      </Button>
    </a>
  );
}
