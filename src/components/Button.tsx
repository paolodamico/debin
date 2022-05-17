import clsx from "clsx";
import React from "react";
import "./Button.scss";
import { Spinner } from "./Spinner";

interface ButtonInterface
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  block?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  state?: "success" | "warning" | "danger";
}

export function Button({
  block,
  className,
  disabled,
  loading,
  children,
  state,
  icon,
  ...props
}: ButtonInterface): JSX.Element {
  return (
    <button
      className={clsx("btn", className, state, block && "block")}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
