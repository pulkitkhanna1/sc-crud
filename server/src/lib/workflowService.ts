import type { Prisma } from "@prisma/client";

import { prisma } from "./db";
import { AppError, optionalString, parseDateInput, requireString } from "./validation";

const VARIABLE_CATEGORIES = {
  PERSON_ROLE: "PERSON_ROLE",
  IDEA_STATUS: "IDEA_STATUS",
  IDEA_RANK: "IDEA_RANK",
  BEAT_ASSIGNEE_ROLE: "BEAT_ASSIGNEE_ROLE",
  BEAT_STATUS: "BEAT_STATUS",
  ASSIGNMENT_TYPE: "ASSIGNMENT_TYPE",
  ASSIGNMENT_STATUS: "ASSIGNMENT_STATUS",
  ASSIGNMENT_GRADE: "ASSIGNMENT_GRADE",
  PRODUCTION_TYPE: "PRODUCTION_TYPE",
} as const;

const DEFAULT_SCHEMA_VARIABLES = [
  { category: VARIABLE_CATEGORIES.PERSON_ROLE, value: "WRITER", label: "Writer", sortOrder: 10, isCore: true },
  { category: VARIABLE_CATEGORIES.PERSON_ROLE, value: "POD_LEAD", label: "POD Lead", sortOrder: 20, isCore: true },
  { category: VARIABLE_CATEGORIES.PERSON_ROLE, value: "BUSINESS", label: "Business", sortOrder: 30, isCore: true },
  { category: VARIABLE_CATEGORIES.IDEA_STATUS, value: "NOT_REVIEWED", label: "Not Reviewed", sortOrder: 10, isCore: true },
  { category: VARIABLE_CATEGORIES.IDEA_STATUS, value: "ACCEPTED", label: "Accepted", sortOrder: 20, isCore: true },
  { category: VARIABLE_CATEGORIES.IDEA_STATUS, value: "REJECTED", label: "Rejected", sortOrder: 30, isCore: true },
  { category: VARIABLE_CATEGORIES.IDEA_RANK, value: "UNRANKED", label: "Unranked", sortOrder: 10, isCore: true },
  { category: VARIABLE_CATEGORIES.IDEA_RANK, value: "HIGH_CONVICTION", label: "High Conviction", sortOrder: 20, isCore: true },
  { category: VARIABLE_CATEGORIES.IDEA_RANK, value: "BET", label: "Bet", sortOrder: 30, isCore: true },
  { category: VARIABLE_CATEGORIES.IDEA_RANK, value: "REJECT", label: "Reject", sortOrder: 40, isCore: true },
  { category: VARIABLE_CATEGORIES.BEAT_ASSIGNEE_ROLE, value: "WRITER", label: "Writer", sortOrder: 10, isCore: true },
  { category: VARIABLE_CATEGORIES.BEAT_ASSIGNEE_ROLE, value: "POD_LEAD", label: "POD Lead", sortOrder: 20, isCore: true },
  { category: VARIABLE_CATEGORIES.BEAT_STATUS, value: "ASSIGNED", label: "Assigned", sortOrder: 10, isCore: true },
  { category: VARIABLE_CATEGORIES.BEAT_STATUS, value: "SUBMITTED", label: "Submitted", sortOrder: 20, isCore: true },
  {
    category: VARIABLE_CATEGORIES.BEAT_STATUS,
    value: "APPROVED_FOR_SCRIPT_WRITING",
    label: "Approved for Script Writing",
    sortOrder: 30,
    isCore: true,
  },
  { category: VARIABLE_CATEGORIES.BEAT_STATUS, value: "TO_BE_REDONE", label: "To Be Redone", sortOrder: 40, isCore: true },
  { category: VARIABLE_CATEGORIES.ASSIGNMENT_TYPE, value: "NEW", label: "New Beat", sortOrder: 10, isCore: true },
  { category: VARIABLE_CATEGORIES.ASSIGNMENT_TYPE, value: "IMPROVEMENT", label: "Improvement", sortOrder: 20, isCore: true },
  {
    category: VARIABLE_CATEGORIES.ASSIGNMENT_STATUS,
    value: "ASSIGNED_TO_WRITER",
    label: "Assigned to Writer",
    sortOrder: 10,
    isCore: true,
  },
  {
    category: VARIABLE_CATEGORIES.ASSIGNMENT_STATUS,
    value: "COMPLETED_BY_WRITER",
    label: "Completed by Writer",
    sortOrder: 20,
    isCore: true,
  },
  {
    category: VARIABLE_CATEGORIES.ASSIGNMENT_STATUS,
    value: "READY_FOR_PRODUCTION",
    label: "Ready for Production",
    sortOrder: 30,
    isCore: true,
  },
  {
    category: VARIABLE_CATEGORIES.ASSIGNMENT_STATUS,
    value: "REWRITE_REQUIRED",
    label: "Rewrite Required",
    sortOrder: 40,
    isCore: true,
  },
  {
    category: VARIABLE_CATEGORIES.ASSIGNMENT_GRADE,
    value: "STRONG_OUTPUT",
    label: "Strong Output",
    sortOrder: 10,
    isCore: true,
  },
  {
    category: VARIABLE_CATEGORIES.ASSIGNMENT_GRADE,
    value: "MINOR_FLAWS",
    label: "Minor Flaws",
    sortOrder: 20,
    isCore: true,
  },
  {
    category: VARIABLE_CATEGORIES.ASSIGNMENT_GRADE,
    value: "MAJOR_FLAWS",
    label: "Major Flaws",
    sortOrder: 30,
    isCore: true,
  },
  { category: VARIABLE_CATEGORIES.ASSIGNMENT_GRADE, value: "REDO", label: "Redo", sortOrder: 40, isCore: true },
  { category: VARIABLE_CATEGORIES.PRODUCTION_TYPE, value: "GA", label: "Q1 + TN", sortOrder: 10, isCore: true },
  { category: VARIABLE_CATEGORIES.PRODUCTION_TYPE, value: "GU", label: "Full Gen AI", sortOrder: 20, isCore: true },
] as const;
const VARIABLE_CATEGORY_VALUES = Object.values(VARIABLE_CATEGORIES);

