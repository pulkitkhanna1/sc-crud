import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import { Panel } from "@/components/Panel";
import {
  toneForAssignmentGrade,
  toneForAssignmentStatus,
  toneForBeatStatus,
} from "@/lib/constants";
import { formatDate, formatDateTime, today } from "@/lib/format";
import { getSchemaVariableLabelMap, getSchemaVariableOptions } from "@/lib/schemaVariables";
import { getVisibleAssignments, getVisibleBeats } from "@/lib/visibility";
import type {
  CreateBeatAssignmentInput,
  CreateImprovementAssignmentInput,
  ProductionInput,
  ReviewAssignmentInput,
  SessionState,
  WorkflowActions,
  WorkflowSnapshot,
} from "@/lib/types";

interface AssignmentsPageProps {
  snapshot: WorkflowSnapshot;
  session: SessionState;
  actions: WorkflowActions;
  busy: boolean;
}

const emptyImprovementForm = (show: string, writerId: string, podLeadId: string): CreateImprovementAssignmentInput => ({
  show,
  angle: "",
  writerId,
  podLeadId,
  dateAssigned: today(),
  dateDue: today(),
  notes: "",
  editCode: "",
  codeToRework: "",
  updatedBeats: "",
});

export function AssignmentsPage({ snapshot, session, actions, busy }: AssignmentsPageProps) {
  const isManager = session.role !== "WRITER";
  const showNames = useMemo(() => snapshot.shows.map((show) => show.name), [snapshot.shows]);
  const assignmentStatusOptions = useMemo(() => getSchemaVariableOptions(snapshot, "ASSIGNMENT_STATUS"), [snapshot]);
  const assignmentStatusLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "ASSIGNMENT_STATUS"), [snapshot]);
  const assignmentTypeOptions = useMemo(() => getSchemaVariableOptions(snapshot, "ASSIGNMENT_TYPE"), [snapshot]);
  const assignmentTypeLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "ASSIGNMENT_TYPE"), [snapshot]);
  const assignmentGradeOptions = useMemo(() => getSchemaVariableOptions(snapshot, "ASSIGNMENT_GRADE"), [snapshot]);
  const assignmentGradeLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "ASSIGNMENT_GRADE"), [snapshot]);
  const productionTypeOptions = useMemo(() => getSchemaVariableOptions(snapshot, "PRODUCTION_TYPE"), [snapshot]);
  const productionTypeLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "PRODUCTION_TYPE"), [snapshot]);
  const beatStatusLabels = useMemo(() => getSchemaVariableLabelMap(snapshot, "BEAT_STATUS"), [snapshot]);
  const visibleAssignments = useMemo(() => getVisibleAssignments(snapshot, session), [session, snapshot]);
  const visibleBeats = useMemo(() => getVisibleBeats(snapshot, session, visibleAssignments), [session, snapshot, visibleAssignments]);
  const writers = useMemo(() => snapshot.people.filter((person) => person.role === "WRITER"), [snapshot.people]);
  const podLeads = useMemo(() => snapshot.people.filter((person) => person.role === "POD_LEAD"), [snapshot.people]);
  const canCreateAssignments = writers.length > 0 && podLeads.length > 0;
  const canCreateImprovements = canCreateAssignments && showNames.length > 0;

  const defaultPodLeadId = session.role === "POD_LEAD" ? session.personId : podLeads[0]?.id ?? "";
  const defaultWriterId = writers[0]?.id ?? "";

  const [assignBeatId, setAssignBeatId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState<CreateBeatAssignmentInput>({
    beatId: "",
    writerId: defaultWriterId,
    podLeadId: defaultPodLeadId,
    dateAssigned: today(),
    dateDue: today(),
    notes: "",
    editCode: "",
  });
  const [improvementOpen, setImprovementOpen] = useState(false);
  const [improvementForm, setImprovementForm] = useState<CreateImprovementAssignmentInput>(
    emptyImprovementForm(showNames[0] || "", defaultWriterId, defaultPodLeadId),
  );
  const [submitAssignmentId, setSubmitAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [reviewAssignmentId, setReviewAssignmentId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewAssignmentInput>({
    grade: "STRONG_OUTPUT",
    feedback: "",
    finalOutput: "",
  });
  const [productionAssignmentId, setProductionAssignmentId] = useState<string | null>(null);
  const [productionForm, setProductionForm] = useState<ProductionInput>({
    prodSuffix: "GA",
  });
  const [filters, setFilters] = useState({
    search: "",
    writerId: "",
    podLeadId: "",
    status: "",
    assignmentType: "",
  });

  useEffect(() => {
    setImprovementForm((current) => ({
      ...current,
      show: showNames.includes(current.show) ? current.show : showNames[0] ?? "",
      writerId: writers.some((writer) => writer.id === current.writerId) ? current.writerId : defaultWriterId,
      podLeadId: podLeads.some((podLead) => podLead.id === current.podLeadId) ? current.podLeadId : defaultPodLeadId,
    }));
  }, [defaultPodLeadId, defaultWriterId, podLeads, showNames, writers]);

  const pendingReviews = visibleAssignments
    .filter((assignment) => assignment.status === "COMPLETED_BY_WRITER")
    .sort((left, right) => String(right.submittedAt).localeCompare(String(left.submittedAt)));

  const myAssignments = visibleAssignments
    .filter((assignment) => assignment.writerId === session.personId)
    .sort((left, right) => String(right.dateAssigned).localeCompare(String(left.dateAssigned)));

  const openImprovements = visibleAssignments
    .filter((assignment) => assignment.assignmentType === "IMPROVEMENT")
    .sort((left, right) => String(right.dateAssigned).localeCompare(String(left.dateAssigned)));

  const approvedBeats = visibleBeats.filter((beat) => beat.status === "APPROVED_FOR_SCRIPT_WRITING");
  const assignedBeatIds = new Set(snapshot.assignments.filter((assignment) => assignment.beatId).map((assignment) => assignment.beatId));
  const readyForAssignment = approvedBeats.filter((beat) => !assignedBeatIds.has(beat.id));

  const filteredAssignments = useMemo(() => {
    return [...visibleAssignments]
      .filter((assignment) => {
        const needle = filters.search.trim().toLowerCase();
        if (!needle) {
          return true;
        }

        return [assignment.code, assignment.editCode, assignment.angle]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle));
      })
      .filter((assignment) => (filters.writerId ? assignment.writerId === filters.writerId : true))
      .filter((assignment) => (filters.podLeadId ? assignment.podLeadId === filters.podLeadId : true))
      .filter((assignment) => (filters.status ? assignment.status === filters.status : true))
      .filter((assignment) => (filters.assignmentType ? assignment.assignmentType === filters.assignmentType : true))
      .sort((left, right) => String(right.dateAssigned).localeCompare(String(left.dateAssigned)));
  }, [filters, visibleAssignments]);

  const assignTarget = visibleBeats.find((beat) => beat.id === assignBeatId) ?? null;
  const submitTarget = visibleAssignments.find((assignment) => assignment.id === submitAssignmentId) ?? null;
  const reviewTarget = visibleAssignments.find((assignment) => assignment.id === reviewAssignmentId) ?? null;
  const productionTarget = visibleAssignments.find((assignment) => assignment.id === productionAssignmentId) ?? null;

  function openAssignBeat(beatId: string) {
    setAssignBeatId(beatId);
    setAssignForm({
      beatId,
      writerId: defaultWriterId,
      podLeadId: defaultPodLeadId,
      dateAssigned: today(),
      dateDue: today(),
      notes: "",
      editCode: "",
    });
  }

  async function handleCreateAssignmentFromBeat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await actions.createAssignmentFromBeat(assignForm);
    setAssignBeatId(null);
  }

  async function handleCreateImprovement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await actions.createImprovementAssignment(improvementForm);
    setImprovementOpen(false);
    setImprovementForm(emptyImprovementForm(showNames[0] || "", defaultWriterId, defaultPodLeadId));
  }

  async function handleSubmitAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!submitTarget) {
      return;
    }

    await actions.submitAssignment(submitTarget.id, { submission: submissionText });
    setSubmitAssignmentId(null);
    setSubmissionText("");
  }

  async function handleReviewAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reviewTarget) {
      return;
    }

    const grade = reviewForm.grade;
    await actions.reviewAssignment(reviewTarget.id, reviewForm);
    setReviewAssignmentId(null);

    if (grade === "STRONG_OUTPUT") {
      setProductionAssignmentId(reviewTarget.id);
      setProductionForm({ prodSuffix: "GA" });
    }
  }

  async function handleMarkProductionReady(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productionTarget) {
      return;
    }

    await actions.markAssignmentReady(productionTarget.id, productionForm);
    setProductionAssignmentId(null);
  }

  return (
    <div className="page-stack">
      <div className="metrics-grid">
        <div className="metric-card">
          <span>Pending reviews</span>
          <strong>{pendingReviews.length}</strong>
          <p>completed scripts to grade</p>
        </div>
        <div className="metric-card">
          <span>Ready to assign</span>
          <strong>{readyForAssignment.length}</strong>
          <p>approved beats with no script owner</p>
        </div>
        <div className="metric-card">
          <span>Improvement requests</span>
          <strong>{openImprovements.length}</strong>
          <p>active or historical rework rows</p>
        </div>
        <div className="metric-card">
          <span>Production ready</span>
          <strong>{visibleAssignments.filter((assignment) => assignment.status === "READY_FOR_PRODUCTION").length}</strong>
          <p>scripts ready for downstream use</p>
        </div>
      </div>

      {isManager ? (
        <Panel title="Review queue" description="Submissions that still need grading and a production decision.">
          {pendingReviews.length === 0 ? (
            <EmptyState title="Review queue is clear" description="No scripts are waiting for grading right now." />
          ) : (
            <div className="stack-list">
              {pendingReviews.map((assignment) => (
                <article className="list-card" key={assignment.id}>
                  <div className="list-card-header">
                    <div>
                      <strong>{assignment.code}</strong>
                      <p>{assignment.angle}</p>
                    </div>
                    <Badge tone={toneForAssignmentStatus(assignment.status)}>
                      {assignmentStatusLabels[assignment.status] ?? assignment.status}
                    </Badge>
                  </div>
                  <p className="meta-line">
                    {assignment.writerName} · Submitted {formatDateTime(assignment.submittedAt)}
                  </p>
                  <div className="button-row">
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => {
                        setReviewAssignmentId(assignment.id);
                        setReviewForm({
                          grade: "STRONG_OUTPUT",
                          feedback: assignment.feedback,
                          finalOutput: assignment.finalOutput,
                        });
                      }}
                    >
                      Review submission
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      ) : null}

      {isManager ? (
        <Panel title="Approved beats ready for assignment" description="Approved beats that do not yet have a writing assignment.">
          {!canCreateAssignments ? (
            <div className="callout callout-danger">
              <strong>Writers and POD leads are required</strong>
              <p>Add at least one writer and one POD lead from the Admin tab before creating assignments.</p>
            </div>
          ) : null}

          {readyForAssignment.length === 0 ? (
            <EmptyState title="Everything is assigned" description="All approved beats already have a writer." />
          ) : (
            <div className="stack-list">
              {readyForAssignment.map((beat) => (
                <article className="entity-card" key={beat.id}>
                  <div className="entity-card-header">
                    <div>
                      <div className="inline-meta">
                        <strong>{beat.code}</strong>
                        <Badge tone="info">{beat.ideaCode}</Badge>
                      </div>
                      <h3>{beat.title}</h3>
                      <p className="meta-line">
                        {beat.ideaShow} · {beat.assignedToName}
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
                    ].map(([label, value]) => (
                      <div className="detail-card" key={label}>
                        <span>{label}</span>
                        <p>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="button-row">
                    <button
                      className="secondary-button"
                      disabled={!canCreateAssignments}
                      type="button"
                      onClick={() => openAssignBeat(beat.id)}
                    >
                      Assign to writer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      ) : null}

      {isManager ? (
        <Panel
          title="Improvement requests"
          description="Track rework assignments and create new improvement briefs."
          action={
            <button
              className="secondary-button"
              disabled={!canCreateImprovements}
              type="button"
              onClick={() => setImprovementOpen(true)}
            >
              New improvement request
            </button>
          }
        >
          {!canCreateImprovements ? (
            <div className="callout callout-danger">
              <strong>Shows, writers, and POD leads are required</strong>
              <p>Add the missing setup data from the Admin tab before creating improvement briefs.</p>
            </div>
          ) : null}

          {openImprovements.length === 0 ? (
            <EmptyState title="No improvement work yet" description="Create a rework request when a script needs a fresh pass." />
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Edit code</th>
                    <th>Show</th>
                    <th>Angle</th>
                    <th>Writer</th>
                    <th>Status</th>
                    <th>Rework</th>
                  </tr>
                </thead>
                <tbody>
                  {openImprovements.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{assignment.code}</td>
                      <td>{assignment.editCode}</td>
                      <td>{assignment.show}</td>
                      <td>{assignment.angle}</td>
                      <td>{assignment.writerName}</td>
                      <td>
                        <Badge tone={toneForAssignmentStatus(assignment.status)}>
                          {assignmentStatusLabels[assignment.status] ?? assignment.status}
                        </Badge>
                      </td>
                      <td>{assignment.codeToRework || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      ) : null}

      {session.role === "WRITER" ? (
        <Panel title="My assignments" description="Everything currently assigned to you as a writer.">
          {myAssignments.length === 0 ? (
            <EmptyState title="No assignments yet" description="You do not have any active writing tasks right now." />
          ) : (
            <div className="stack-list">
              {myAssignments.map((assignment) => {
                const canSubmit =
                  assignment.status === "ASSIGNED_TO_WRITER" || assignment.status === "REWRITE_REQUIRED";

                return (
                  <article className="entity-card" key={assignment.id}>
                    <div className="entity-card-header">
                      <div>
                        <div className="inline-meta">
                          <strong>{assignment.code}</strong>
                          <Badge tone="info">{assignment.editCode}</Badge>
                          <Badge tone="muted">{assignmentTypeLabels[assignment.assignmentType] ?? assignment.assignmentType}</Badge>
                        </div>
                        <h3>{assignment.angle}</h3>
                        <p className="meta-line">
                          Due {formatDate(assignment.dateDue)} · POD lead {assignment.podLeadName}
                        </p>
                      </div>
                      <div className="badge-cluster">
                        <Badge tone={toneForAssignmentStatus(assignment.status)}>
                          {assignmentStatusLabels[assignment.status] ?? assignment.status}
                        </Badge>
                        {assignment.grade ? (
                          <Badge tone={toneForAssignmentGrade(assignment.grade)}>
                            {assignmentGradeLabels[assignment.grade] ?? assignment.grade}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="meta-grid">
                      <div className="detail-card">
                        <span>Brief</span>
                        <p>{assignment.notes || "—"}</p>
                      </div>
                      <div className="detail-card">
                        <span>Submission</span>
                        <p>{assignment.submission || "Not submitted yet"}</p>
                      </div>
                      <div className="detail-card">
                        <span>Feedback</span>
                        <p>{assignment.feedback || "—"}</p>
                      </div>
                      <div className="detail-card">
                        <span>Updated beats</span>
                        <p>
                          {assignment.updatedBeats ? (
                            <a href={assignment.updatedBeats} rel="noreferrer" target="_blank">
                              Open doc
                            </a>
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="button-row">
                      {canSubmit ? (
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => {
                            setSubmitAssignmentId(assignment.id);
                            setSubmissionText(assignment.submission);
                          }}
                        >
                          {assignment.status === "REWRITE_REQUIRED" ? "Resubmit script" : "Submit script"}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Panel>
      ) : null}

      <Panel title="All assignments" description="Filter the entire writing queue across new work, reworks, and production.">
        <div className="form-four-up">
          <label className="field">
            <span>Search</span>
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Code, edit code, or angle"
            />
          </label>

          <label className="field">
            <span>Writer</span>
            <select value={filters.writerId} onChange={(event) => setFilters((current) => ({ ...current, writerId: event.target.value }))}>
              <option value="">All writers</option>
              {writers.map((writer) => (
                <option key={writer.id} value={writer.id}>
                  {writer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>POD lead</span>
            <select value={filters.podLeadId} onChange={(event) => setFilters((current) => ({ ...current, podLeadId: event.target.value }))}>
              <option value="">All POD leads</option>
              {podLeads.map((podLead) => (
                <option key={podLead.id} value={podLead.id}>
                  {podLead.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">All statuses</option>
              {assignmentStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {assignmentStatusLabels[status] ?? status}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Type</span>
            <select
              value={filters.assignmentType}
              onChange={(event) => setFilters((current) => ({ ...current, assignmentType: event.target.value }))}
            >
              <option value="">All types</option>
              {assignmentTypeOptions.map((assignmentType) => (
                <option key={assignmentType} value={assignmentType}>
                  {assignmentTypeLabels[assignmentType] ?? assignmentType}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredAssignments.length === 0 ? (
          <EmptyState title="No assignments found" description="Try broadening the filters." />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Edit code</th>
                  <th>Type</th>
                  <th>Angle</th>
                  <th>Writer</th>
                  <th>POD lead</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => {
                  const showReviewButton = isManager && assignment.status === "COMPLETED_BY_WRITER";
                  const showProductionButton =
                    isManager && assignment.status === "COMPLETED_BY_WRITER" && assignment.grade === "STRONG_OUTPUT";

                  return (
                    <tr key={assignment.id}>
                      <td>{assignment.code}</td>
                      <td>{assignment.editCode}</td>
                      <td>{assignmentTypeLabels[assignment.assignmentType] ?? assignment.assignmentType}</td>
                      <td>{assignment.angle}</td>
                      <td>{assignment.writerName}</td>
                      <td>{assignment.podLeadName}</td>
                      <td>{formatDate(assignment.dateDue)}</td>
                      <td>
                        <Badge tone={toneForAssignmentStatus(assignment.status)}>
                          {assignmentStatusLabels[assignment.status] ?? assignment.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="table-actions">
                          {showReviewButton ? (
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => {
                                setReviewAssignmentId(assignment.id);
                                setReviewForm({
                                  grade: assignment.grade ?? "STRONG_OUTPUT",
                                  feedback: assignment.feedback,
                                  finalOutput: assignment.finalOutput,
                                });
                              }}
                            >
                              Review
                            </button>
                          ) : null}
                          {showProductionButton ? (
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => {
                                setProductionAssignmentId(assignment.id);
                                setProductionForm({ prodSuffix: assignment.prodSuffix ?? "GA" });
                              }}
                            >
                              Production
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {assignTarget ? (
        <Modal title={`Assign ${assignTarget.code}`} onClose={() => setAssignBeatId(null)}>
          <form className="form-stack" onSubmit={handleCreateAssignmentFromBeat}>
            <label className="field">
              <span>Edit code</span>
              <input
                value={assignForm.editCode}
                onChange={(event) => setAssignForm((current) => ({ ...current, editCode: event.target.value }))}
                placeholder="GA1042 or GU2050"
              />
            </label>

            <div className="form-two-up">
              <label className="field">
                <span>Writer</span>
                <select
                  value={assignForm.writerId}
                  onChange={(event) => setAssignForm((current) => ({ ...current, writerId: event.target.value }))}
                >
                  <option value="">Select writer</option>
                  {writers.map((writer) => (
                    <option key={writer.id} value={writer.id}>
                      {writer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>POD lead</span>
                <select
                  value={assignForm.podLeadId}
                  onChange={(event) => setAssignForm((current) => ({ ...current, podLeadId: event.target.value }))}
                >
                  <option value="">Select POD lead</option>
                  {podLeads.map((podLead) => (
                    <option key={podLead.id} value={podLead.id}>
                      {podLead.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-two-up">
              <label className="field">
                <span>Date assigned</span>
                <input
                  type="date"
                  value={assignForm.dateAssigned}
                  onChange={(event) => setAssignForm((current) => ({ ...current, dateAssigned: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Date due</span>
                <input
                  type="date"
                  value={assignForm.dateDue}
                  onChange={(event) => setAssignForm((current) => ({ ...current, dateDue: event.target.value }))}
                />
              </label>
            </div>

            <label className="field">
              <span>Brief / notes</span>
              <textarea
                rows={4}
                value={assignForm.notes}
                onChange={(event) => setAssignForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Create assignment
              </button>
              <button className="secondary-button" type="button" onClick={() => setAssignBeatId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {improvementOpen ? (
        <Modal title="New improvement request" onClose={() => setImprovementOpen(false)}>
          <form className="form-stack" onSubmit={handleCreateImprovement}>
            <div className="form-two-up">
              <label className="field">
                <span>Show</span>
                <select
                  value={improvementForm.show}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      show: event.target.value,
                    }))
                  }
                >
                  {showNames.map((show) => (
                    <option key={show} value={show}>
                      {show}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Edit code</span>
                <input
                  value={improvementForm.editCode}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      editCode: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Angle</span>
              <input
                value={improvementForm.angle}
                onChange={(event) =>
                  setImprovementForm((current) => ({
                    ...current,
                    angle: event.target.value,
                  }))
                }
              />
            </label>

            <div className="form-two-up">
              <label className="field">
                <span>Code to rework</span>
                <input
                  value={improvementForm.codeToRework}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      codeToRework: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Updated beats link</span>
                <input
                  value={improvementForm.updatedBeats}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      updatedBeats: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="form-two-up">
              <label className="field">
                <span>Writer</span>
                <select
                  value={improvementForm.writerId}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      writerId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select writer</option>
                  {writers.map((writer) => (
                    <option key={writer.id} value={writer.id}>
                      {writer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>POD lead</span>
                <select
                  value={improvementForm.podLeadId}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      podLeadId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select POD lead</option>
                  {podLeads.map((podLead) => (
                    <option key={podLead.id} value={podLead.id}>
                      {podLead.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-two-up">
              <label className="field">
                <span>Date assigned</span>
                <input
                  type="date"
                  value={improvementForm.dateAssigned}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      dateAssigned: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Date due</span>
                <input
                  type="date"
                  value={improvementForm.dateDue}
                  onChange={(event) =>
                    setImprovementForm((current) => ({
                      ...current,
                      dateDue: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Brief / notes</span>
              <textarea
                rows={4}
                value={improvementForm.notes}
                onChange={(event) =>
                  setImprovementForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Save improvement request
              </button>
              <button className="secondary-button" type="button" onClick={() => setImprovementOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {submitTarget ? (
        <Modal title={`Submit ${submitTarget.code}`} onClose={() => setSubmitAssignmentId(null)}>
          <form className="form-stack" onSubmit={handleSubmitAssignment}>
            <label className="field">
              <span>Submission</span>
              <textarea rows={10} value={submissionText} onChange={(event) => setSubmissionText(event.target.value)} />
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Submit script
              </button>
              <button className="secondary-button" type="button" onClick={() => setSubmitAssignmentId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {reviewTarget ? (
        <Modal title={`Review ${reviewTarget.code}`} onClose={() => setReviewAssignmentId(null)}>
          <form className="form-stack" onSubmit={handleReviewAssignment}>
            <label className="field">
              <span>Grade</span>
              <select
                value={reviewForm.grade}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    grade: event.target.value,
                  }))
                }
              >
                {assignmentGradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {assignmentGradeLabels[grade] ?? grade}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Final output</span>
              <textarea
                rows={8}
                value={reviewForm.finalOutput}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    finalOutput: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Feedback</span>
              <textarea
                rows={4}
                value={reviewForm.feedback}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    feedback: event.target.value,
                  }))
                }
              />
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Save review
              </button>
              <button className="secondary-button" type="button" onClick={() => setReviewAssignmentId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {productionTarget ? (
        <Modal title={`Production handoff for ${productionTarget.code}`} onClose={() => setProductionAssignmentId(null)}>
          <form className="form-stack" onSubmit={handleMarkProductionReady}>
            <label className="field">
              <span>Production type</span>
              <select
                value={productionForm.prodSuffix}
                onChange={(event) =>
                  setProductionForm({
                    prodSuffix: event.target.value as ProductionInput["prodSuffix"],
                  })
                }
              >
                {productionTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {productionTypeLabels[option] ?? option}
                  </option>
                ))}
              </select>
            </label>

            <div className="button-row">
              <button className="primary-button" disabled={busy} type="submit">
                Mark ready for production
              </button>
              <button className="secondary-button" type="button" onClick={() => setProductionAssignmentId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
