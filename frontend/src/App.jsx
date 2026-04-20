import { useState } from "react";

import ParticleField from "./components/ParticleField";
import GraphPage from "./pages/GraphPage";
import UploadPage from "./pages/UploadPage";
import "./styles/globals.css";

export default function App() {
  const [graphData, setGraphData] = useState(null);

  return (
    <>
      <ParticleField />
      {graphData ? <GraphPage graphData={graphData} onReset={() => setGraphData(null)} /> : <UploadPage onGraphReady={setGraphData} />}
    </>
  );
}