const DEFAULT_SHOWS = ["MVS", "FLBM", "WBT"] as const;
const DEFAULT_SHOW_SET = new Set<string>(DEFAULT_SHOWS);

const ideaInclude = {
  submittedBy: true,
} satisfies Prisma.IdeaInclude;

const beatInclude = {
  idea: true,
  assignedTo: true,
  reviewedBy: true,
} satisfies Prisma.BeatInclude;

const assignmentInclude = {
  beat: true,
  writer: true,
  podLead: true,
  parentAssignment: true,
} satisfies Prisma.AssignmentInclude;

function serializeShow(show: {
  id: string;
  name: string;
}) {
  return {
    id: show.id,
    name: show.name,
  };
}

function serializeSchemaVariable(variable: {
  id: string;
  category: string;
  value: string;
  label: string;
  sortOrder: number;
  isCore: boolean;
}) {
  return {
    id: variable.id,
    category: variable.category,
    value: variable.value,
    label: variable.label,
    sortOrder: variable.sortOrder,
    isCore: variable.isCore,
  };
}

function serializeAdminLog(log: {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetLabel: string;
  payload: Prisma.JsonValue;
  createdAt: Date;
}) {
  return {
    id: log.id,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    targetLabel: log.targetLabel,
    payload: log.payload,
    createdAt: formatDateTime(log.createdAt),
  };
}

function formatDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function formatDateTime(date: Date | null) {
  return date ? date.toISOString() : null;
}

async function recordAdminLog(
  tx: Prisma.TransactionClient,
  entry: {
    action: string;
    targetType: string;
    targetId?: string | null;
    targetLabel: string;
    payload: Prisma.InputJsonValue;
  },
) {
  await tx.adminLog.create({
    data: {
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      targetLabel: entry.targetLabel,
      payload: entry.payload,
    },
  });
}

