import type { Assignment, Beat, Idea, SessionState, WorkflowSnapshot } from "./types";

export function isBusinessSession(session: SessionState) {
  return session.role === "BUSINESS";
}

export function getVisibleAssignments(snapshot: WorkflowSnapshot, session: SessionState): Assignment[] {
  if (isBusinessSession(session)) {
    return snapshot.assignments;
  }

  if (session.role === "WRITER") {
    return snapshot.assignments.filter((assignment) => assignment.writerId === session.personId);
  }

  return snapshot.assignments.filter((assignment) => assignment.podLeadId === session.personId);
}

export function getVisibleBeats(
  snapshot: WorkflowSnapshot,
  session: SessionState,
  visibleAssignments = getVisibleAssignments(snapshot, session),
): Beat[] {
  if (isBusinessSession(session)) {
    return snapshot.beats;
  }

  if (session.role === "WRITER") {
    return snapshot.beats.filter((beat) => beat.assignedToId === session.personId);
  }

  const assignmentBeatIds = new Set(
    visibleAssignments
      .map((assignment) => assignment.beatId)
      .filter((beatId): beatId is string => Boolean(beatId)),
  );

  return snapshot.beats.filter((beat) => beat.assignedToId === session.personId || assignmentBeatIds.has(beat.id));
}

export function getVisibleIdeas(
  snapshot: WorkflowSnapshot,
  session: SessionState,
  visibleBeats = getVisibleBeats(snapshot, session),
): Idea[] {
  if (isBusinessSession(session)) {
    return snapshot.ideas;
  }

  const visibleIdeaIds = new Set(visibleBeats.map((beat) => beat.ideaId));

  return snapshot.ideas.filter((idea) => idea.submittedById === session.personId || visibleIdeaIds.has(idea.id));
}
