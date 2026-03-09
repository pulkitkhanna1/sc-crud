export const PERSON_ROLE_LABELS: Record<string, string> = {
  WRITER: "Writer",
  POD_LEAD: "POD Lead",
  BUSINESS: "Business",
};

export const IDEA_STATUS_LABELS: Record<string, string> = {
  NOT_REVIEWED: "Not Reviewed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export const IDEA_RANK_LABELS: Record<string, string> = {
  UNRANKED: "Unranked",
  HIGH_CONVICTION: "High Conviction",
  BET: "Bet",
  REJECT: "Reject",
};

export const BEAT_STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Assigned",
  SUBMITTED: "Submitted",
  APPROVED_FOR_SCRIPT_WRITING: "Approved for Script Writing",
  TO_BE_REDONE: "To Be Redone",
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  ASSIGNED_TO_WRITER: "Assigned to Writer",
  COMPLETED_BY_WRITER: "Completed by Writer",
  READY_FOR_PRODUCTION: "Ready for Production",
  REWRITE_REQUIRED: "Rewrite Required",
};

export const ASSIGNMENT_TYPE_LABELS: Record<string, string> = {
  NEW: "New Beat",
  IMPROVEMENT: "Improvement",
};

export const ASSIGNMENT_GRADE_LABELS: Record<string, string> = {
  STRONG_OUTPUT: "Strong Output",
  MINOR_FLAWS: "Minor Flaws",
  MAJOR_FLAWS: "Major Flaws",
  REDO: "Redo",
};

export const PRODUCTION_TYPE_LABELS: Record<string, string> = {
  GA: "Q1 + TN",
  GU: "Full Gen AI",
};

export const IDEA_STATUS_OPTIONS = Object.keys(IDEA_STATUS_LABELS);
export const IDEA_RANK_OPTIONS = Object.keys(IDEA_RANK_LABELS);
export const BEAT_STATUS_OPTIONS = Object.keys(BEAT_STATUS_LABELS);
export const ASSIGNMENT_STATUS_OPTIONS = Object.keys(ASSIGNMENT_STATUS_LABELS);
export const ASSIGNMENT_GRADE_OPTIONS = Object.keys(ASSIGNMENT_GRADE_LABELS);
export const PRODUCTION_TYPE_OPTIONS = Object.keys(PRODUCTION_TYPE_LABELS);

export function toneForIdeaStatus(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "muted";
  }
}

export function toneForIdeaRank(rank: string) {
  switch (rank) {
    case "HIGH_CONVICTION":
      return "success";
    case "BET":
      return "warning";
    case "REJECT":
      return "danger";
    default:
      return "muted";
  }
}

export function toneForBeatStatus(status: string) {
  switch (status) {
    case "APPROVED_FOR_SCRIPT_WRITING":
      return "success";
    case "TO_BE_REDONE":
      return "danger";
    case "SUBMITTED":
      return "warning";
    default:
      return "info";
  }
}

export function toneForAssignmentStatus(status: string) {
  switch (status) {
    case "READY_FOR_PRODUCTION":
      return "success";
    case "REWRITE_REQUIRED":
      return "danger";
    case "COMPLETED_BY_WRITER":
      return "warning";
    default:
      return "info";
  }
}

export function toneForAssignmentGrade(grade: string) {
  switch (grade) {
    case "STRONG_OUTPUT":
      return "success";
    case "MINOR_FLAWS":
      return "warning";
    case "MAJOR_FLAWS":
      return "danger";
    case "REDO":
      return "danger";
  }
}
