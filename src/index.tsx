import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import { resetContext } from "kea";
import { formsPlugin } from "kea-forms";
import { loadersPlugin } from "kea-loaders";
import { routerPlugin } from "kea-router";

resetContext({
  plugins: [formsPlugin(), loadersPlugin(), routerPlugin()],
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App />);
