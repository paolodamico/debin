import React from "react";
import "./InputWithCopy.scss";
import { ReactComponent as IconCopy } from "../assets/icon-copy.svg";
import { ReactComponent as IconCheckCircle } from "../assets/icon-check-circle.svg";

interface InputWithCopyInterface {
  val: string;
}

export function InputWithCopy({ val }: InputWithCopyInterface): JSX.Element {
  const [isCopiedToClipboard, setIsCopiedToClipboard] = React.useState(false);

  return (
    <div className="input-with-copy-wrapper">
      <input type="text" disabled value={val} />
      <span
        className="copy-helper"
        onClick={async () => {
          await navigator.clipboard.writeText(val);
          setIsCopiedToClipboard(true);
        }}
      >
        {isCopiedToClipboard ? (
          <IconCheckCircle style={{ color: "var(--success)" }} />
        ) : (
          <IconCopy />
        )}
      </span>
    </div>
  );
}
