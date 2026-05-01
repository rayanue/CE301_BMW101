// Chatbot only on /recommendations

import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import WhatIsBMW from "./pages/WhatIsBMW";
import ModelHierarchy from "./pages/ModelHierarchy";
import WhichBMWIsRightForMe from "./pages/WhichBMWIsRightForMe";
import ProsAndCons from "./pages/ProsAndCons";
import RunningCostsAndEconomy from "./pages/RunningCostsAndEconomy";
import Recommendations from "./pages/Recommendations";

function App() {
  const [recommendedModelIds, setRecommendedModelIds] = useState([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const location = useLocation();
  const isRecommendations = location.pathname === "/recommendations";

  useEffect(() => {
    if (!isRecommendations) setAssistantOpen(false);
  }, [isRecommendations]);

  return (
    <div className="app-container">
      <Navbar />
      <main className={isRecommendations ? "main-content main-content--wide" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/what-is-a-bmw" element={<WhatIsBMW />} />
          <Route path="/model-hierarchy" element={<ModelHierarchy />} />
          <Route
            path="/which-bmw-is-right-for-me"
            element={<WhichBMWIsRightForMe />}
          />
          <Route path="/pros-and-cons" element={<ProsAndCons />} />
          <Route
            path="/running-costs-and-economy"
            element={<RunningCostsAndEconomy />}
          />
          <Route
            path="/recommendations"
            element={
              <Recommendations
                onRecommendationsChange={setRecommendedModelIds}
                onOpenAssistant={() => setAssistantOpen(true)}
              />
            }
          />
        </Routes>
      </main>
      {isRecommendations && (
        <Chatbot
          recommendedModelIds={recommendedModelIds}
          open={assistantOpen}
          onOpenChange={setAssistantOpen}
        />
      )}
    </div>
  );
}

export default App;

