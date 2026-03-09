import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Panel } from "@/components/Panel";
import { toneForAssignmentStatus, toneForBeatStatus, toneForIdeaStatus } from "@/lib/constants";
import { formatDate, formatDateTime, isPastDate } from "@/lib/format";
import { getSchemaVariableLabel, getSchemaVariableLabelMap, getSchemaVariables } from "@/lib/schemaVariables";
import { getVisibleAssignments, getVisibleBeats, getVisibleIdeas } from "@/lib/visibility";
import type { SessionState, WorkflowSnapshot } from "@/lib/types";

interface OverviewPageProps {
  snapshot: WorkflowSnapshot;
  session: SessionState;
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function OverviewPage({ snapshot, session }: OverviewPageProps) {
  const ideaStatuses = getSchemaVariables(snapshot, "IDEA_STATUS");
  const beatStatuses = getSchemaVariables(snapshot, "BEAT_STATUS");
  const assignmentStatuses = getSchemaVariables(snapshot, "ASSIGNMENT_STATUS");
  const visibleAssignments = getVisibleAssignments(snapshot, session);
  const visibleBeats = getVisibleBeats(snapshot, session, visibleAssignments);
  const visibleIdeas = getVisibleIdeas(snapshot, session, visibleBeats);
  const ideaCounts = countBy(visibleIdeas.map((item) => item.status));
  const beatCounts = countBy(visibleBeats.map((item) => item.status));
  const assignmentCounts = countBy(visibleAssignments.map((item) => item.status));
  const beatStatusLabels = getSchemaVariableLabelMap(snapshot, "BEAT_STATUS");
  const assignmentStatusLabels = getSchemaVariableLabelMap(snapshot, "ASSIGNMENT_STATUS");

  const pendingBeatReviews = visibleBeats
    .filter((beat) => beat.status === "SUBMITTED")
    .sort((left, right) => String(left.expectedCompleteDate).localeCompare(String(right.expectedCompleteDate)));

  const pendingScriptReviews = visibleAssignments
    .filter((assignment) => assignment.status === "COMPLETED_BY_WRITER")
    .sort((left, right) => String(left.submittedAt).localeCompare(String(right.submittedAt)));

  const upcomingAssignments = visibleAssignments
    .filter((assignment) => assignment.status !== "READY_FOR_PRODUCTION")
    .sort((left, right) => String(left.dateDue).localeCompare(String(right.dateDue)))
    .slice(0, 6);

  const readyForProduction = visibleAssignments
    .filter((assignment) => assignment.status === "READY_FOR_PRODUCTION")
    .sort((left, right) => String(right.productionReadyAt).localeCompare(String(left.productionReadyAt)))
    .slice(0, 6);

  return (
    <div className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Workflow Control Center</p>
          <h1>CPI content pipeline</h1>
          <p className="hero-copy">
            Ideas, beats, writing assignments, reworks, and production readiness now live in one persisted system.
          </p>
        </div>
        <div className="hero-session">
          <span className="hero-meta">Current session</span>
          <strong>{session.personName}</strong>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span>Ideas</span>
          <strong>{visibleIdeas.length}</strong>
          <p>{ideaCounts.ACCEPTED ?? 0} accepted</p>
        </div>
        <div className="metric-card">
          <span>Beats</span>
          <strong>{visibleBeats.length}</strong>
          <p>{beatCounts.APPROVED_FOR_SCRIPT_WRITING ?? 0} script-ready</p>
        </div>
        <div className="metric-card">
          <span>Assignments</span>
          <strong>{visibleAssignments.length}</strong>
          <p>{assignmentCounts.COMPLETED_BY_WRITER ?? 0} awaiting review</p>
        </div>
        <div className="metric-card">
          <span>Production Queue</span>
          <strong>{assignmentCounts.READY_FOR_PRODUCTION ?? 0}</strong>
          <p>ready for downstream handoff</p>
        </div>
      </div>

      <div className="split-grid">
        <Panel title="Idea Health" description="Current review state across submitted ideas.">
          <div className="mini-list">
            {ideaStatuses.map((status) => (
              <div className="mini-row" key={status.value}>
                <Badge tone={toneForIdeaStatus(status.value)}>{status.label}</Badge>
                <strong>{ideaCounts[status.value] ?? 0}</strong>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Beat Flow" description="How far beat writing has moved through review.">
          <div className="mini-list">
            {beatStatuses.map((status) => (
              <div className="mini-row" key={status.value}>
                <Badge tone={toneForBeatStatus(status.value)}>{status.label}</Badge>
                <strong>{beatCounts[status.value] ?? 0}</strong>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Script Flow" description="Top-line assignment status across the writing workflow.">
          <div className="mini-list">
            {assignmentStatuses.map((status) => (
              <div className="mini-row" key={status.value}>
                <Badge tone={toneForAssignmentStatus(status.value)}>{status.label}</Badge>
                <strong>{assignmentCounts[status.value] ?? 0}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="split-grid">
        <Panel title="Pending Beat Reviews" description="Submitted beats still waiting on a POD lead or business review.">
          {pendingBeatReviews.length === 0 ? (
            <EmptyState title="No pending beat reviews" description="All submitted beats have been processed." />
          ) : (
            <div className="stack-list">
              {pendingBeatReviews.map((beat) => (
                <article className="list-card" key={beat.id}>
                  <div className="list-card-header">
                    <div>
                      <strong>{beat.code}</strong>
                      <p>{beat.title}</p>
                    </div>
                    <Badge tone={toneForBeatStatus(beat.status)}>{beatStatusLabels[beat.status] ?? beat.status}</Badge>
                  </div>
                  <p className="meta-line">
                    {beat.ideaCode} · {beat.assignedToName} · Due {formatDate(beat.expectedCompleteDate)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Pending Script Reviews"
          description="Assignments that writers have completed but leadership still needs to grade."
        >
          {pendingScriptReviews.length === 0 ? (
            <EmptyState title="No pending script reviews" description="The review queue is currently clear." />
          ) : (
            <div className="stack-list">
              {pendingScriptReviews.map((assignment) => (
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
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="split-grid">
        <Panel title="Upcoming Deadlines" description="Assignments still in-flight, sorted by due date.">
          {upcomingAssignments.length === 0 ? (
            <EmptyState title="No active deadlines" description="There are no open assignments right now." />
          ) : (
            <div className="stack-list">
              {upcomingAssignments.map((assignment) => (
                <article className="list-card" key={assignment.id}>
                  <div className="list-card-header">
                    <div>
                      <strong>{assignment.code}</strong>
                      <p>{assignment.angle}</p>
                    </div>
                    <Badge tone={isPastDate(assignment.dateDue) ? "danger" : "warning"}>
                      {formatDate(assignment.dateDue)}
                    </Badge>
                  </div>
                  <p className="meta-line">
                    {assignment.writerName} · {assignment.podLeadName}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Latest Production-Ready Scripts" description="Recently approved outputs ready for the next stage.">
          {readyForProduction.length === 0 ? (
            <EmptyState title="Nothing ready for production" description="Mark strong submissions ready after review." />
          ) : (
            <div className="stack-list">
              {readyForProduction.map((assignment) => (
                <article className="list-card" key={assignment.id}>
                  <div className="list-card-header">
                    <div>
                      <strong>{assignment.code}</strong>
                      <p>{assignment.angle}</p>
                    </div>
                    <Badge tone="success">{getSchemaVariableLabel(snapshot, "PRODUCTION_TYPE", assignment.prodSuffix)}</Badge>
                  </div>
                  <p className="meta-line">Ready {formatDateTime(assignment.productionReadyAt)}</p>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
