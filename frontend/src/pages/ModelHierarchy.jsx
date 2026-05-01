import MCQ from "../components/MCQ";
import { TopicContinueRow } from "../components/TopicContinueRow";

function ModelHierarchy() {
  return (
    <div className="topic-page">
      <div className="card">
        <h1>Model hierarchy</h1>
        <section className="topic-practical" aria-label="In practice">
          <h2 className="topic-practical-title">In practice</h2>
          <ul className="topic-practical-list">
            <li>This helps you understand listings first before you click through.</li>
            <li>Use badges as clues (size, body style, drivetrain) and verify year and market.</li>
            <li>When you know the segment you want, use the BMW Assistant for a shortlist.</li>
          </ul>
        </section>

        <section className="topic-prompts" aria-label="Try in BMW Assistant">
          <h2 className="topic-practical-title">Try in BMW Assistant</h2>
          <ul className="topic-practical-list">
            <li>
              What do you make of the name: X3 xDrive30i. What is each part usually associated with?
            </li>
            <li>City driving and parking in a 3 Series saloon vs X1 SUV.</li>
            <li>What does the M badge generally affect in price and comfort?</li>
          </ul>
        </section>

        <p>
          BMW model names are a shorthand. The first number (1, 3, 5, 7...) is usually how big or executive, and X or i
          usually means SUV or electric. Great for quickly sorting through Autotrader-style listings, however this
          isn't always 100% consistent, so check the year and market.
        </p>
        <p>
          Generally, the higher the series number, the larger (and more executive) the car; X models are SUVs (X1, X3,
          X5, X7). "M" can be a standalone (M3, M5) or M Performance (M340i). Both are sportier than the standard
          cars, generally at the expense of price and luxury.
        </p>
        <p>
          Badges (e.g., 330e, 320d, xDrive30i) can often have clues to the engine or drivetrain, but BMW names can change
          over time and regional differences apply. Best to use the badge to get a general idea, and then check what spec
          you want for the year you want.
        </p>

        <MCQ
          question="Which series usually represents BMW's compact sedan range?"
          options={["1 Series", "3 Series", "7 Series"]}
          correctIndex={1}
        />
      </div>

      <TopicContinueRow
        assistantText="If the badges finally mean something, BMW Assistant is where you plug in budget and see what the site actually suggests."
        extraLinks={[
          { to: "/which-bmw-is-right-for-me", label: "Which BMW is right for me?" },
          { to: "/what-is-a-bmw", label: "What is a BMW?" },
        ]}
      />
    </div>
  );
}

export default ModelHierarchy;
