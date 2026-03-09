import { useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import { Panel } from "@/components/Panel";
import { toneForBeatStatus } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getSchemaVariableLabelMap, getSchemaVariableOptions } from "@/lib/schemaVariables";
import type { ReviewBeatInput, SessionState, WorkflowActions, WorkflowSnapshot } from "@/lib/types";

interface BeatsPageProps {
  snapshot: WorkflowSnapshot;
  session: SessionState;
  actions: WorkflowActions;
  busy: boolean;
}

export function BeatsPage({ snapshot, session, actions, busy }: BeatsPageProps) {
  const beatStatusOptions = useMemo(() => getSchemaVariableOptions(snapshot, "BEAT_STATUS"), [snapshot]);
  const beatStatusLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "BEAT_STATUS"), [snapshot]);
  const beatAssigneeRoleOptions = useMemo(() => getSchemaVariableOptions(snapshot, "BEAT_ASSIGNEE_ROLE"), [snapshot]);
  const beatAssigneeRoleLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "BEAT_ASSIGNEE_ROLE"), [snapshot]);
  const reviewDecisionOptions = useMemo(
    () => beatStatusOptions.filter((status) => status === "APPROVED_FOR_SCRIPT_WRITING" || status === "TO_BE_REDONE"),
    [beatStatusOptions],
  );
  const [filters, setFilters] = useState({
    status: "",
    assignedToId: "",
    ideaId: "",
  });
  const [submitBeatId, setSubmitBeatId] = useState<string | null>(null);
  const [submitDocLink, setSubmitDocLink] = useState("");
  const [reviewBeatId, setReviewBeatId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewBeatInput>({
    decision: "APPROVED_FOR_SCRIPT_WRITING",
    reviewedById: session.personId,
    notes: "",
  });
  const assignablePeople = useMemo(
    () => snapshot.people.filter((person) => beatAssigneeRoleOptions.includes(person.role)),
    [beatAssigneeRoleOptions, snapshot.people],
  );

  const visibleBeats = useMemo(() => {
    return [...snapshot.beats]
      .filter((beat) => (filters.status ? beat.status === filters.status : true))
      .filter((beat) => (filters.assignedToId ? beat.assignedToId === filters.assignedToId : true))
      .filter((beat) => (filters.ideaId ? beat.ideaId === filters.ideaId : true))
      .sort((left, right) => String(right.requestRaisedOn).localeCompare(String(left.requestRaisedOn)));
  }, [filters, snapshot.beats]);

  const submitTarget = snapshot.beats.find((beat) => beat.id === submitBeatId) ?? null;
  const reviewTarget = snapshot.beats.find((beat) => beat.id === reviewBeatId) ?? null;
  async function handleSubmitBeat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!submitTarget) {
      return;
    }

    await actions.submitBeat(submitTarget.id, { docLink: submitDocLink });
    setSubmitBeatId(null);
    setSubmitDocLink("");
  }

  async function handleReviewBeat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reviewTarget) {
      return;
    }

    await actions.reviewBeat(reviewTarget.id, reviewForm);
    setReviewBeatId(null);
  }

  return (
    <div className="page-stack">
      <Panel title="Beat queue" description="Track beat creation, submission, approvals, and redo loops.">
        <div className="form-three-up">
          <label className="field">
            <span>Status</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">All statuses</option>
              {beatStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {beatStatusLabels[status] ?? status}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Assigned to</span>
            <select
              value={filters.assignedToId}
              onChange={(event) => setFilters((current) => ({ ...current, assignedToId: event.target.value }))}
            >
              <option value="">Everyone</option>
              {assignablePeople.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Idea</span>
            <select value={filters.ideaId} onChange={(event) => setFilters((current) => ({ ...current, ideaId: event.target.value }))}>
              <option value="">All ideas</option>
              {snapshot.ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.code} · {idea.angle}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <div className="metrics-grid">
        {beatStatusOptions.map((status) => (
          <div className="metric-card" key={status}>
            <span>{beatStatusLabels[status] ?? status}</span>
            <strong>{snapshot.beats.filter((beat) => beat.status === status).length}</strong>
            <p>beats</p>
          </div>
        ))}
      </div>

      <Panel title="Beat records" description={`${visibleBeats.length} beat(s) match the current filters.`}>
        {visibleBeats.length === 0 ? (
          <EmptyState title="No beats found" description="Change the filters or assign new beats from ideas." />
        ) : (
          <div className="stack-list">
            {visibleBeats.map((beat) => {
              const canSubmit =
                session.personId === beat.assignedToId &&
                (beat.status === "ASSIGNED" || beat.status === "TO_BE_REDONE");
              const canReview = session.role !== "WRITER" && beat.status === "SUBMITTED";

              return (
                <article className="entity-card" key={beat.id}>
                  <div className="entity-card-header">
                    <div>
                      <div className="inline-meta">
                        <strong>{beat.code}</strong>
                        <Badge tone="info">{beat.ideaCode}</Badge>
                      </div>
                      <h3>{beat.title}</h3>
                      <p className="meta-line">
                        {beat.assignedToName} · {beatAssigneeRoleLabels[beat.assignedRole] ?? beat.assignedRole} · Due{" "}
                        {formatDate(beat.expectedCompleteDate)}
                      </p>
                    </div>
                    <Badge tone={toneForBeatStatus(beat.status)}>{beatStatusLabels[beat.status] ?? beat.status}</Badge>
                  </div>

                  <div className="details-grid">
                    {[
                      ["Setting", beat.setting],
                      ["Opening", beat.opening],
                      ["Ticking clock", beat.tickingClock],
                      ["Stakes", beat.stakes],
                      ["Goal", beat.goal],
                      ["Cliffhanger", beat.cliffhanger],
                      ["Note", beat.note],
                    ].map(([label, value]) => (
                      <div className="detail-card" key={label}>
                        <span>{label}</span>
                        <p>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="meta-grid">
                    <div className="detail-card">
                      <span>Idea</span>
                      <p>{beat.ideaAngle}</p>
                    </div>
                    <div className="detail-card">
                      <span>Request raised</span>
                      <p>{formatDate(beat.requestRaisedOn)}</p>
                    </div>
                    <div className="detail-card">
                      <span>Expected start</span>
                      <p>{formatDate(beat.expectedStartDate)}</p>
                    </div>
                    <div className="detail-card">
                      <span>Doc link</span>
                      <p>
                        {beat.docLink ? (
                          <a href={beat.docLink} rel="noreferrer" target="_blank">
                            Open doc
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                  </div>

                  {beat.reviewNotes ? (
                    <div className="callout callout-danger">
                      <strong>Review note</strong>
                      <p>{beat.reviewNotes}</p>
                    </div>
                  ) : null}

                  <div className="button-row">
                    {canSubmit ? (
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => {
                          setSubmitBeatId(beat.id);
                          setSubmitDocLink(beat.docLink ?? "");
                        }}
                      >
                        {beat.status === "TO_BE_REDONE" ? "Resubmit beat" : "Submit beat"}
                      </button>
                    ) : null}

                    {canReview ? (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => {
                        setReviewBeatId(beat.id);
                        setReviewForm({
                          decision: "APPROVED_FOR_SCRIPT_WRITING",
                          reviewedById: session.personId,
                          notes: beat.reviewNotes ?? "",
                        });
                      }}
                    >
                        Review beat
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      {submitTarget ? (
        <Modal title={`Submit ${submitTarget.code}`} onClose={() => setSubmitBeatId(null)}>
          <form className="form-stack" onSubmit={handleSubmitBeat}>
            <label className="field">
              <span>Beat doc link</span>
              <input value={submitDocLink} onChange={(event) => setSubmitDocLink(event.target.value)} />
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Submit
              </button>
              <button className="secondary-button" type="button" onClick={() => setSubmitBeatId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {reviewTarget ? (
        <Modal title={`Review ${reviewTarget.code}`} onClose={() => setReviewBeatId(null)}>
          <form className="form-stack" onSubmit={handleReviewBeat}>
            <label className="field">
              <span>Decision</span>
              <select
                value={reviewForm.decision}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    decision: event.target.value as ReviewBeatInput["decision"],
                  }))
                }
              >
                {reviewDecisionOptions.map((status) => (
                  <option key={status} value={status}>
                    {beatStatusLabels[status] ?? status}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Reviewed by</span>
              <input readOnly value={session.personName} />
            </label>

            <label className="field">
              <span>Review notes</span>
              <textarea
                rows={4}
                value={reviewForm.notes ?? ""}
                onChange={(event) => setReviewForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Save review
              </button>
              <button className="secondary-button" type="button" onClick={() => setReviewBeatId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
