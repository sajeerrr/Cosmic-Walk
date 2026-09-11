import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import PlanJourney from "./pages/PlanJourney";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  return (
    <BrowserRouter>
      {isInitialLoading && (
        <LoadingScreen
          mode="initial"
          onComplete={() => setIsInitialLoading(false)}
        />
      )}
      <Navbar />
      <main style={{ paddingTop: "56px" }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/plan" element={<PlanJourney />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

