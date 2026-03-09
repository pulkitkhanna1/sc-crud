import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import { Panel } from "@/components/Panel";
import {
  IDEA_RANK_LABELS,
  IDEA_RANK_OPTIONS,
  IDEA_STATUS_LABELS,
  IDEA_STATUS_OPTIONS,
  SHOWS,
  toneForIdeaRank,
  toneForIdeaStatus,
} from "@/lib/constants";
import { formatDate, today } from "@/lib/format";
import type {
  CreateBeatInput,
  CreateIdeaInput,
  Idea,
  SessionState,
  WorkflowActions,
  WorkflowSnapshot,
} from "@/lib/types";

interface IdeasPageProps {
  snapshot: WorkflowSnapshot;
  session: SessionState;
  actions: WorkflowActions;
  busy: boolean;
}

const emptyIdeaForm = (submittedById: string): CreateIdeaInput => ({
  show: SHOWS[0],
  angle: "",
  submittedById,
  submittedOn: today(),
  setting: "",
  opening: "",
  tickingClock: "",
  stakes: "",
  goal: "",
  cliffhanger: "",
  note: "",
});

function createBeatDraft(idea: Idea, assignedToId: string): CreateBeatInput {
  return {
    ideaId: idea.id,
    title: "",
    setting: idea.setting,
    opening: idea.opening,
    tickingClock: idea.tickingClock,
    stakes: idea.stakes,
    goal: idea.goal,
    cliffhanger: idea.cliffhanger,
    note: idea.note,
    docLink: "",
    assignedToId,
    assignedRole: "WRITER",
    requestRaisedOn: today(),
    expectedStartDate: today(),
    expectedCompleteDate: today(),
  };
}