async function requireSchemaVariableValue(
  tx: Prisma.TransactionClient,
  category: string,
  value: unknown,
  fieldName: string,
) {
  const normalizedValue = requireString(value, fieldName);
  const variable = await tx.schemaVariable.findUnique({
    where: {
      category_value: {
        category,
        value: normalizedValue,
      },
    },
  });

  if (!variable) {
    throw new AppError(`${fieldName} is invalid.`);
  }

  return variable.value;
}

async function requireDecisionValue(
  tx: Prisma.TransactionClient,
  category: string,
  value: unknown,
  allowedValues: readonly string[],
  fieldName: string,
) {
  const normalizedValue = await requireSchemaVariableValue(tx, category, value, fieldName);

  if (!allowedValues.includes(normalizedValue)) {
    throw new AppError(`${fieldName} is invalid.`);
  }

  return normalizedValue;
}

async function countVariableReferences(category: string, value: string) {
  switch (category) {
    case VARIABLE_CATEGORIES.PERSON_ROLE:
      return prisma.person.count({ where: { role: value } });
    case VARIABLE_CATEGORIES.IDEA_STATUS:
      return prisma.idea.count({ where: { status: value } });
    case VARIABLE_CATEGORIES.IDEA_RANK:
      return prisma.idea.count({ where: { rank: value } });
    case VARIABLE_CATEGORIES.BEAT_ASSIGNEE_ROLE:
      return prisma.beat.count({ where: { assignedRole: value } });
    case VARIABLE_CATEGORIES.BEAT_STATUS:
      return prisma.beat.count({ where: { status: value } });
    case VARIABLE_CATEGORIES.ASSIGNMENT_TYPE:
      return prisma.assignment.count({ where: { assignmentType: value } });
    case VARIABLE_CATEGORIES.ASSIGNMENT_STATUS:
      return prisma.assignment.count({ where: { status: value } });
    case VARIABLE_CATEGORIES.ASSIGNMENT_GRADE:
      return prisma.assignment.count({ where: { grade: value } });
    case VARIABLE_CATEGORIES.PRODUCTION_TYPE:
      return prisma.assignment.count({ where: { prodSuffix: value } });
    default:
      throw new AppError("Schema variable category is invalid.");
  }
}

function requireVariableCategory(value: unknown) {
  const category = requireString(value, "Category");

  if (!VARIABLE_CATEGORY_VALUES.includes(category as (typeof VARIABLE_CATEGORY_VALUES)[number])) {
    throw new AppError("Category is invalid.");
  }

  return category;
}

async function nextCode(
  tx: Prisma.TransactionClient,
  key: "IDEA" | "BEAT" | "ASSIGNMENT",
  prefix: string,
  width: number,
) {
  const counter = await tx.workflowCounter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });

  return `${prefix}${String(counter.value).padStart(width, "0")}`;
}

function assertEditCode(code: string) {
  if (!/^(GA|GU)\d+$/i.test(code)) {
    throw new AppError("Edit code must start with GU or GA followed by digits.");
  }

  return code.toUpperCase();
}

function serializePerson(person: {
  id: string;
  name: string;
  role: string;
}) {
  return {
    id: person.id,
    name: person.name,
    role: person.role,
  };
}

function serializeIdea(
  idea: Prisma.IdeaGetPayload<{
    include: typeof ideaInclude;
  }>,
) {
  return {
    id: idea.id,
    code: idea.code,
    show: idea.show,
    angle: idea.angle,
    submittedById: idea.submittedById,
    submittedByName: idea.submittedBy.name,
    submittedOn: formatDate(idea.submittedOn),
    status: idea.status,
    rank: idea.rank,
    setting: idea.setting,
    opening: idea.opening,
    tickingClock: idea.tickingClock,
    stakes: idea.stakes,
    goal: idea.goal,
    cliffhanger: idea.cliffhanger,
    note: idea.note,
    createdAt: formatDateTime(idea.createdAt),
    updatedAt: formatDateTime(idea.updatedAt),
  };
}

