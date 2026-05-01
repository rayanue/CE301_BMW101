import MCQ from "../components/MCQ";
import { TopicContinueRow } from "../components/TopicContinueRow";

function RunningCostsAndEconomy() {
  return (
    <div className="topic-page">
      <div className="card">
        <h1>Running costs and economy</h1>
        <section className="topic-practical" aria-label="In practice">
          <h2 className="topic-practical-title">In practice</h2>
          <ul className="topic-practical-list">
            <li>Create a basic monthly picture: fuel or electric, insurance, tax, servicing and tyres.</li>
            <li>
              Be realistic about your driving style (city, mix or motorway). It changes what "efficient" means.
            </li>
            <li>In BMW Assistant, match these up with your shortlist.</li>
          </ul>
        </section>

        <section className="topic-prompts" aria-label="Try in BMW Assistant">
          <h2 className="topic-practical-title">Try in BMW Assistant</h2>
          <ul className="topic-practical-list">
            <li>For my shortlist, what are the key risks around running costs I need to account for?</li>
            <li>I drive mostly (city/motorway). What type of powertrain would be best?</li>
            <li>What would you ask about servicing, tyres and warranty on a car before buying?</li>
          </ul>
        </section>
        <h3>Fuel economy</h3>
        <p>
          Actual mpg varies with engine and your right foot. Most BMWs are keen out of the box, which is great for a long
          motorway blast but not so for stop-start driving if you are using every light to launch. If you are comparing
          petrol, diesel, plug-in hybrid and pure electric powertrains, the question is whether your mileage is compatible
          with the powertrain, and whether you have home charging if you want a plug-in or pure EV.
        </p>

        <h3>Servicing and maintenance</h3>
        <p>
          Regular, use-based servicing can have a significant impact on BMW ownership. A performance model will need more
          servicing than a lower powered one, again largely dependent on how you drive. Many models have service indicators
          and sensors (rather than a set schedule for all drivers), so costs will vary. The basic items remain the big
          costs, but BMW-specific costs include run-flat or larger wheel and tyre options; M Sport or performance brakes and
          tyres; xDrive issues (tyres are better kept matched to avoid stress on the drivetrain).
        </p>

        <h3>Other running costs</h3>
        <p>
          <strong>Insurance:</strong> BMW performance trims and higher-output engines often price differently, and repair
          costs can push premiums up. Shop around for insurance.
          <br />
          <br />
          <strong>Road tax:</strong> varies on the car's registration and emissions regulations. This is worth checking
          before you buy, and can be surprisingly expensive and even cheap on certain models.
          <br />
          <br />
          <strong>Tyres:</strong> run-flats, big wheels and high-performance compounds tend to be more expensive and may wear
          quicker (particularly on heavier cars or those with more power).
          <br />
          <br />
          <strong>Depreciation:</strong> values can be affected by trim, mileage, service history and equipment. A documented
          car is often better than a cheaper car with unknown history.
        </p>

        <p>
          For BMW maintenance costs, a car with service history is a good start. When buying secondhand, it's generally
          worth paying more for the best-conditioned car, rather than saving now and having to catch up later.
        </p>

        <MCQ
          question="What is one way to keep BMW running costs predictable?"
          options={["Ignore warning lights", "Follow the service schedule", "Only drive at top speed"]}
          correctIndex={1}
        />
      </div>

      <TopicContinueRow
        assistantText="After you shortlist, BMW Assistant chat is fine for rough cost questions - do not treat it like a live insurer or dealer quote."
        extraLinks={[
          { to: "/pros-and-cons", label: "Pros & cons" },
          { to: "/which-bmw-is-right-for-me", label: "Which BMW is right for me?" },
        ]}
      />
    </div>
  );
}

export default RunningCostsAndEconomy;
