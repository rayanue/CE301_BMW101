import { useState } from "react";

function MCQ({ question, options, correctIndex }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [result, setResult] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (selectedIndex === null) {
      setResult("Please choose an option.");
      return;
    }

    if (selectedIndex === correctIndex) {
      setResult("Correct!");
    } else {
      setResult("Incorrect, try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <p>{question}</p>
      {options.map((option, index) => (
        <label key={option} style={{ display: "block", marginBottom: "0.25rem" }}>
          <input
            type="radio"
            name={question}
            value={index}
            checked={selectedIndex === index}
            onChange={() => setSelectedIndex(index)}
          />
          <span style={{ marginLeft: "0.5rem" }}>{option}</span>
        </label>
      ))}
      <button type="submit">Check answer</button>
      {result && <p style={{ marginTop: "0.5rem" }}>{result}</p>}
    </form>
  );
}

export default MCQ;