function serializeBeat(
  beat: Prisma.BeatGetPayload<{
    include: typeof beatInclude;
  }>,
) {
  return {
    id: beat.id,
    code: beat.code,
    ideaId: beat.ideaId,
    ideaCode: beat.idea.code,
    ideaShow: beat.idea.show,
    ideaAngle: beat.idea.angle,
    title: beat.title,
    setting: beat.setting,
    opening: beat.opening,
    tickingClock: beat.tickingClock,
    stakes: beat.stakes,
    goal: beat.goal,
    cliffhanger: beat.cliffhanger,
    note: beat.note,
    docLink: beat.docLink,
    assignedToId: beat.assignedToId,
    assignedToName: beat.assignedTo.name,
    assignedRole: beat.assignedRole,
    requestRaisedOn: formatDate(beat.requestRaisedOn),
    expectedStartDate: formatDate(beat.expectedStartDate),
    expectedCompleteDate: formatDate(beat.expectedCompleteDate),
    status: beat.status,
    submittedOn: formatDate(beat.submittedOn),
    reviewedById: beat.reviewedById,
    reviewedByName: beat.reviewedBy?.name ?? null,
    reviewedOn: formatDate(beat.reviewedOn),
    reviewNotes: beat.reviewNotes ?? "",
    createdAt: formatDateTime(beat.createdAt),
    updatedAt: formatDateTime(beat.updatedAt),
  };
}

function serializeAssignment(
  assignment: Prisma.AssignmentGetPayload<{
    include: typeof assignmentInclude;
  }>,
) {
  return {
    id: assignment.id,
    code: assignment.code,
    assignmentType: assignment.assignmentType,
    beatId: assignment.beatId,
    beatCode: assignment.beat?.code ?? null,
    show: assignment.show,
    angle: assignment.angle,
    writerId: assignment.writerId,
    writerName: assignment.writer.name,
    podLeadId: assignment.podLeadId,
    podLeadName: assignment.podLead.name,
    dateAssigned: formatDate(assignment.dateAssigned),
    dateDue: formatDate(assignment.dateDue),
    notes: assignment.notes ?? "",
    status: assignment.status,
    submission: assignment.submission ?? "",
    grade: assignment.grade,
    feedback: assignment.feedback ?? "",
    finalOutput: assignment.finalOutput ?? "",
    prodSuffix: assignment.prodSuffix,
    submittedAt: formatDateTime(assignment.submittedAt),
    reviewedAt: formatDateTime(assignment.reviewedAt),
    productionReadyAt: formatDateTime(assignment.productionReadyAt),
    parentAssignmentId: assignment.parentAssignmentId,
    parentCode: assignment.parentAssignment?.code ?? null,
    editCode: assignment.editCode,
    codeToRework: assignment.codeToRework ?? "",
    updatedBeats: assignment.updatedBeats ?? "",
    createdAt: formatDateTime(assignment.createdAt),
    updatedAt: formatDateTime(assignment.updatedAt),
  };
}

