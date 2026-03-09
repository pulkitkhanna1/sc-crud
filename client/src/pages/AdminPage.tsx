import { useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Panel } from "@/components/Panel";
import {
  ASSIGNMENT_GRADE_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  BEAT_STATUS_LABELS,
  IDEA_RANK_LABELS,
  IDEA_STATUS_LABELS,
  PERSON_ROLE_LABELS,
  PRODUCTION_TYPE_LABELS,
} from "@/lib/constants";
import type { CreatePersonInput, PersonRole, WorkflowActions, WorkflowSnapshot } from "@/lib/types";

interface AdminPageProps {
  snapshot: WorkflowSnapshot;
  actions: WorkflowActions;
  busy: boolean;
  adminUnlocked: boolean;
  onLock(): void;
}

const emptyPersonForm = (): CreatePersonInput => ({
  name: "",
  role: "WRITER",
});

const schemaGroups = [
  {
    title: "People roles",
    description: "Roles available for session switching and team setup.",
    entries: Object.entries(PERSON_ROLE_LABELS),
  },
  {
    title: "Idea statuses",
    description: "Review outcome stored on ideas.",
    entries: Object.entries(IDEA_STATUS_LABELS),
  },
  {
    title: "Idea ranks",
    description: "Prioritization values used after review.",
    entries: Object.entries(IDEA_RANK_LABELS),
  },
  {
    title: "Beat statuses",
    description: "Stage progression for beat development.",
    entries: Object.entries(BEAT_STATUS_LABELS),
  },
  {
    title: "Assignment types",
    description: "New work versus improvement requests.",
    entries: Object.entries(ASSIGNMENT_TYPE_LABELS),
  },
  {
    title: "Assignment statuses",
    description: "Writer and review workflow states.",
    entries: Object.entries(ASSIGNMENT_STATUS_LABELS),
  },
  {
    title: "Assignment grades",
    description: "Review outcomes after script submission.",
    entries: Object.entries(ASSIGNMENT_GRADE_LABELS),
  },
  {
    title: "Production types",
    description: "Downstream production suffixes.",
    entries: Object.entries(PRODUCTION_TYPE_LABELS),
  },
];

