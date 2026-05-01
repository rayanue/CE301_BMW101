import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/recommendations" className="navbar-featured">
        BMW Assistant
      </Link>
      <Link to="/">Home</Link>
      <Link to="/what-is-a-bmw">What is a BMW?</Link>
      <Link to="/model-hierarchy">Model hierarchy</Link>
      <Link to="/which-bmw-is-right-for-me">Which BMW is right for me?</Link>
      <Link to="/pros-and-cons">Pros & cons</Link>
      <Link to="/running-costs-and-economy">Running costs & economy</Link>
    </nav>
  );
}

export default Navbar;