export async function getWorkflowSnapshot() {
  const [shows, schemaVariables, people, ideas, beats, assignments, adminLogs] = await Promise.all([
    prisma.show.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.schemaVariable.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    }),
    prisma.person.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.idea.findMany({
      include: ideaInclude,
      orderBy: { submittedOn: "desc" },
    }),
    prisma.beat.findMany({
      include: beatInclude,
      orderBy: { requestRaisedOn: "desc" },
    }),
    prisma.assignment.findMany({
      include: assignmentInclude,
      orderBy: { dateAssigned: "desc" },
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    shows: shows.map(serializeShow),
    schemaVariables: schemaVariables.map(serializeSchemaVariable),
    people: people.map(serializePerson),
    ideas: ideas.map(serializeIdea),
    beats: beats.map(serializeBeat),
    assignments: assignments.map(serializeAssignment),
    adminLogs: adminLogs.map(serializeAdminLog),
  };
}

export async function createIdea(payload: Record<string, unknown>) {
  const data = {
    show: requireString(payload.show, "Show"),
    angle: requireString(payload.angle, "Angle"),
    submittedById: requireString(payload.submittedById, "Submitted by"),
    submittedOn: parseDateInput(payload.submittedOn, "Submitted on"),
    setting: requireString(payload.setting, "Setting"),
    opening: requireString(payload.opening, "Opening"),
    tickingClock: requireString(payload.tickingClock, "Ticking clock"),
    stakes: requireString(payload.stakes, "Stakes"),
    goal: requireString(payload.goal, "Goal"),
    cliffhanger: requireString(payload.cliffhanger, "Cliffhanger"),
    note: requireString(payload.note, "Note"),
  };

  return prisma.$transaction(async (tx) => {
    const person = await tx.person.findUnique({
      where: { id: data.submittedById },
    });

    if (!person) {
      throw new AppError("Submitter was not found.", 404);
    }

    const code = await nextCode(tx, "IDEA", "I", 4);

    await tx.idea.create({
      data: {
        code,
        ...data,
        status: "NOT_REVIEWED",
        rank: "UNRANKED",
      },
    });

    return code;
  });
}

export async function reviewIdea(id: string, payload: Record<string, unknown>) {
  await prisma.$transaction(async (tx) => {
    const [status, rank] = await Promise.all([
      requireSchemaVariableValue(tx, VARIABLE_CATEGORIES.IDEA_STATUS, payload.status, "Status"),
      requireSchemaVariableValue(tx, VARIABLE_CATEGORIES.IDEA_RANK, payload.rank, "Rank"),
    ]);

    await tx.idea.update({
      where: { id },
      data: {
        status,
        rank,
      },
    });
  });
}

export async function createBeat(payload: Record<string, unknown>) {
  const data = {
    ideaId: requireString(payload.ideaId, "Idea"),
    title: requireString(payload.title, "Beat title"),
    setting: requireString(payload.setting, "Setting"),
    opening: requireString(payload.opening, "Opening"),
    tickingClock: requireString(payload.tickingClock, "Ticking clock"),
    stakes: requireString(payload.stakes, "Stakes"),
    goal: requireString(payload.goal, "Goal"),
    cliffhanger: requireString(payload.cliffhanger, "Cliffhanger"),
    note: requireString(payload.note, "Note"),
    docLink: optionalString(payload.docLink),
    assignedToId: requireString(payload.assignedToId, "Assigned to"),
    requestRaisedOn: parseDateInput(payload.requestRaisedOn, "Request raised on"),
    expectedStartDate: parseDateInput(payload.expectedStartDate, "Expected start date"),
    expectedCompleteDate: parseDateInput(payload.expectedCompleteDate, "Expected complete date"),
  };

  return prisma.$transaction(async (tx) => {
    const assignedRole = await requireSchemaVariableValue(
      tx,
      VARIABLE_CATEGORIES.BEAT_ASSIGNEE_ROLE,
      payload.assignedRole,
      "Assigned role",
    );

    const [idea, assignee] = await Promise.all([
      tx.idea.findUnique({ where: { id: data.ideaId } }),
      tx.person.findUnique({ where: { id: data.assignedToId } }),
    ]);

    if (!idea) {
      throw new AppError("Idea was not found.", 404);
    }

    if (!assignee) {
      throw new AppError("Beat assignee was not found.", 404);
    }

    const code = await nextCode(tx, "BEAT", "B", 4);

    await tx.beat.create({
      data: {
        code,
        ...data,
        assignedRole,
        status: "ASSIGNED",
      },
    });

    return code;
  });
}

export async function submitBeat(id: string, payload: Record<string, unknown>) {
  const docLink = requireString(payload.docLink, "Beat doc link");

  await prisma.beat.update({
    where: { id },
    data: {
      docLink,
      status: "SUBMITTED",
      submittedOn: new Date(),
    },
  });
}

export async function reviewBeat(id: string, payload: Record<string, unknown>) {
  const reviewedById = requireString(payload.reviewedById, "Reviewed by");
  const notes = optionalString(payload.notes);

  await prisma.$transaction(async (tx) => {
    const decision = await requireDecisionValue(
      tx,
      VARIABLE_CATEGORIES.BEAT_STATUS,
      payload.decision,
      ["APPROVED_FOR_SCRIPT_WRITING", "TO_BE_REDONE"],
      "Decision",
    );

    await tx.beat.update({
      where: { id },
      data: {
        status: decision,
        reviewedById,
        reviewedOn: new Date(),
        reviewNotes: notes,
      },
    });
  });
}

export async function createAssignmentFromBeat(payload: Record<string, unknown>) {
  const data = {
    beatId: requireString(payload.beatId, "Beat"),
    writerId: requireString(payload.writerId, "Writer"),
    podLeadId: requireString(payload.podLeadId, "POD lead"),
    dateAssigned: parseDateInput(payload.dateAssigned, "Date assigned"),
    dateDue: parseDateInput(payload.dateDue, "Date due"),
    notes: optionalString(payload.notes),
    editCode: assertEditCode(requireString(payload.editCode, "Edit code")),
  };

  return prisma.$transaction(async (tx) => {
    const beat = await tx.beat.findUnique({
      where: { id: data.beatId },
      include: { idea: true },
    });

    if (!beat) {
      throw new AppError("Beat was not found.", 404);
    }

    if (beat.status !== "APPROVED_FOR_SCRIPT_WRITING") {
      throw new AppError("Only approved beats can become writing assignments.");
    }

    const code = await nextCode(tx, "ASSIGNMENT", "", 5);

    await tx.assignment.create({
      data: {
        code,
        assignmentType: "NEW",
        beatId: beat.id,
        show: beat.idea.show,
        angle: beat.title,
        writerId: data.writerId,
        podLeadId: data.podLeadId,
        dateAssigned: data.dateAssigned,
        dateDue: data.dateDue,
        notes: data.notes,
        status: "ASSIGNED_TO_WRITER",
        editCode: data.editCode,
      },
    });

    return code;
  });
}

export async function createImprovementAssignment(payload: Record<string, unknown>) {
  const data = {
    show: requireString(payload.show, "Show"),
    angle: requireString(payload.angle, "Angle"),
    writerId: requireString(payload.writerId, "Writer"),
    podLeadId: requireString(payload.podLeadId, "POD lead"),
    dateAssigned: parseDateInput(payload.dateAssigned, "Date assigned"),
    dateDue: parseDateInput(payload.dateDue, "Date due"),
    notes: optionalString(payload.notes),
    editCode: assertEditCode(requireString(payload.editCode, "Edit code")),
    codeToRework: optionalString(payload.codeToRework),
    updatedBeats: optionalString(payload.updatedBeats),
  };

  return prisma.$transaction(async (tx) => {
    const assignmentType = await requireSchemaVariableValue(
      tx,
      VARIABLE_CATEGORIES.ASSIGNMENT_TYPE,
      payload.assignmentType ?? "IMPROVEMENT",
      "Assignment type",
    );

    if (assignmentType !== "IMPROVEMENT") {
      throw new AppError("Improvement assignments must use the IMPROVEMENT type.");
    }

    const code = await nextCode(tx, "ASSIGNMENT", "", 5);

    await tx.assignment.create({
      data: {
        code,
        assignmentType: "IMPROVEMENT",
        show: data.show,
        angle: data.angle,
        writerId: data.writerId,
        podLeadId: data.podLeadId,
        dateAssigned: data.dateAssigned,
        dateDue: data.dateDue,
        notes: data.notes,
        status: "ASSIGNED_TO_WRITER",
        editCode: data.editCode,
        codeToRework: data.codeToRework,
        updatedBeats: data.updatedBeats,
      },
    });

    return code;
  });
}

export async function submitAssignment(id: string, payload: Record<string, unknown>) {
  const submission = requireString(payload.submission, "Submission");

  await prisma.assignment.update({
    where: { id },
    data: {
      submission,
      status: "COMPLETED_BY_WRITER",
      submittedAt: new Date(),
    },
  });
}

export async function reviewAssignment(id: string, payload: Record<string, unknown>) {
  const feedback = optionalString(payload.feedback);
  const finalOutput = requireString(payload.finalOutput, "Final output");

  return prisma.$transaction(async (tx) => {
    const grade = await requireSchemaVariableValue(tx, VARIABLE_CATEGORIES.ASSIGNMENT_GRADE, payload.grade, "Grade");
    const assignment = await tx.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new AppError("Assignment was not found.", 404);
    }

    if (grade === "STRONG_OUTPUT") {
      await tx.assignment.update({
        where: { id },
        data: {
          grade,
          feedback,
          finalOutput,
          reviewedAt: new Date(),
        },
      });

      return { createdRedoCode: null };
    }

    if (grade === "REDO") {
      const redoCode = await nextCode(tx, "ASSIGNMENT", "", 5);

      await tx.assignment.update({
        where: { id },
        data: {
          status: "REWRITE_REQUIRED",
          grade,
          feedback,
          finalOutput,
          reviewedAt: new Date(),
        },
      });

      await tx.assignment.create({
        data: {
          code: redoCode,
          assignmentType: assignment.assignmentType,
          beatId: assignment.beatId,
          show: assignment.show,
          angle: assignment.angle,
          writerId: assignment.writerId,
          podLeadId: assignment.podLeadId,
          dateAssigned: new Date(),
          dateDue: assignment.dateDue,
          notes: assignment.notes,
          status: "ASSIGNED_TO_WRITER",
          parentAssignmentId: assignment.id,
          editCode: assignment.editCode,
          codeToRework: assignment.code,
          updatedBeats: assignment.updatedBeats,
        },
      });

      return { createdRedoCode: redoCode };
    }

    await tx.assignment.update({
      where: { id },
      data: {
        status: "REWRITE_REQUIRED",
        grade,
        feedback,
        finalOutput,
        reviewedAt: new Date(),
      },
    });

    return { createdRedoCode: null };
  });
}

