import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import PlanJourney from "./pages/PlanJourney";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/plan" element={<PlanJourney />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
