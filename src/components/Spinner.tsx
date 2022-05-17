import clsx from "clsx";
import "./Spinner.scss";

interface SpinnerInterface {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "sm" }: SpinnerInterface): JSX.Element {
  return <div className={clsx("spinner", size)} />;
}