export async function markAssignmentReady(id: string, payload: Record<string, unknown>) {
  await prisma.$transaction(async (tx) => {
    const prodSuffix = await requireSchemaVariableValue(
      tx,
      VARIABLE_CATEGORIES.PRODUCTION_TYPE,
      payload.prodSuffix,
      "Production type",
    );

    const assignment = await tx.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new AppError("Assignment was not found.", 404);
    }

    if (assignment.prodSuffix) {
      throw new AppError("Assignment is already marked ready for production.");
    }

    const nextCodeValue = assignment.code.startsWith(prodSuffix)
      ? assignment.code
      : `${prodSuffix}${assignment.code}`;

    await tx.assignment.update({
      where: { id },
      data: {
        code: nextCodeValue,
        prodSuffix,
        status: "READY_FOR_PRODUCTION",
        productionReadyAt: new Date(),
      },
    });
  });
}

export async function createSchemaVariable(payload: Record<string, unknown>) {
  const category = requireVariableCategory(payload.category);
  const value = requireString(payload.value, "Value").toUpperCase().replaceAll(" ", "_");
  const label = requireString(payload.label, "Label");

  return prisma.$transaction(async (tx) => {
    const existingVariable = await tx.schemaVariable.findUnique({
      where: {
        category_value: {
          category,
          value,
        },
      },
    });

    if (existingVariable) {
      throw new AppError("This schema variable already exists.", 409);
    }

    const categoryValues = await tx.schemaVariable.findMany({
      where: { category },
      orderBy: { sortOrder: "desc" },
      take: 1,
      select: { sortOrder: true },
    });

    const variable = await tx.schemaVariable.create({
      data: {
        category,
        value,
        label,
        sortOrder: (categoryValues[0]?.sortOrder ?? 0) + 10,
        isCore: false,
      },
    });

    await recordAdminLog(tx, {
      action: "CREATE_SCHEMA_VARIABLE",
      targetType: "SCHEMA_VARIABLE",
      targetId: variable.id,
      targetLabel: `${variable.category}:${variable.value}`,
      payload: {
        category: variable.category,
        value: variable.value,
        label: variable.label,
      },
    });

    return variable;
  });
}

