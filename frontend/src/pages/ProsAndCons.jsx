import MCQ from "../components/MCQ";
import { TopicContinueRow } from "../components/TopicContinueRow";

function ProsAndCons() {
  return (
    <div className="topic-page">
      <div className="card">
        <h1>Pros and cons</h1>
        <section className="topic-practical" aria-label="In practice">
          <h2 className="topic-practical-title">In practice</h2>
          <ul className="topic-practical-list">
            <li>Just consider the three things here that are most important to you.</li>
            <li>Decide if running costs are fixed, or negotiable based on the car.</li>
            <li>Try BMW Assistant to apply these trade-offs to models.</li>
          </ul>
        </section>

        <section className="topic-prompts" aria-label="Try in BMW Assistant">
          <h2 className="topic-practical-title">Try in BMW Assistant</h2>
          <ul className="topic-practical-list">
            <li>With my shortlist, what are the key trade-offs for owning each of these models?</li>
            <li>I want comfort and convenience. Which model fits best?</li>
            <li>If I want the driving experience, what are the trade-offs?</li>
          </ul>
        </section>

        <h3>Advantages</h3>
        <ul>
          <li>
            <strong>Handling:</strong> feel, balance and power are the most important thing about BMW to most owners.
          </li>
          <li>
            <strong>Quality:</strong> build quality and materials are often considered better than mass-market brands.
          </li>
          <li>
            <strong>Engineering:</strong> models have history, and forums, shops and parts are easier to find than rare
            brands.
          </li>
          <li>
            <strong>Investment:</strong> good models hold up well against cheap ones, but new depreciation is high.
          </li>
          <li>
            <strong>Technology:</strong> infotainment and driver aids are rich in features - be prepared for a learning
            curve and upgrades.
          </li>
        </ul>

        <h3>Trade-offs</h3>
        <ul>
          <li>
            <strong>Maintenance and parts:</strong> parts and labour usually higher than {"'mass market'"}.
          </li>
          <li>
            <strong>Insurance:</strong> repair costs and performance potential impact premiums, particularly for young
            drivers.
          </li>
          <li>
            <strong>Fuel efficiency:</strong> performance variants and big engines can be thirsty; driver behaviour is key.
          </li>
          <li>
            <strong>Complexity:</strong> sensors and modules can increase time to diagnose problems.
          </li>
          <li>
            <strong>Depreciation on new cars:</strong> the first owner takes the biggest hit; used cars are different.
          </li>
        </ul>

        <p>
          BMWs are best for people who value driving and interior comfort so much they can afford deluxe maintenance. You
          can keep costs reasonable: choose a quieter trim, value tyres and service records, and don't expect the only
          cost for a performance model to be the initial surcharge when buying the car.
        </p>

        <MCQ
          question="Which of these is often considered a BMW strength?"
          options={["Engaging driving dynamics", "No maintenance needed", "Free fuel for life"]}
          correctIndex={0}
        />
      </div>

      <TopicContinueRow
        assistantText="BMW Assistant is where this page stops being theory and you actually pick cars to compare in chat."
        extraLinks={[
          { to: "/running-costs-and-economy", label: "Running costs & economy" },
          { to: "/which-bmw-is-right-for-me", label: "Which BMW is right for me?" },
        ]}
      />
    </div>
  );
}

export default ProsAndCons;
