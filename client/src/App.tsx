import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
import { RequesterSelectorModal } from "./components/RequesterSelectorModal.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import "./index.css";

type UiState = "idle" | "loading" | "success" | "error";

function HomeOverview({ onNavigateCreate }: { onNavigateCreate: () => void }) {
  const { selectedRequester } = useRequester();
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
    <>
      {selectedRequester ? (
        <div className="card shadow-sm mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h4 fw-bold text-success mb-1">
                Welcome, {selectedRequester.name} 👋
              </h2>
              <p className="text-muted mb-0 small">
                Department: <strong>{selectedRequester.department || "N/A"}</strong> | Email: <strong>{selectedRequester.email}</strong>
              </p>
            </div>
            <button type="button" className="btn-zen-primary" onClick={onNavigateCreate}>
              ➕ Create New Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="alert alert-info mb-4">
          Please select a Development Requester context above to simulate user tickets.
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h5 fw-semibold mb-3">System Health & Categories Check</h3>
          <button className="btn-zen-primary mb-3" onClick={handleCheck} disabled={state === "loading"}>
            {state === "loading" ? "Loading…" : "Check System Status"}
          </button>

          {state === "success" && (
            <div className="mt-3">
              <p className="fw-bold text-success mb-3">System Status: Online 🟢</p>
              {categories.length > 0 && (
                <div>
                  <p className="fw-semibold mb-2">Supported Request Categories:</p>
                  <ul className="list-group">
                    {categories.map((cat) => (
                      <li key={cat.id} className="list-group-item">
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {state === "error" && (
            <div className="mt-3 text-danger">
              <p className="fw-bold mb-1">System Status: Offline 🔴</p>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<"my-tickets" | "create-ticket">("my-tickets");

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="container py-4" style={{ maxWidth: 840 }}>
        {activeTab === "create-ticket" ? (
          <CreateTicketForm onSuccessNavigate={() => setActiveTab("my-tickets")} />
        ) : (
          <HomeOverview onNavigateCreate={() => setActiveTab("create-ticket")} />
        )}
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