export function AdminPage({ snapshot, actions, busy, adminUnlocked, onLock }: AdminPageProps) {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showName, setShowName] = useState("");
  const [personForm, setPersonForm] = useState<CreatePersonInput>(emptyPersonForm);

  const peopleByRole = useMemo(
    () =>
      (Object.keys(PERSON_ROLE_LABELS) as PersonRole[]).map((role) => ({
        role,
        label: PERSON_ROLE_LABELS[role],
        people: snapshot.people.filter((person) => person.role === role),
      })),
    [snapshot.people],
  );

  const linkedPersonIds = useMemo(() => {
    const ids = new Set<string>();

    for (const idea of snapshot.ideas) {
      ids.add(idea.submittedById);
    }

    for (const beat of snapshot.beats) {
      ids.add(beat.assignedToId);
      if (beat.reviewedById) {
        ids.add(beat.reviewedById);
      }
    }

    for (const assignment of snapshot.assignments) {
      ids.add(assignment.writerId);
      ids.add(assignment.podLeadId);
    }

    return ids;
  }, [snapshot.assignments, snapshot.beats, snapshot.ideas]);

  const linkedShows = useMemo(() => {
    const names = new Set<string>();

    for (const idea of snapshot.ideas) {
      names.add(idea.show);
    }

    for (const assignment of snapshot.assignments) {
      names.add(assignment.show);
    }

    return names;
  }, [snapshot.assignments, snapshot.ideas]);

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await actions.validateAdminPassword(password);
      setPasswordError(null);
      setPassword("");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Admin unlock failed.");
    }
  }

  async function handleCreateShow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await actions.createShow({ name: showName });
      setShowName("");
    } catch {
      // Toast is handled globally in App.
    }
  }

  async function handleCreatePerson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await actions.createPerson(personForm);
      setPersonForm(emptyPersonForm());
    } catch {
      // Toast is handled globally in App.
    }
  }

  async function handleRemoveShow(id: string) {
    try {
      await actions.removeShow(id);
    } catch {
      // Toast is handled globally in App.
    }
  }

  async function handleRemovePerson(id: string) {
    try {
      await actions.removePerson(id);
    } catch {
      // Toast is handled globally in App.
    }
  }

  return (
    <div className="page-stack">
      <div className="metrics-grid">
        <div className="metric-card">
          <span>Shows</span>
          <strong>{snapshot.shows.length}</strong>
          <p>live show options</p>
        </div>
        <div className="metric-card">
          <span>Team members</span>
          <strong>{snapshot.people.length}</strong>
          <p>available session identities</p>
        </div>
        <div className="metric-card">
          <span>Writers</span>
          <strong>{snapshot.people.filter((person) => person.role === "WRITER").length}</strong>
          <p>eligible for assignments</p>
        </div>
        <div className="metric-card">
          <span>Leadership</span>
          <strong>{snapshot.people.filter((person) => person.role !== "WRITER").length}</strong>
          <p>POD leads and business users</p>
        </div>
      </div>

      <Panel
        title="Admin access"
        description="Unlock this section before creating or deleting team members and shows."
        action={
          adminUnlocked ? (
            <button className="secondary-button" type="button" onClick={onLock}>
              Lock admin
            </button>
          ) : null
        }
      >
        {adminUnlocked ? (
          <div className="callout">
            <strong>Admin unlocked</strong>
            <p>Use this section to maintain reference data for the workflow. Destructive actions stay blocked when records are already in use.</p>
          </div>
        ) : (
          <form className="form-stack" onSubmit={handleUnlock}>
            <label className="field">
              <span>Admin password</span>
              <input
                autoComplete="current-password"
                placeholder="Enter admin password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {passwordError ? (
              <div className="callout callout-danger">
                <strong>Access denied</strong>
                <p>{passwordError}</p>
              </div>
            ) : null}

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Unlock admin
              </button>
            </div>
          </form>
        )}
      </Panel>

      {adminUnlocked ? (
        <>
          <div className="split-grid">
            <Panel title="Shows" description="Maintain the show list used across ideas and assignments.">
              <form className="form-stack" onSubmit={handleCreateShow}>
                <label className="field">
                  <span>Show name</span>
                  <input
                    placeholder="MVS or a full show name"
                    value={showName}
                    onChange={(event) => setShowName(event.target.value)}
                  />
                </label>

                <div className="button-row">
                  <button className="primary-button" disabled={busy} type="submit">
                    Add show
                  </button>
                </div>
              </form>

              <div className="subsection">
                {snapshot.shows.length === 0 ? (
                  <EmptyState title="No shows yet" description="Add your first show to start routing ideas and assignments." />
                ) : (
                  <div className="stack-list">
                    {snapshot.shows.map((show) => {
                      const isLinked = linkedShows.has(show.name);

                      return (
                        <div className="person-row" key={show.id}>
                          <div>
                            <strong>{show.name}</strong>
                            <p className="muted-copy">{isLinked ? "Already used in workflow data" : "Unused and safe to remove"}</p>
                          </div>
                          <div className="button-row">
                            <Badge tone={isLinked ? "warning" : "success"}>{isLinked ? "In use" : "Unused"}</Badge>
                            <button
                              className="ghost-button"
                              disabled={busy || isLinked}
                              type="button"
                              onClick={() => void handleRemoveShow(show.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Add team member" description="Create the session identities that will act inside the workflow.">
              <form className="form-stack" onSubmit={handleCreatePerson}>
                <label className="field">
                  <span>Full name</span>
                  <input
                    placeholder="Team member name"
                    value={personForm.name}
                    onChange={(event) => setPersonForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>

                <label className="field">
                  <span>Role</span>
                  <select
                    value={personForm.role}
                    onChange={(event) =>
                      setPersonForm((current) => ({
                        ...current,
                        role: event.target.value as PersonRole,
                      }))
                    }
                  >
                    {(Object.keys(PERSON_ROLE_LABELS) as PersonRole[]).map((role) => (
                      <option key={role} value={role}>
                        {PERSON_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="button-row">
                  <button className="primary-button" disabled={busy} type="submit">
                    Add team member
                  </button>
                </div>
              </form>
            </Panel>
          </div>

          <Panel title="Current team" description="People already available in the session selector, grouped by role.">
            <div className="people-columns">
              {peopleByRole.map((group) => (
                <div className="people-column" key={group.role}>
                  <h3>
                    {group.label} <Badge>{group.people.length}</Badge>
                  </h3>
                  {group.people.length === 0 ? (
                    <EmptyState title="No team members in this role yet" description="Add one from the form above." />
                  ) : (
                    <div className="stack-list">
                      {group.people.map((person) => {
                        const isLinked = linkedPersonIds.has(person.id);

                        return (
                          <div className="person-row" key={person.id}>
                            <div>
                              <strong>{person.name}</strong>
                              <p className="muted-copy">{isLinked ? "Already linked to workflow history" : "Unused and safe to remove"}</p>
                            </div>
                            <div className="button-row">
                              <Badge tone={isLinked ? "warning" : "success"}>{isLinked ? "In use" : "Unused"}</Badge>
                              <button
                                className="ghost-button"
                                disabled={busy || isLinked}
                                type="button"
                                onClick={() => void handleRemovePerson(person.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </>
      ) : null}

      <Panel
        title="Schema variables"
        description="These are the fixed enum-backed workflow values from the current schema. They are visible here for reference but not editable from the UI."
      >
        <div className="split-grid">
          {schemaGroups.map((group) => (
            <div className="empty-state" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <div className="badge-cluster">
                {group.entries.map(([value, label]) => (
                  <div className="mini-row" key={value}>
                    <Badge tone="info">{value}</Badge>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
