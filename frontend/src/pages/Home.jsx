import { Link } from "react-router-dom";

function Home() {
  const topics = [
    {
      to: "/what-is-a-bmw",
      title: "What is a BMW?",
      description: "Learn the fundamentals of BMW and what makes them unique",
    },
    {
      to: "/model-hierarchy",
      title: "Model Hierarchy",
      description: "Understand BMW's model lineup and naming system",
    },
    {
      to: "/which-bmw-is-right-for-me",
      title: "Which BMW is Right for Me?",
      description: "Find the perfect BMW model for your needs and lifestyle",
    },
    {
      to: "/pros-and-cons",
      title: "Pros & Cons",
      description: "Explore the advantages and considerations of owning a BMW",
    },
    {
      to: "/running-costs-and-economy",
      title: "Running Costs & Economy",
      description: "Understand the costs and efficiency of BMW ownership",
    },
  ];

  return (
    <>
      <div className="home-hero">
        <h1>BMW 101</h1>
        <p className="hero-subtitle">
          Learn the basics, shortlist models and ask better questions before you buy
        </p>
        <p className="hero-description">
          Short topic pages cover general information from what BMW is to running costs. BMW Assistant takes your
          priorities and uses them to rank different models using tailored knowledge to give accurate answers, outputting
          models most suitable for you.
        </p>
      </div>

      <section className="home-feature" aria-label="BMW Assistant">
        <div>
          <h2 className="home-feature-title">BMW Assistant</h2>
          <p className="home-feature-text">
            Submit the form for a ranked shortlist of cars that suit you, then use the chatbot for any questions you may
            have regarding the shortlist or in general.
          </p>
        </div>
        <div className="home-feature-actions">
          <Link to="/recommendations" className="home-feature-primary">
            Start BMW Assistant
          </Link>
          <Link to="/what-is-a-bmw" className="home-feature-secondary">
            Browse learning topics
          </Link>
        </div>
      </section>

      <div className="topics-grid">
        {topics.map((topic) => (
          <Link key={topic.to} to={topic.to} className="topic-card">
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            <span className="topic-arrow">{"->"}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

export default Home;

