import type { SchemaVariable, SchemaVariableCategory, WorkflowSnapshot } from "./types";

const DEFAULT_SCHEMA_VARIABLES: Array<{
  category: SchemaVariableCategory;
  value: string;
  label: string;
  sortOrder: number;
  isCore: boolean;
}> = [
  { category: "PERSON_ROLE", value: "WRITER", label: "Writer", sortOrder: 10, isCore: true },
  { category: "PERSON_ROLE", value: "POD_LEAD", label: "POD Lead", sortOrder: 20, isCore: true },
  { category: "PERSON_ROLE", value: "BUSINESS", label: "Business", sortOrder: 30, isCore: true },
  { category: "IDEA_STATUS", value: "NOT_REVIEWED", label: "Not Reviewed", sortOrder: 10, isCore: true },
  { category: "IDEA_STATUS", value: "ACCEPTED", label: "Accepted", sortOrder: 20, isCore: true },
  { category: "IDEA_STATUS", value: "REJECTED", label: "Rejected", sortOrder: 30, isCore: true },
  { category: "IDEA_RANK", value: "UNRANKED", label: "Unranked", sortOrder: 10, isCore: true },
  { category: "IDEA_RANK", value: "HIGH_CONVICTION", label: "High Conviction", sortOrder: 20, isCore: true },
  { category: "IDEA_RANK", value: "BET", label: "Bet", sortOrder: 30, isCore: true },
  { category: "IDEA_RANK", value: "REJECT", label: "Reject", sortOrder: 40, isCore: true },
  { category: "BEAT_ASSIGNEE_ROLE", value: "WRITER", label: "Writer", sortOrder: 10, isCore: true },
  { category: "BEAT_ASSIGNEE_ROLE", value: "POD_LEAD", label: "POD Lead", sortOrder: 20, isCore: true },
  { category: "BEAT_STATUS", value: "ASSIGNED", label: "Assigned", sortOrder: 10, isCore: true },
  { category: "BEAT_STATUS", value: "SUBMITTED", label: "Submitted", sortOrder: 20, isCore: true },
  { category: "BEAT_STATUS", value: "APPROVED_FOR_SCRIPT_WRITING", label: "Approved for Script Writing", sortOrder: 30, isCore: true },
  { category: "BEAT_STATUS", value: "TO_BE_REDONE", label: "To Be Redone", sortOrder: 40, isCore: true },
  { category: "ASSIGNMENT_TYPE", value: "NEW", label: "New Beat", sortOrder: 10, isCore: true },
  { category: "ASSIGNMENT_TYPE", value: "IMPROVEMENT", label: "Improvement", sortOrder: 20, isCore: true },
  { category: "ASSIGNMENT_STATUS", value: "ASSIGNED_TO_WRITER", label: "Assigned to Writer", sortOrder: 10, isCore: true },
  { category: "ASSIGNMENT_STATUS", value: "COMPLETED_BY_WRITER", label: "Completed by Writer", sortOrder: 20, isCore: true },
  { category: "ASSIGNMENT_STATUS", value: "READY_FOR_PRODUCTION", label: "Ready for Production", sortOrder: 30, isCore: true },
  { category: "ASSIGNMENT_STATUS", value: "REWRITE_REQUIRED", label: "Rewrite Required", sortOrder: 40, isCore: true },
  { category: "ASSIGNMENT_GRADE", value: "STRONG_OUTPUT", label: "Strong Output", sortOrder: 10, isCore: true },
  { category: "ASSIGNMENT_GRADE", value: "MINOR_FLAWS", label: "Minor Flaws", sortOrder: 20, isCore: true },
  { category: "ASSIGNMENT_GRADE", value: "MAJOR_FLAWS", label: "Major Flaws", sortOrder: 30, isCore: true },
  { category: "ASSIGNMENT_GRADE", value: "REDO", label: "Redo", sortOrder: 40, isCore: true },
  { category: "PRODUCTION_TYPE", value: "GA", label: "Q1 + TN", sortOrder: 10, isCore: true },
  { category: "PRODUCTION_TYPE", value: "GU", label: "Full Gen AI", sortOrder: 20, isCore: true },
];

export const SCHEMA_VARIABLE_CATEGORY_META: Array<{
  category: SchemaVariableCategory;
  title: string;
  description: string;
}> = [
  { category: "PERSON_ROLE", title: "People roles", description: "Roles available for session switching and team setup." },
  { category: "IDEA_STATUS", title: "Idea statuses", description: "Review outcomes stored on ideas." },
  { category: "IDEA_RANK", title: "Idea ranks", description: "Prioritization values used after review." },
  { category: "BEAT_ASSIGNEE_ROLE", title: "Beat assignee roles", description: "Allowed assignee roles during beat creation." },
  { category: "BEAT_STATUS", title: "Beat statuses", description: "Stage progression for beat development." },
  { category: "ASSIGNMENT_TYPE", title: "Assignment types", description: "New work versus improvement requests." },
  { category: "ASSIGNMENT_STATUS", title: "Assignment statuses", description: "Writer and review workflow states." },
  { category: "ASSIGNMENT_GRADE", title: "Assignment grades", description: "Review outcomes after script submission." },
  { category: "PRODUCTION_TYPE", title: "Production types", description: "Downstream production suffixes." },
];

function fallbackVariables(category: SchemaVariableCategory): SchemaVariable[] {
  return DEFAULT_SCHEMA_VARIABLES.filter((variable) => variable.category === category).map((variable) => ({
    id: `${variable.category}:${variable.value}`,
    category: variable.category,
    value: variable.value,
    label: variable.label,
    sortOrder: variable.sortOrder,
    isCore: variable.isCore,
  }));
}

export function getSchemaVariables(snapshot: Pick<WorkflowSnapshot, "schemaVariables">, category: SchemaVariableCategory) {
  const variables = snapshot.schemaVariables.filter((variable) => variable.category === category);

  if (variables.length === 0) {
    return fallbackVariables(category);
  }

  return [...variables].sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
}

export function getSchemaVariableOptions(snapshot: Pick<WorkflowSnapshot, "schemaVariables">, category: SchemaVariableCategory) {
  return getSchemaVariables(snapshot, category).map((variable) => variable.value);
}

export function getSchemaVariableLabelMap(snapshot: Pick<WorkflowSnapshot, "schemaVariables">, category: SchemaVariableCategory) {
  return Object.fromEntries(getSchemaVariables(snapshot, category).map((variable) => [variable.value, variable.label])) as Record<string, string>;
}

export function getSchemaVariableLabel(
  snapshot: Pick<WorkflowSnapshot, "schemaVariables">,
  category: SchemaVariableCategory,
  value: string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  return getSchemaVariableLabelMap(snapshot, category)[value] ?? value;
}