export async function removeSchemaVariable(id: string) {
  await prisma.$transaction(async (tx) => {
    const variable = await tx.schemaVariable.findUnique({
      where: { id },
    });

    if (!variable) {
      throw new AppError("Schema variable was not found.", 404);
    }

    if (variable.isCore) {
      throw new AppError("Core schema variables cannot be removed.", 409);
    }

    const referenceCount = await countVariableReferences(variable.category, variable.value);
    if (referenceCount > 0) {
      throw new AppError("This schema variable is already used in workflow data and cannot be deleted.", 409);
    }

    await tx.schemaVariable.delete({
      where: { id },
    });

    await recordAdminLog(tx, {
      action: "REMOVE_SCHEMA_VARIABLE",
      targetType: "SCHEMA_VARIABLE",
      targetId: variable.id,
      targetLabel: `${variable.category}:${variable.value}`,
      payload: {
        category: variable.category,
        value: variable.value,
        label: variable.label,
      },
    });
  });
}

export async function createPerson(payload: Record<string, unknown>) {
  const name = requireString(payload.name, "Name");

  return prisma.$transaction(async (tx) => {
    const role = await requireSchemaVariableValue(tx, VARIABLE_CATEGORIES.PERSON_ROLE, payload.role, "Role");
    const existingPerson = await tx.person.findUnique({
      where: { name },
    });

    if (existingPerson) {
      throw new AppError("A team member with this name already exists.", 409);
    }

    const person = await tx.person.create({
      data: {
        name,
        role,
      },
    });

    await recordAdminLog(tx, {
      action: "CREATE_PERSON",
      targetType: "PERSON",
      targetId: person.id,
      targetLabel: person.name,
      payload: {
        name: person.name,
        role: person.role,
      },
    });

    return person;
  });
}

