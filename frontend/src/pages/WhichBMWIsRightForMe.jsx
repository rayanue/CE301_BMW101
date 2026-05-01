import MCQ from "../components/MCQ";
import { TopicContinueRow } from "../components/TopicContinueRow";

function WhichBMWIsRightForMe() {
  return (
    <div className="topic-page">
      <div className="card">
        <h1>Which BMW is right for me?</h1>
        <section className="topic-practical" aria-label="In practice">
          <h2 className="topic-practical-title">In practice</h2>
          <ul className="topic-practical-list">
            <li>
              List your budget and one thing you're not willing to compromise on (e.g. five doors, not an electric car,
              minimum number of seats).
            </li>
            <li>Decide on your top two (e.g. cost to run + comfort, or performance + style).</li>
            <li>Use this shortlist when you create your shortlist in BMW Assistant.</li>
          </ul>
        </section>

        <section className="topic-prompts" aria-label="Try in BMW Assistant">
          <h2 className="topic-practical-title">Try in BMW Assistant</h2>
          <ul className="topic-practical-list">
            <li>I want (A) and (B). What compromises are there with these BMWs?</li>
            <li>I do mostly urban driving, with some motorway driving. What model will be best for that?</li>
            <li>I want low maintenance. What to watch out for in a performance trim?</li>
          </ul>
        </section>

        <p>
          First, decide how much you can afford to spend, including the "boring" expenses: insurance, tyres, maintenance
          and fuel or electricity. The cost of car loans can be similar between cars, but the cost of owning them can be
          very different, particularly when comparing a small hatch to an SUV or a performance trim.
        </p>
        <p>
          Then be honest about how you actually drive. Commuting, motorway miles, and a combination of both all lead you
          to different conclusions. Petrol, diesel, PHEV and EV all have their specialities, and being able to charge at
          home will often determine whether an EV or PHEV is even worth considering.
        </p>
        <p>
          Finally, choose a car that fits. Doors, boot shape, visibility, parking width and rear-seat access usually count
          for more than a spec. If you get the practicalities right, it's easier to love any BMW.
        </p>

        <MCQ
          question="If efficiency is the top priority, which drivetrain is usually best?"
          options={["High-displacement petrol", "Diesel or hybrid", "Track-only setup"]}
          correctIndex={1}
        />
      </div>

      <TopicContinueRow
        assistantText="You already wrote the hard stuff down - BMW Assistant is just ticking boxes and seeing what comes out."
        extraLinks={[
          { to: "/running-costs-and-economy", label: "Running costs & economy" },
          { to: "/pros-and-cons", label: "Pros & cons" },
        ]}
      />
    </div>
  );
}

export default WhichBMWIsRightForMe;
