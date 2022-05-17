import "./InProgressText.scss";

interface InProgressTextInterface {
  items: string[];
}

export function InProgressText({
  items,
}: InProgressTextInterface): JSX.Element {
  return (
    <div className="in-progress-text">
      <div className="container">
        <ul className="list">
          {items.map((item, idx) => (
            <li className="item" key={idx}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
