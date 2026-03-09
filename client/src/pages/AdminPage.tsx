import { useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Panel } from "@/components/Panel";
import { formatDateTime } from "@/lib/format";
import {
  SCHEMA_VARIABLE_CATEGORY_META,
  getSchemaVariableLabelMap,
  getSchemaVariables,
} from "@/lib/schemaVariables";
import type {
  CreatePersonInput,
  CreateSchemaVariableInput,
  SchemaVariableCategory,
  WorkflowActions,
  WorkflowSnapshot,
} from "@/lib/types";

interface AdminPageProps {
  snapshot: WorkflowSnapshot;
  actions: WorkflowActions;
  busy: boolean;
}

const CORE_SHOWS = new Set(["MVS", "FLBM", "WBT"]);

const emptyPersonForm = (): CreatePersonInput => ({
  name: "",
  role: "WRITER",
});

const emptySchemaVariableForm = (): Pick<CreateSchemaVariableInput, "value" | "label"> => ({
  value: "",
  label: "",
});

function formatActionLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatLogPayload(payload: unknown) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export function AdminPage({ snapshot, actions, busy }: AdminPageProps) {
  const [showName, setShowName] = useState("");
  const [personForm, setPersonForm] = useState<CreatePersonInput>(emptyPersonForm);
  const [schemaVariableForms, setSchemaVariableForms] = useState<
    Record<string, Pick<CreateSchemaVariableInput, "value" | "label">>
  >({});

  const roleVariables = useMemo(() => getSchemaVariables(snapshot, "PERSON_ROLE"), [snapshot]);
  const roleLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "PERSON_ROLE"), [snapshot]);

  const peopleByRole = useMemo(
    () =>
      roleVariables.map((role) => ({
        role: role.value,
        label: role.label,
        people: snapshot.people.filter((person) => person.role === role.value),
      })),
    [roleVariables, snapshot.people],
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

  function getSchemaVariableForm(category: SchemaVariableCategory) {
    return schemaVariableForms[category] ?? emptySchemaVariableForm();
  }

  function updateSchemaVariableForm(category: SchemaVariableCategory, next: Partial<Pick<CreateSchemaVariableInput, "value" | "label">>) {
    setSchemaVariableForms((current) => ({
      ...current,
      [category]: {
        ...getSchemaVariableForm(category),
        ...next,
      },
    }));
  }

  async function handleCreateShow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await actions.createShow({ name: showName });
      setShowName("");
    } catch {
      // Toast handled in App.
    }
  }

  async function handleCreatePerson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await actions.createPerson(personForm);
      setPersonForm(emptyPersonForm());
    } catch {
      // Toast handled in App.
    }
  }

  async function handleCreateSchemaVariable(event: React.FormEvent<HTMLFormElement>, category: SchemaVariableCategory) {
    event.preventDefault();

    try {
      const form = getSchemaVariableForm(category);
      await actions.createSchemaVariable({
        category,
        value: form.value,
        label: form.label,
      });
      updateSchemaVariableForm(category, emptySchemaVariableForm());
    } catch {
      // Toast handled in App.
    }
  }

  async function handleRemoveShow(id: string) {
    try {
      await actions.removeShow(id);
    } catch {
      // Toast handled in App.
    }
  }

  async function handleRemovePerson(id: string) {
    try {
      await actions.removePerson(id);
    } catch {
      // Toast handled in App.
    }
  }

  async function handleRemoveSchemaVariable(id: string) {
    try {
      await actions.removeSchemaVariable(id);
    } catch {
      // Toast handled in App.
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
          <span>Schema variables</span>
          <strong>{snapshot.schemaVariables.length}</strong>
          <p>runtime workflow options</p>
        </div>
        <div className="metric-card">
          <span>Admin logs</span>
          <strong>{snapshot.adminLogs.length}</strong>
          <p>stored admin activity rows</p>
        </div>
      </div>

      <Panel title="Admin workspace" description="Manage shows, team members, and runtime workflow variables from one place.">
        <div className="callout">
          <strong>Dynamic config is live</strong>
          <p>Shows, team members, and schema variables are now database-backed. Core defaults stay protected, and all admin inputs are logged below.</p>
        </div>
      </Panel>

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
                  const isCoreShow = CORE_SHOWS.has(show.name);

                  return (
                    <div className="person-row" key={show.id}>
                      <div>
                        <strong>{show.name}</strong>
                        <p className="muted-copy">
                          {isCoreShow
                            ? "Core default show kept in every workspace"
                            : isLinked
                              ? "Already used in workflow data"
                              : "Unused and safe to remove"}
                        </p>
                      </div>
                      <div className="button-row">
                        {isCoreShow ? <Badge tone="info">Default</Badge> : null}
                        <Badge tone={isLinked ? "warning" : "success"}>{isLinked ? "In use" : "Unused"}</Badge>
                        <button
                          className="ghost-button"
                          disabled={busy || isLinked || isCoreShow}
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
                    role: event.target.value,
                  }))
                }
              >
                {roleVariables.map((role) => (
                  <option key={role.id} value={role.value}>
                    {role.label}
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
                          <p className="muted-copy">
                            {isLinked ? "Already linked to workflow history" : "Unused and safe to remove"} · {roleLabels[person.role] ?? person.role}
                          </p>
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

      <Panel title="Schema variables" description="Add and remove runtime workflow values for roles, statuses, types, and grades.">
        <div className="split-grid">
          {SCHEMA_VARIABLE_CATEGORY_META.map((group) => {
            const variables = getSchemaVariables(snapshot, group.category);
            const form = getSchemaVariableForm(group.category);

            return (
              <div className="panel" key={group.category}>
                <div className="panel-header">
                  <div>
                    <h2>{group.title}</h2>
                    <p>{group.description}</p>
                  </div>
                </div>

                <form className="form-stack" onSubmit={(event) => void handleCreateSchemaVariable(event, group.category)}>
                  <label className="field">
                    <span>Stored value</span>
                    <input
                      placeholder="UPPER_CASE_VALUE"
                      value={form.value}
                      onChange={(event) => updateSchemaVariableForm(group.category, { value: event.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Label</span>
                    <input
                      placeholder="Readable label"
                      value={form.label}
                      onChange={(event) => updateSchemaVariableForm(group.category, { label: event.target.value })}
                    />
                  </label>

                  <div className="button-row">
                    <button className="primary-button" disabled={busy} type="submit">
                      Add variable
                    </button>
                  </div>
                </form>

                <div className="subsection">
                  {variables.length === 0 ? (
                    <EmptyState title="No variables yet" description="Add a value for this category from the form above." />
                  ) : (
                    <div className="stack-list">
                      {variables.map((variable) => (
                        <div className="person-row" key={variable.id}>
                          <div>
                            <strong>{variable.label}</strong>
                            <p className="muted-copy">{variable.value}</p>
                          </div>
                          <div className="button-row">
                            {variable.isCore ? <Badge tone="info">Core</Badge> : null}
                            <button
                              className="ghost-button"
                              disabled={busy || variable.isCore}
                              type="button"
                              onClick={() => void handleRemoveSchemaVariable(variable.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Admin logs" description="Every stored admin input is listed here, newest first.">
        {snapshot.adminLogs.length === 0 ? (
          <EmptyState title="No admin logs yet" description="Add a show, a team member, or a schema variable to start building the admin activity log." />
        ) : (
          <div className="stack-list">
            {snapshot.adminLogs.map((log) => (
              <article className="entity-card" key={log.id}>
                <div className="entity-card-header">
                  <div>
                    <div className="inline-meta">
                      <strong>{formatActionLabel(log.action)}</strong>
                      <Badge tone="info">{log.targetType}</Badge>
                    </div>
                    <p className="meta-line">{log.targetLabel}</p>
                  </div>
                  <Badge tone="muted">{formatDateTime(log.createdAt)}</Badge>
                </div>

                <div className="detail-card log-card">
                  <span>Stored input</span>
                  <pre className="log-payload">{formatLogPayload(log.payload)}</pre>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