export function IdeasPage({ snapshot, session, actions, busy }: IdeasPageProps) {
  const isManager = session.role !== "WRITER";
  const assignablePeople = snapshot.people.filter((person) => person.role === "WRITER" || person.role === "POD_LEAD");
  const [ideaForm, setIdeaForm] = useState<CreateIdeaInput>(() => emptyIdeaForm(session.personId));
  const [filters, setFilters] = useState({
    show: "",
    status: "",
    rank: "",
    submittedById: "",
  });
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [beatForm, setBeatForm] = useState<CreateBeatInput | null>(null);

  useEffect(() => {
    setIdeaForm((current) => {
      if (current.submittedById) {
        return current;
      }

      return emptyIdeaForm(session.personId);
    });
  }, [session.personId]);

  const selectedIdea = snapshot.ideas.find((idea) => idea.id === selectedIdeaId) ?? null;

  const filteredIdeas = useMemo(() => {
    return [...snapshot.ideas]
      .filter((idea) => (filters.show ? idea.show === filters.show : true))
      .filter((idea) => (filters.status ? idea.status === filters.status : true))
      .filter((idea) => (filters.rank ? idea.rank === filters.rank : true))
      .filter((idea) => (filters.submittedById ? idea.submittedById === filters.submittedById : true))
      .sort((left, right) => String(right.submittedOn).localeCompare(String(left.submittedOn)));
  }, [filters, snapshot.ideas]);

  async function handleCreateIdea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await actions.createIdea(ideaForm);
    setIdeaForm(emptyIdeaForm(ideaForm.submittedById));
  }

  async function handleCreateBeat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!beatForm) {
      return;
    }

    await actions.createBeat(beatForm);
    setSelectedIdeaId(null);
    setBeatForm(null);
  }

  function openBeatModal(idea: Idea) {
    setSelectedIdeaId(idea.id);
    setBeatForm(createBeatDraft(idea, assignablePeople[0]?.id ?? ""));
  }

  return (
    <div className="page-stack">
      <div className="split-grid split-grid-wide">
        <Panel
          title="Submit a new idea"
          description="Capture angle, beat framing, and ownership in the same record."
        >
          <form className="form-stack" onSubmit={handleCreateIdea}>
            <div className="form-two-up">
              <label className="field">
                <span>Show</span>
                <select
                  value={ideaForm.show}
                  onChange={(event) => setIdeaForm((current) => ({ ...current, show: event.target.value }))}
                >
                  {SHOWS.map((show) => (
                    <option key={show} value={show}>
                      {show}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Submitted by</span>
                <select
                  value={ideaForm.submittedById}
                  onChange={(event) =>
                    setIdeaForm((current) => ({ ...current, submittedById: event.target.value }))
                  }
                >
                  <option value="">Select a person</option>
                  {snapshot.people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Angle</span>
              <input
                value={ideaForm.angle}
                onChange={(event) => setIdeaForm((current) => ({ ...current, angle: event.target.value }))}
                placeholder="Describe the story angle"
              />
            </label>

            <label className="field">
              <span>Submitted on</span>
              <input
                type="date"
                value={ideaForm.submittedOn}
                onChange={(event) => setIdeaForm((current) => ({ ...current, submittedOn: event.target.value }))}
              />
            </label>

            <div className="form-two-up">
              {[
                ["setting", "Setting"],
                ["opening", "Opening"],
                ["tickingClock", "Ticking clock"],
                ["stakes", "Stakes"],
                ["goal", "Goal"],
                ["cliffhanger", "Cliffhanger"],
                ["note", "Note"],
              ].map(([key, label]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <textarea
                    rows={3}
                    value={ideaForm[key as keyof CreateIdeaInput] as string}
                    onChange={(event) =>
                      setIdeaForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Save idea
              </button>
            </div>
          </form>
        </Panel>

        <Panel title="Idea filters" description="Slice by show, review status, rank, or submitter.">
          <div className="form-two-up">
            <label className="field">
              <span>Show</span>
              <select value={filters.show} onChange={(event) => setFilters((current) => ({ ...current, show: event.target.value }))}>
                <option value="">All shows</option>
                {SHOWS.map((show) => (
                  <option key={show} value={show}>
                    {show}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="">All statuses</option>
                {IDEA_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {IDEA_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Rank</span>
              <select value={filters.rank} onChange={(event) => setFilters((current) => ({ ...current, rank: event.target.value }))}>
                <option value="">All ranks</option>
                {IDEA_RANK_OPTIONS.map((rank) => (
                  <option key={rank} value={rank}>
                    {IDEA_RANK_LABELS[rank]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Submitted by</span>
              <select
                value={filters.submittedById}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    submittedById: event.target.value,
                  }))
                }
              >
                <option value="">Everyone</option>
                {snapshot.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Panel>
      </div>

      <Panel title="Idea backlog" description={`${filteredIdeas.length} idea(s) match the current filters.`}>
        {filteredIdeas.length === 0 ? (
          <EmptyState title="No ideas found" description="Try broadening the filters or add a new idea." />
        ) : (
          <div className="stack-list">
            {filteredIdeas.map((idea) => {
              const relatedBeats = snapshot.beats.filter((beat) => beat.ideaId === idea.id);

              return (
                <article className="entity-card" key={idea.id}>
                  <div className="entity-card-header">
                    <div>
                      <div className="inline-meta">
                        <strong>{idea.code}</strong>
                        <Badge tone="info">{idea.show}</Badge>
                      </div>
                      <h3>{idea.angle}</h3>
                      <p className="meta-line">
                        {idea.submittedByName} · {formatDate(idea.submittedOn)}
                      </p>
                    </div>
                    <div className="badge-cluster">
                      <Badge tone={toneForIdeaStatus(idea.status)}>{IDEA_STATUS_LABELS[idea.status]}</Badge>
                      <Badge tone={toneForIdeaRank(idea.rank)}>{IDEA_RANK_LABELS[idea.rank]}</Badge>
                    </div>
                  </div>

                  <div className="details-grid">
                    {[
                      ["Setting", idea.setting],
                      ["Opening", idea.opening],
                      ["Ticking clock", idea.tickingClock],
                      ["Stakes", idea.stakes],
                      ["Goal", idea.goal],
                      ["Cliffhanger", idea.cliffhanger],
                      ["Note", idea.note],
                    ].map(([label, value]) => (
                      <div className="detail-card" key={label}>
                        <span>{label}</span>
                        <p>{value}</p>
                      </div>
                    ))}
                  </div>

                  {isManager ? (
                    <div className="manager-toolbar">
                      <label className="field compact-field">
                        <span>Rank</span>
                        <select
                          disabled={busy}
                          value={idea.rank}
                          onChange={(event) =>
                            void actions.reviewIdea(idea.id, {
                              rank: event.target.value as typeof idea.rank,
                              status: idea.status,
                            })
                          }
                        >
                          {IDEA_RANK_OPTIONS.map((rank) => (
                            <option key={rank} value={rank}>
                              {IDEA_RANK_LABELS[rank]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="field compact-field">
                        <span>Status</span>
                        <select
                          disabled={busy}
                          value={idea.status}
                          onChange={(event) =>
                            void actions.reviewIdea(idea.id, {
                              status: event.target.value as typeof idea.status,
                              rank: idea.rank,
                            })
                          }
                        >
                          {IDEA_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {IDEA_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        className="secondary-button"
                        disabled={busy || assignablePeople.length === 0}
                        type="button"
                        onClick={() => openBeatModal(idea)}
                      >
                        Assign beat
                      </button>
                    </div>
                  ) : null}

                  <div className="subsection">
                    <div className="subsection-header">
                      <h4>Linked beats</h4>
                    </div>
                    {relatedBeats.length === 0 ? (
                      <p className="muted-copy">No beats have been assigned from this idea yet.</p>
                    ) : (
                      <div className="stack-list compact-list">
                        {relatedBeats.map((beat) => (
                          <div className="list-card" key={beat.id}>
                            <div className="list-card-header">
                              <div>
                                <strong>{beat.code}</strong>
                                <p>{beat.title}</p>
                              </div>
                              <Badge tone={toneForIdeaStatus(idea.status)}>{beat.assignedToName}</Badge>
                            </div>
                            <p className="meta-line">
                              {beat.assignedRole} · {formatDate(beat.expectedCompleteDate)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      {selectedIdea && beatForm ? (
        <Modal title={`Assign beat from ${selectedIdea.code}`} onClose={() => setSelectedIdeaId(null)}>
          <form className="form-stack" onSubmit={handleCreateBeat}>
            <label className="field">
              <span>Beat title</span>
              <input
                value={beatForm.title}
                onChange={(event) => setBeatForm((current) => (current ? { ...current, title: event.target.value } : current))}
              />
            </label>

            <div className="form-two-up">
              {[
                ["setting", "Setting"],
                ["opening", "Opening"],
                ["tickingClock", "Ticking clock"],
                ["stakes", "Stakes"],
                ["goal", "Goal"],
                ["cliffhanger", "Cliffhanger"],
                ["note", "Note"],
              ].map(([key, label]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <textarea
                    rows={3}
                    value={String(beatForm[key as keyof CreateBeatInput] ?? "")}
                    onChange={(event) =>
                      setBeatForm((current) =>
                        current
                          ? {
                              ...current,
                              [key]: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </label>
              ))}
            </div>

            <div className="form-two-up">
              <label className="field">
                <span>Assign to</span>
                <select
                  value={beatForm.assignedToId}
                  onChange={(event) =>
                    setBeatForm((current) => (current ? { ...current, assignedToId: event.target.value } : current))
                  }
                >
                  <option value="">Select a person</option>
                  {assignablePeople.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Role</span>
                <select
                  value={beatForm.assignedRole}
                  onChange={(event) =>
                    setBeatForm((current) =>
                      current
                        ? {
                            ...current,
                            assignedRole: event.target.value as CreateBeatInput["assignedRole"],
                          }
                        : current,
                    )
                  }
                >
                  <option value="WRITER">Writer</option>
                  <option value="POD_LEAD">POD Lead</option>
                </select>
              </label>
            </div>

            <div className="form-three-up">
              <label className="field">
                <span>Request raised on</span>
                <input
                  type="date"
                  value={beatForm.requestRaisedOn}
                  onChange={(event) =>
                    setBeatForm((current) => (current ? { ...current, requestRaisedOn: event.target.value } : current))
                  }
                />
              </label>

              <label className="field">
                <span>Expected start</span>
                <input
                  type="date"
                  value={beatForm.expectedStartDate}
                  onChange={(event) =>
                    setBeatForm((current) => (current ? { ...current, expectedStartDate: event.target.value } : current))
                  }
                />
              </label>

              <label className="field">
                <span>Expected complete</span>
                <input
                  type="date"
                  value={beatForm.expectedCompleteDate}
                  onChange={(event) =>
                    setBeatForm((current) => (current ? { ...current, expectedCompleteDate: event.target.value } : current))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Beat doc link</span>
              <input
                value={beatForm.docLink}
                onChange={(event) => setBeatForm((current) => (current ? { ...current, docLink: event.target.value } : current))}
                placeholder="https://docs.google.com/..."
              />
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Create beat
              </button>
              <button className="secondary-button" type="button" onClick={() => setSelectedIdeaId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
