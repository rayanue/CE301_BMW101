import MCQ from "../components/MCQ";
import { TopicContinueRow } from "../components/TopicContinueRow";

function WhatIsBMW() {
  return (
    <div className="topic-page">
      <div className="card">
        <h1>What is a BMW?</h1>
        <section className="topic-practical" aria-label="In practice">
          <h2 className="topic-practical-title">In practice</h2>
          <ul className="topic-practical-list">
            <li>Read this before visiting a showroom or comparing brands.</li>
            <li>Remember: driving feel plus quality, not badge.</li>
            <li>If you have an idea of your budget and priorities, you can move on to BMW Assistant.</li>
          </ul>
        </section>

        <section className="topic-prompts" aria-label="Try in BMW Assistant">
          <h2 className="topic-practical-title">Try in BMW Assistant</h2>
          <ul className="topic-practical-list">
            <li>What is BMW all about, at a basic level?</li>
            <li>I'm more interested in comfort than performance - what should I look out for in BMWs?</li>
            <li>If I have £50k to spend, what types of BMW should I look for a city/motorway car?</li>
          </ul>
        </section>

        <p>
          BMW is an abbreviation for Bayerische Motoren Werke (Bavarian Motor Works). These days, BMW is seen as a luxury
          brand with emphasis on the driving experience - steering, handling and acceleration - as well as a contemporary,
          technology-laden interior.
        </p>
        <p>
          Much of BMW is about tuning: quick controls, a bit more sporty than some, and often the option between rear-wheel
          drive and xDrive (depending on model and model year). That isn't always "fast", but it usually means
          the car is supposed to feel sharp on a winding country road or motorway exit.
        </p>
        <p>
          People purchase BMWs for various reasons - luxury, prestige, performance, or a combination - but owning one comes
          with luxury trade-offs (insurance, tyres and maintenance can be more expensive). This hub should help you
          understand the trade-offs and then use BMW Assistant to zero in on your needs and budget.
        </p>

        <MCQ
          question="What does BMW stand for?"
          options={[
            "Bayerische Motoren Werke",
            "British Motor Works",
            "Bavarian Mechanics Workshop",
          ]}
          correctIndex={0}
        />
      </div>

      <TopicContinueRow
        assistantText="When you have read enough, hop to BMW Assistant - same budget form and chat you get from Recommendations."
        extraLinks={[{ to: "/model-hierarchy", label: "Model hierarchy" }]}
      />
    </div>
  );
}

export default WhatIsBMW;