export async function createShow(payload: Record<string, unknown>) {
  const name = requireString(payload.name, "Show name");

  return prisma.$transaction(async (tx) => {
    const existingShow = await tx.show.findUnique({
      where: { name },
    });

    if (existingShow) {
      await recordAdminLog(tx, {
        action: "CREATE_SHOW_SKIPPED",
        targetType: "SHOW",
        targetId: existingShow.id,
        targetLabel: existingShow.name,
        payload: {
          name,
          reason: "Show already exists",
        },
      });

      return existingShow;
    }

    const show = await tx.show.create({
      data: {
        name,
      },
    });

    await recordAdminLog(tx, {
      action: "CREATE_SHOW",
      targetType: "SHOW",
      targetId: show.id,
      targetLabel: show.name,
      payload: {
        name: show.name,
      },
    });

    return show;
  });
}

export async function removePerson(id: string) {
  await prisma.$transaction(async (tx) => {
    const person = await tx.person.findUnique({
      where: { id },
    });

    if (!person) {
      throw new AppError("Person was not found.", 404);
    }

    const [submittedIdeas, assignedBeats, reviewedBeats, writingAssignments, podAssignments] = await Promise.all([
      tx.idea.count({ where: { submittedById: id } }),
      tx.beat.count({ where: { assignedToId: id } }),
      tx.beat.count({ where: { reviewedById: id } }),
      tx.assignment.count({ where: { writerId: id } }),
      tx.assignment.count({ where: { podLeadId: id } }),
    ]);

    if (submittedIdeas + assignedBeats + reviewedBeats + writingAssignments + podAssignments > 0) {
      throw new AppError("This person is already referenced in workflow data and cannot be deleted.", 409);
    }

    await tx.person.delete({
      where: { id },
    });

    await recordAdminLog(tx, {
      action: "REMOVE_PERSON",
      targetType: "PERSON",
      targetId: person.id,
      targetLabel: person.name,
      payload: {
        id: person.id,
        name: person.name,
        role: person.role,
      },
    });
  });
}

export async function removeShow(id: string) {
  await prisma.$transaction(async (tx) => {
    const show = await tx.show.findUnique({
      where: { id },
    });

    if (!show) {
      throw new AppError("Show was not found.", 404);
    }

    if (DEFAULT_SHOW_SET.has(show.name)) {
      throw new AppError("Default shows cannot be removed.", 409);
    }

    const [ideaCount, assignmentCount] = await Promise.all([
      tx.idea.count({ where: { show: show.name } }),
      tx.assignment.count({ where: { show: show.name } }),
    ]);

    if (ideaCount + assignmentCount > 0) {
      throw new AppError("This show is already referenced in workflow data and cannot be deleted.", 409);
    }

    await tx.show.delete({
      where: { id },
    });

    await recordAdminLog(tx, {
      action: "REMOVE_SHOW",
      targetType: "SHOW",
      targetId: show.id,
      targetLabel: show.name,
      payload: {
        id: show.id,
        name: show.name,
      },
    });
  });
}
