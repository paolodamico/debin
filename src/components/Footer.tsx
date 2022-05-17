import "./Footer.scss";
const PACKAGE = require("../../package.json");

export function Footer(): JSX.Element {
  return (
    <footer>
      <div className="footer-main">
        This project is fully open source. Contribute or clone on{" "}
        <a href={PACKAGE.repository.url} target="_blank">
          GitHub
        </a>
        . Messages are kept in the{" "}
        <a href="https://waku.org" target="_blank">
          Waku network
        </a>{" "}
        for ~30 days, but they are always encrypted.
      </div>
      <div className="rhs">Version {PACKAGE.version}</div>
    </footer>
  );
}
