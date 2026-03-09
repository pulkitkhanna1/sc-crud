import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { PERSON_ROLE_LABELS } from "@/lib/constants";
import type { PersonRole, SessionState, WorkflowActions, WorkflowSnapshot } from "@/lib/types";
import { AssignmentsPage } from "@/pages/AssignmentsPage";
import { BeatsPage } from "@/pages/BeatsPage";
import { IdeasPage } from "@/pages/IdeasPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { ProductionPage } from "@/pages/ProductionPage";

type ViewId = "overview" | "ideas" | "beats" | "assignments" | "production";

const views: Array<{ id: ViewId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "ideas", label: "Ideas" },
  { id: "beats", label: "Beats" },
  { id: "assignments", label: "Writing" },
  { id: "production", label: "Production" },
];

export default function App() {
  const [view, setView] = useState<ViewId>("overview");
  const [snapshot, setSnapshot] = useState<WorkflowSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [role, setRole] = useState<PersonRole>("BUSINESS");
  const [personId, setPersonId] = useState("");
  const [toast, setToast] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

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
    return snapshot?.people.filter((person) => person.role === role) ?? [];
  }, [role, snapshot?.people]);

  useEffect(() => {
    if (!availablePeople.length) {
      return;
    }

    if (!availablePeople.some((person) => person.id === personId)) {
      setPersonId(availablePeople[0].id);
    }
  }, [availablePeople, personId]);

  const session: SessionState = useMemo(() => {
    const person = availablePeople.find((candidate) => candidate.id === personId);
    return {
      role,
      personId: person?.id ?? "",
      personName: person?.name ?? PERSON_ROLE_LABELS[role],
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

  return (
    <div className="app-shell">
      {toast ? <div className={`toast toast-${toast.tone}`}>{toast.message}</div> : null}

      <header className="app-header">
        <div>
          <p className="eyebrow">Full-stack workflow app</p>
          <h1 className="app-title">CPI Workflow Studio</h1>
          <p className="app-subtitle">The original JSX prototype is now backed by a persisted API and workflow database.</p>
        </div>

        <div className="toolbar">
          <label className="field compact-field">
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as PersonRole)}>
              {Object.entries(PERSON_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="field compact-field">
            <span>Session person</span>
            <select value={personId} onChange={(event) => setPersonId(event.target.value)}>
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
        {view === "overview" ? <OverviewPage session={session} snapshot={snapshot} /> : null}
        {view === "ideas" ? <IdeasPage actions={actions} busy={busy} session={session} snapshot={snapshot} /> : null}
        {view === "beats" ? <BeatsPage actions={actions} busy={busy} session={session} snapshot={snapshot} /> : null}
        {view === "assignments" ? (
          <AssignmentsPage actions={actions} busy={busy} session={session} snapshot={snapshot} />
        ) : null}
        {view === "production" ? <ProductionPage session={session} snapshot={snapshot} /> : null}
      </main>
    </div>
  );
}
