import { Link } from "react-router-dom";

export function TopicContinueRow({ assistantText, extraLinks = [] }) {
  return (
    <section className="topic-continue card" aria-label="Where to go next">
      <p className="topic-continue-kicker">Continue with BMW Assistant</p>
      <p className="topic-continue-lede">{assistantText}</p>
      <div className="topic-continue-actions">
        <Link to="/recommendations" className="topic-continue-primary">
          Open BMW Assistant
        </Link>
        {extraLinks.map((l) => (
          <Link key={l.to} to={l.to} className="topic-continue-secondary">
            {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
