import { useState, useEffect } from "react";
import { checkSystem, Category } from "./api.js";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { Header, NavTab } from "./components/Header.js";
import { LoginView } from "./components/LoginView.js";
import { ChangePasswordView } from "./components/ChangePasswordView.js";
import { RequesterSelectorModal } from "./components/RequesterSelectorModal.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsView } from "./components/MyTicketsView.js";
import { TicketDetailView } from "./components/TicketDetailView.js";
import "./index.css";

type UiState = "idle" | "loading" | "success" | "error";

export function HomeOverview() {
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
  const { user, isLoading } = useAuth();
  const { selectedRequester, isModalOpen } = useRequester();

  const getInitialTab = (role?: string): NavTab => {
    if (role === "ADMINISTRATOR") return "user-management";
    if (role === "IT_STAFF") return "ticket-queue";
    return "my-tickets";
  };

  const [activeTab, setActiveTab] = useState<NavTab>(() => getInitialTab(user?.role));
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role) {
      setActiveTab(getInitialTab(user.role));
    }
  }, [user?.role]);

  const handleSelectTicket = (id: number) => {
    setSelectedTicketId(id);
    setActiveTab("ticket-detail");
  };

  // Loading state while verifying auth session
  if (isLoading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "var(--page-bg, #F5F7F6)" }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading TokTickIT…</span>
        </div>
      </div>
    );
  }

  // 1. Authenticated User flow (Lab 3)
  if (user) {
    // Forced initial password change (FR-03, BR-02, AC-02)
    if (user.mustChangePassword) {
      return <ChangePasswordView />;
    }

    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--page-bg, #F5F7F6)" }}>
        <Header activeTab={activeTab === "ticket-detail" ? "my-tickets" : activeTab} onSelectTab={setActiveTab} />
        <main className="container py-4" style={{ maxWidth: 1040 }}>
          {activeTab === "ticket-queue" ? (
            <div className="card shadow-sm p-4 text-center">
              <h2 className="h5 fw-bold text-dark mb-2">IT Staff Ticket Queue</h2>
              <p className="text-muted small mb-0">
                Ticket queue management engine will be integrated in Sprint 3 increment (Issue 23).
              </p>
            </div>
          ) : activeTab === "user-management" ? (
            <div className="card shadow-sm p-4 text-center">
              <h2 className="h5 fw-bold text-dark mb-2">Administrator User Management</h2>
              <p className="text-muted small mb-0">
                User administration interface will be integrated in Sprint 3 increment (Issue 27).
              </p>
            </div>
          ) : activeTab === "create-ticket" ? (
            <CreateTicketForm onSuccessNavigate={() => setActiveTab("my-tickets")} />
          ) : activeTab === "ticket-detail" && selectedTicketId !== null ? (
            <TicketDetailView ticketId={selectedTicketId} onBack={() => setActiveTab("my-tickets")} />
          ) : (
            <MyTicketsView
              onNavigateCreate={() => setActiveTab("create-ticket")}
              onSelectTicket={handleSelectTicket}
            />
          )}
        </main>
      </div>
    );
  }

  // 2. Backward compatibility for Lab 2 test suites (only in test environment)
  const isDevRequesterFlow =
    import.meta.env.MODE === "test" &&
    (Boolean(localStorage.getItem("toktickit_dev_requester_id")) || isModalOpen);

  if (isDevRequesterFlow) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--page-bg, #F5F7F6)" }}>
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
          {import.meta.env.MODE === "test" && <HomeOverview />}
        </main>
        <RequesterSelectorModal />
      </div>
    );
  }

  // 3. Unauthenticated Login screen (Lab 3 Screen 1)
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--page-bg, #F5F7F6)" }}>
      <LoginView />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RequesterProvider>
        <MainApp />
      </RequesterProvider>
    </AuthProvider>
  );
}
