import { useValues } from "kea";
import React from "react";
import { connectionLogic } from "../logics/connectionLogic";
import "./Header.scss";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { ConnectionStatus } from "../types";
import clsx from "clsx";

export function Header(): JSX.Element {
  return (
    <header className="header">
      <div className="header-inner-main">
        <div className="logo-container">
          <Logo />
        </div>
        <div>
          <h1>Debin</h1>
          <div className="tagline">
            Decentralized sharing of temporary information and secrets. Easy &
            secure.{" "}
            <a href="https://github.com/paolodamico/debin" target="_blank">
              How it works?
            </a>
          </div>
        </div>
      </div>
      <ConnectionState />
    </header>
  );
}

function ConnectionState(): JSX.Element {
  const { connectionStatus } = useValues(connectionLogic);

  return (
    <div className="connection-status">
      <span
        className={clsx(
          "indicator",
          connectionStatus === ConnectionStatus.Ready && "connected"
        )}
      />
      {connectionStatus === ConnectionStatus.Ready
        ? "Connected to network"
        : "Connecting ..."}
    </div>
  );
}
