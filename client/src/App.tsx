import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { RequesterProvider } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
import { RequesterSelectorModal } from "./components/RequesterSelectorModal.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsView } from "./components/MyTicketsView.js";
import { TicketDetailView } from "./components/TicketDetailView.js";
import "./index.css";

type UiState = "idle" | "loading" | "success" | "error";

function HomeOverview() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleCheck() {
    setState("loading");
    setErrorMessage("");
    try {
      const res = await checkSystem();
      setCategories(res.categories);
      setState("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to connect to TokTickIT API");
      setState("error");
    }
  }

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h3 className="h6 fw-semibold mb-2">System Health & API Check</h3>
        <button className="btn-zen-primary mb-3" onClick={handleCheck} disabled={state === "loading"}>
          {state === "loading" ? "Loading…" : "Check System Status"}
        </button>

        {state === "success" && (
          <div className="mt-2">
            <p className="fw-bold text-success mb-2 d-flex align-items-center gap-1">
              <span className="d-inline-block rounded-circle bg-success" style={{ width: "10px", height: "10px" }}></span>
              <span>System Status: Online</span>
            </p>
            {categories.length > 0 && (
              <div>
                <p className="fw-semibold mb-1 small">Supported Categories:</p>
                <ul className="list-group list-group-flush small">
                  {categories.map((cat) => (
                    <li key={cat.id} className="list-group-item py-1">
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {state === "error" && (
          <div className="mt-2 text-danger">
            <p className="fw-bold mb-1 d-flex align-items-center gap-1">
              <span className="d-inline-block rounded-circle bg-danger" style={{ width: "10px", height: "10px" }}></span>
              <span>System Status: Offline</span>
            </p>
            <p className="small mb-0">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<"my-tickets" | "create-ticket" | "ticket-detail">("my-tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleSelectTicket = (id: number) => {
    setSelectedTicketId(id);
    setActiveTab("ticket-detail");
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header activeTab={activeTab === "ticket-detail" ? "my-tickets" : activeTab} onSelectTab={setActiveTab} />
      <main className="container py-4" style={{ maxWidth: 1040 }}>
        {activeTab === "create-ticket" ? (
          <CreateTicketForm onSuccessNavigate={() => setActiveTab("my-tickets")} />
        ) : activeTab === "ticket-detail" && selectedTicketId !== null ? (
          <TicketDetailView ticketId={selectedTicketId} onBack={() => setActiveTab("my-tickets")} />
        ) : (
          <MyTicketsView
            onNavigateCreate={() => setActiveTab("create-ticket")}
            onSelectTicket={handleSelectTicket}
          />
        )}
        <HomeOverview />
      </main>
      <RequesterSelectorModal />
    </div>
  );
}

export default function App() {
  return (
    <RequesterProvider>
      <MainApp />
    </RequesterProvider>
  );
}
