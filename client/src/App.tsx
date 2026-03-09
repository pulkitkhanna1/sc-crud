import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { PERSON_ROLE_LABELS } from "@/lib/constants";
import type { PersonRole, SessionState, WorkflowActions, WorkflowSnapshot } from "@/lib/types";
import { AdminPage } from "@/pages/AdminPage";
import { AssignmentsPage } from "@/pages/AssignmentsPage";
import { BeatsPage } from "@/pages/BeatsPage";
import { IdeasPage } from "@/pages/IdeasPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { ProductionPage } from "@/pages/ProductionPage";

type ViewId = "overview" | "ideas" | "beats" | "assignments" | "production" | "admin";
type Theme = "dark" | "light";

const views: Array<{ id: ViewId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "ideas", label: "Ideas" },
  { id: "beats", label: "Beats" },
  { id: "assignments", label: "Writing" },
  { id: "production", label: "Production" },
  { id: "admin", label: "Admin" },
];

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem("cpi-theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function App() {
  const [view, setView] = useState<ViewId>("overview");
  const [snapshot, setSnapshot] = useState<WorkflowSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [role, setRole] = useState<PersonRole | "">("");
  const [personId, setPersonId] = useState("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [toast, setToast] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("cpi-theme", theme);
  }, [theme]);

  async function loadWorkflow() {
    const data = await api.getWorkflow();
    setSnapshot(data);
    setLoadError(null);
  }

  async function initialLoad() {
    try {
      setLoading(true);
      setLoadError(null);
      await loadWorkflow();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workflow.";
      setLoadError(message);
      setToast({
        tone: "danger",
        message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void initialLoad();
  }, []);

  const availablePeople = useMemo(() => {
    if (!role) {
      return [];
    }

    return snapshot?.people.filter((person) => person.role === role) ?? [];
  }, [role, snapshot?.people]);

  useEffect(() => {
    if (personId && !availablePeople.some((person) => person.id === personId)) {
      setPersonId("");
    }
  }, [availablePeople, personId]);

  const session = useMemo<SessionState | null>(() => {
    if (!role) {
      return null;
    }

    const person = availablePeople.find((candidate) => candidate.id === personId);
    if (!person) {
      return null;
    }

    return {
      role,
      personId: person.id,
      personName: person.name,
    };
  }, [availablePeople, personId, role]);

  async function mutate<T>(operation: () => Promise<T>, successMessage: string) {
    try {
      setBusy(true);
      const result = await operation();
      await loadWorkflow();
      setToast({
        tone: "success",
        message: successMessage,
      });
      return result;
    } catch (error) {
      setToast({
        tone: "danger",
        message: error instanceof Error ? error.message : "Request failed.",
      });
      throw error;
    } finally {
      setBusy(false);
    }
  }

  const actions: WorkflowActions = {
    refresh: () => mutate(async () => undefined, "Workflow refreshed."),
    createIdea: (input) => mutate(() => api.createIdea(input), "Idea saved."),
    reviewIdea: (id, input) => mutate(() => api.reviewIdea(id, input), "Idea updated."),
    createBeat: (input) => mutate(() => api.createBeat(input), "Beat created."),
    submitBeat: (id, input) => mutate(() => api.submitBeat(id, input), "Beat submitted."),
    reviewBeat: (id, input) => mutate(() => api.reviewBeat(id, input), "Beat review saved."),
    createAssignmentFromBeat: (input) =>
      mutate(() => api.createAssignmentFromBeat(input), "Writing assignment created."),
    createImprovementAssignment: (input) =>
      mutate(() => api.createImprovementAssignment(input), "Improvement request created."),
    submitAssignment: (id, input) => mutate(() => api.submitAssignment(id, input), "Script submitted."),
    reviewAssignment: (id, input) => mutate(() => api.reviewAssignment(id, input), "Assignment review saved."),
    markAssignmentReady: (id, input) => mutate(() => api.markAssignmentReady(id, input), "Marked ready for production."),
    createPerson: (input) => mutate(() => api.createPerson(input), "Person added."),
    removePerson: (id) => mutate(() => api.removePerson(id), "Person removed."),
    createShow: (input) => mutate(() => api.createShow(input), "Show added."),
    removeShow: (id) => mutate(() => api.removeShow(id), "Show removed."),
  };

  if (loading) {
    return (
      <div className="center-shell">
        <div className="loading-card">
          <h1>Loading workflow…</h1>
          <p>The app is waiting for the API and database snapshot.</p>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="center-shell">
        {toast ? <div className={`toast toast-${toast.tone}`}>{toast.message}</div> : null}
        <div className="loading-card">
          <h1>Workflow failed to load</h1>
          <p>{loadError ?? "The API did not return a workflow snapshot."}</p>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={() => void initialLoad()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBootstrapMode = snapshot.people.length === 0 || snapshot.shows.length === 0;
  const missingSetupItems = [
    snapshot.shows.length === 0 ? "shows" : null,
    snapshot.people.length === 0 ? "team members" : null,
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <div className="app-shell">
      {toast ? <div className={`toast toast-${toast.tone}`}>{toast.message}</div> : null}

      <header className="app-header">
        <div>
          <p className="eyebrow">Full-stack workflow app</p>
          <h1 className="app-title">CPI Workflow Studio</h1>
        </div>

        <div className="toolbar">
          <button
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            <span className="theme-toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">{theme === "dark" ? "☾" : "☀"}</span>
            </span>
          </button>

          <label className="field compact-field">
            <span>Role</span>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value as PersonRole | "");
                setPersonId("");
              }}
            >
              <option value="">Select role</option>
              {Object.entries(PERSON_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="field compact-field">
            <span>Session person</span>
            <select disabled={!role || availablePeople.length === 0} value={personId} onChange={(event) => setPersonId(event.target.value)}>
              <option value="">{role ? "Select person" : "Select role first"}</option>
              {availablePeople.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>

          <button className="secondary-button" disabled={busy} type="button" onClick={() => void actions.refresh()}>
            Refresh
          </button>
        </div>
      </header>

      <nav className="nav-bar">
        {views.map((entry) => (
          <button
            key={entry.id}
            className={`nav-button ${view === entry.id ? "nav-button-active" : ""}`}
            type="button"
            onClick={() => setView(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      <main className="workspace-shell">
        {view === "admin" ? (
          <AdminPage actions={actions} busy={busy} snapshot={snapshot} />
        ) : isBootstrapMode ? (
          <div className="center-shell">
            <div className="loading-card">
              <h1>Finish workspace setup</h1>
              <p>
                The database is missing {missingSetupItems}. Open the Admin tab and add them before using the workflow.
              </p>
            </div>
          </div>
        ) : !session ? (
          <div className="center-shell">
            <div className="loading-card">
              <h1>Select role and person</h1>
              <p>Everything in the workflow is now tied to the selected role and person. Choose both from the top-right controls to continue.</p>
            </div>
          </div>
        ) : (
          <>
            {view === "overview" ? <OverviewPage session={session} snapshot={snapshot} /> : null}
            {view === "ideas" ? <IdeasPage actions={actions} busy={busy} session={session} snapshot={snapshot} /> : null}
            {view === "beats" ? <BeatsPage actions={actions} busy={busy} session={session} snapshot={snapshot} /> : null}
            {view === "assignments" ? (
              <AssignmentsPage actions={actions} busy={busy} session={session} snapshot={snapshot} />
            ) : null}
            {view === "production" ? <ProductionPage session={session} snapshot={snapshot} /> : null}
          </>
        )}
      </main>
    </div>
  );
}
