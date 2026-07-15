import { useState } from "react";
import "./App.css";
import { Sidebar, type StageId } from "./components/Sidebar";
import { Overview } from "./views/Overview";
import { DealModeling } from "./views/DealModeling";
import { ContractGeneration } from "./views/ContractGeneration";
import { SignatureRouting } from "./views/SignatureRouting";
import { Reconciliation } from "./views/Reconciliation";

export default function App() {
  const [stage, setStage] = useState<StageId>("overview");

  return (
    <div className="shell">
      <Sidebar stage={stage} onNavigate={setStage} />
      <main className="main">
        {stage === "overview" && <Overview onNavigate={setStage} />}
        {stage === "modeling" && <DealModeling />}
        {stage === "contract" && <ContractGeneration />}
        {stage === "signature" && <SignatureRouting />}
        {stage === "reconciliation" && <Reconciliation />}
      </main>
    </div>
  );
}
