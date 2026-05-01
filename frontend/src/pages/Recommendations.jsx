import { useMemo, useState } from "react";
import { fetchRecommendations } from "../services/recommendApi";

const BODY_TYPES = ["suv", "saloon", "hatchback", "coupe"];

const DEFAULT_FORM = {
  max_budget_gbp: 50000,
  min_seats: 5,
  preferred_body_types: ["suv"],
  powertrain_preference: "any",
  family_important: true,
  luxury_important: false,
  performance_important: false,
  debug_scores: false,
};

function Recommendations({ onRecommendationsChange, onOpenAssistant }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const preferencesPayload = useMemo(() => {
    const preferred_body_types = BODY_TYPES.filter((b) => form.preferred_body_types.includes(b));
    const minSeats =
      form.min_seats === "" || form.min_seats === null || typeof form.min_seats === "undefined"
        ? null
        : Number(form.min_seats);

    return {
      max_budget_gbp: Number(form.max_budget_gbp),
      min_seats: minSeats,
      preferred_body_types,
      powertrain_preference: form.powertrain_preference,
      family_important: Boolean(form.family_important),
      luxury_important: Boolean(form.luxury_important),
      performance_important: Boolean(form.performance_important),
    };
  }, [form]);

  const toggleBodyType = (body) => {
    setForm((prev) => {
      const set = new Set(prev.preferred_body_types);
      if (set.has(body)) set.delete(body);
      else set.add(body);
      return { ...prev, preferred_body_types: Array.from(set) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchRecommendations(preferencesPayload, {
        debugScores: Boolean(form.debug_scores),
      });
      setResult(data);

      const ids = (data.recommendations || []).map((r) => r.model_id).filter(Boolean);
      onRecommendationsChange?.(ids);
    } catch (err) {
      console.error(err);
      setError("We could not reach the recommendation service. Please confirm the API is running locally on port 8000.");
      setResult(null);
      onRecommendationsChange?.([]);
    } finally {
      setLoading(false);
    }
  };

  const clearRecommendations = () => {
    setResult(null);
    onRecommendationsChange?.([]);
  };

  const recommendations = result?.recommendations || [];
  const hasResults = recommendations.length > 0;

  return (
    <div className="rec-page">
      <header className="rec-hero card">
        <div className="rec-hero-copy">
          <h1>BMW Assistant</h1>
          <p className="rec-lede">
            Adjust the inputs to your liking and allow the system to use its personal knowledge base (not just scour the
            internet) to make tailored recommendations for you.
          </p>
        </div>
        <div className="rec-hero-aside" aria-label="What does this do?">
          <p className="rec-aside-title">What does this do?</p>
          <ul className="rec-aside-list">
            <li>Some checkboxes for your preferences</li>
            <li>It will return a ranked list of the 3 most suitable cars for you based on your input</li>
            <li>You can then use the chat if you would like further tailored information</li>
          </ul>
        </div>
      </header>

      <div className="rec-layout">
        <section className="rec-panel card" aria-labelledby="preferences-heading">
          <div className="rec-panel-header">
            <h2 id="preferences-heading">Your preferences</h2>
            <p className="rec-panel-subtitle">Adjust the inputs to reflect how you plan to use your BMW.</p>
          </div>

          <form onSubmit={handleSubmit} className="rec-form">
            <label className="rec-field">
              <span className="rec-label">Maximum budget (£)</span>
              <input
                type="number"
                min="5000"
                step="500"
                value={form.max_budget_gbp}
                onChange={(e) => setForm({ ...form, max_budget_gbp: e.target.value })}
                required
              />
            </label>

            <label className="rec-field">
              <span className="rec-label">Minimum seats (optional)</span>
              <input
                type="number"
                min="2"
                max="9"
                value={form.min_seats}
                onChange={(e) => setForm({ ...form, min_seats: e.target.value })}
              />
            </label>

            <div className="rec-field">
              <span className="rec-label">Preferred body styles</span>
              <div className="rec-chip-grid" role="group" aria-label="Preferred body styles">
                {BODY_TYPES.map((b) => {
                  const selected = form.preferred_body_types.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      className={`rec-chip${selected ? " rec-chip--active" : ""}`}
                      aria-pressed={selected}
                      onClick={() => toggleBodyType(b)}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
              <p className="rec-hint">Clear every body style if you want the assistant to stay neutral on silhouette.</p>
            </div>

            <label className="rec-field">
              <span className="rec-label">Powertrain preference</span>
              <select
                value={form.powertrain_preference}
                onChange={(e) => setForm({ ...form, powertrain_preference: e.target.value })}
              >
                <option value="any">Any</option>
                <option value="ev_only">EV only</option>
                <option value="no_ev">No EV</option>
                <option value="hybrid_ok">Hybrid OK</option>
              </select>
            </label>

            <div className="rec-priority-grid" role="group" aria-label="Priority flags">
              <label className="rec-check">
                <input
                  type="checkbox"
                  checked={form.family_important}
                  onChange={(e) => setForm({ ...form, family_important: e.target.checked })}
                />
                <span>Family practicality matters</span>
              </label>
              <label className="rec-check">
                <input
                  type="checkbox"
                  checked={form.luxury_important}
                  onChange={(e) => setForm({ ...form, luxury_important: e.target.checked })}
                />
                <span>Luxury and refinement matter</span>
              </label>
              <label className="rec-check">
                <input
                  type="checkbox"
                  checked={form.performance_important}
                  onChange={(e) => setForm({ ...form, performance_important: e.target.checked })}
                />
                <span>Performance matters</span>
              </label>
            </div>

            <label className="rec-check rec-check--inline">
              <input
                type="checkbox"
                checked={form.debug_scores}
                onChange={(e) => setForm({ ...form, debug_scores: e.target.checked })}
              />
              <span>Include technical scoring appendix (for evaluators)</span>
            </label>

            <div className="rec-actions">
              <button type="submit" className="rec-btn rec-btn--primary" disabled={loading}>
                {loading ? "Generating shortlist..." : "Generate shortlist"}
              </button>
              <button type="button" className="rec-btn rec-btn--ghost" onClick={clearRecommendations}>
                Reset shortlist
              </button>
            </div>
          </form>

          {error && <p className="rec-error">{error}</p>}
        </section>

        <section className="rec-panel card" aria-labelledby="results-heading">
          <div className="rec-panel-header">
            <h2 id="results-heading">Your shortlist</h2>
            <p className="rec-panel-subtitle">
              Each card explains why a model surfaced so you can compare trade-offs with confidence.
            </p>
          </div>

          {!hasResults && (
            <div className="rec-empty">
              <p className="rec-empty-title">No shortlist yet</p>
              <p className="rec-empty-copy">
                Complete the preference form on the left and generate a shortlist. Results appear here instantly once the
                service responds.
              </p>
            </div>
          )}

          {hasResults && (
            <>
              <div className="rec-inline-note" role="status">
                BMW Assistant now prioritises these models when you ask follow-up questions, while still referencing the
                wider BMW knowledge base when helpful.
              </div>

              <div className="rec-results-grid">
                {recommendations.map((r) => (
                  <article key={r.model_id} className="rec-result-card">
                    <div className="rec-result-top">
                      <div>
                        <h3 className="rec-result-title">{r.model_name}</h3>
                        <p className="rec-result-meta">
                          From £{Number(r.price_gbp).toLocaleString("en-GB")} | {r.body_type} | {r.powertrain}
                          {typeof r.range_miles === "number" ? ` | ${r.range_miles} mi EV range` : ""} | {r.seats} seats
                        </p>
                      </div>
                      <div className="rec-score-pill" aria-label="Overall match score">
                        <span className="rec-score-label">Match</span>
                        <span className="rec-score-value">{r.total_score}</span>
                      </div>
                    </div>

                    <div className="rec-section-label">Why this model fits</div>
                    <ul className="rec-bullets">
                      {r.explanation_bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </>
          )}

          {result?.debug_scores && (
            <details className="rec-appendix">
              <summary>Appendix: scoring telemetry</summary>
              <pre>{JSON.stringify(result.debug_scores, null, 2)}</pre>
            </details>
          )}
        </section>
      </div>

      <section className="rec-assistant rec-assistant--prominent card" aria-label="BMW Assistant on this page">
        <div className="rec-assistant-text">
          <p className="rec-kicker">On this page only</p>
          <h2 className="rec-assistant-title">BMW Assistant chat</h2>
          <p className="rec-assistant-copy">
            Ask follow-ups grounded in this project's knowledge base. After you generate a shortlist, answers prioritise
            those models and still pull general BMW topics when useful.
          </p>
          <div className="rec-assistant-actions">
            <button type="button" className="rec-assistant-open-btn" onClick={() => onOpenAssistant?.()}>
              Open BMW Assistant
            </button>
            <p className="rec-assistant-hint">You can also use the BMW Assistant control in the lower-right corner.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Recommendations;
