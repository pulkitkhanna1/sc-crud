import type { Prisma } from "@prisma/client";
import {
  AssignmentGrade,
  AssignmentStatus,
  AssignmentType,
  BeatAssigneeRole,
  BeatStatus,
  IdeaRank,
  IdeaStatus,
  PersonRole,
  ProductionType,
} from "@prisma/client";

import { prisma } from "./db";
import { AppError, optionalString, parseDateInput, parseEnumValue, requireString } from "./validation";

const PERSON_ROLE_VALUES = Object.values(PersonRole);
const IDEA_STATUS_VALUES = Object.values(IdeaStatus);
const IDEA_RANK_VALUES = Object.values(IdeaRank);
const BEAT_ASSIGNEE_ROLE_VALUES = Object.values(BeatAssigneeRole);
const BEAT_STATUS_VALUES = Object.values(BeatStatus);
const ASSIGNMENT_TYPE_VALUES = Object.values(AssignmentType);
const ASSIGNMENT_GRADE_VALUES = Object.values(AssignmentGrade);
const PRODUCTION_TYPE_VALUES = Object.values(ProductionType);

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

function formatDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function formatDateTime(date: Date | null) {
  return date ? date.toISOString() : null;
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
  role: PersonRole;
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
  const [people, ideas, beats, assignments] = await prisma.$transaction([
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
  ]);

  return {
    people: people.map(serializePerson),
    ideas: ideas.map(serializeIdea),
    beats: beats.map(serializeBeat),
    assignments: assignments.map(serializeAssignment),
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
        status: IdeaStatus.NOT_REVIEWED,
        rank: IdeaRank.UNRANKED,
      },
    });

    return code;
  });
}

export async function reviewIdea(id: string, payload: Record<string, unknown>) {
  const status = parseEnumValue(payload.status, IDEA_STATUS_VALUES, "Status");
  const rank = parseEnumValue(payload.rank, IDEA_RANK_VALUES, "Rank");

  await prisma.idea.update({
    where: { id },
    data: {
      status,
      rank,
    },
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
    assignedRole: parseEnumValue(payload.assignedRole, BEAT_ASSIGNEE_ROLE_VALUES, "Assigned role"),
    requestRaisedOn: parseDateInput(payload.requestRaisedOn, "Request raised on"),
    expectedStartDate: parseDateInput(payload.expectedStartDate, "Expected start date"),
    expectedCompleteDate: parseDateInput(payload.expectedCompleteDate, "Expected complete date"),
  };

  return prisma.$transaction(async (tx) => {
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
        status: BeatStatus.ASSIGNED,
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
      status: BeatStatus.SUBMITTED,
      submittedOn: new Date(),
    },
  });
}

export async function reviewBeat(id: string, payload: Record<string, unknown>) {
  const decision = parseEnumValue(
    payload.decision,
    [BeatStatus.APPROVED_FOR_SCRIPT_WRITING, BeatStatus.TO_BE_REDONE] as const,
    "Decision",
  );

  const reviewedById = requireString(payload.reviewedById, "Reviewed by");
  const notes = optionalString(payload.notes);

  await prisma.beat.update({
    where: { id },
    data: {
      status: decision,
      reviewedById,
      reviewedOn: new Date(),
      reviewNotes: notes,
    },
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

    if (beat.status !== BeatStatus.APPROVED_FOR_SCRIPT_WRITING) {
      throw new AppError("Only approved beats can become writing assignments.");
    }

    const code = await nextCode(tx, "ASSIGNMENT", "", 5);

    await tx.assignment.create({
      data: {
        code,
        assignmentType: AssignmentType.NEW,
        beatId: beat.id,
        show: beat.idea.show,
        angle: beat.title,
        writerId: data.writerId,
        podLeadId: data.podLeadId,
        dateAssigned: data.dateAssigned,
        dateDue: data.dateDue,
        notes: data.notes,
        status: AssignmentStatus.ASSIGNED_TO_WRITER,
        editCode: data.editCode,
      },
    });

    return code;
  });
}

export async function createImprovementAssignment(payload: Record<string, unknown>) {
  const assignmentType = parseEnumValue(payload.assignmentType ?? AssignmentType.IMPROVEMENT, ASSIGNMENT_TYPE_VALUES, "Assignment type");

  if (assignmentType !== AssignmentType.IMPROVEMENT) {
    throw new AppError("Improvement assignments must use the IMPROVEMENT type.");
  }

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
    const code = await nextCode(tx, "ASSIGNMENT", "", 5);

    await tx.assignment.create({
      data: {
        code,
        assignmentType: AssignmentType.IMPROVEMENT,
        show: data.show,
        angle: data.angle,
        writerId: data.writerId,
        podLeadId: data.podLeadId,
        dateAssigned: data.dateAssigned,
        dateDue: data.dateDue,
        notes: data.notes,
        status: AssignmentStatus.ASSIGNED_TO_WRITER,
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
      status: AssignmentStatus.COMPLETED_BY_WRITER,
      submittedAt: new Date(),
    },
  });
}

export async function reviewAssignment(id: string, payload: Record<string, unknown>) {
  const grade = parseEnumValue(payload.grade, ASSIGNMENT_GRADE_VALUES, "Grade");
  const feedback = optionalString(payload.feedback);
  const finalOutput = requireString(payload.finalOutput, "Final output");

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new AppError("Assignment was not found.", 404);
    }

    if (grade === AssignmentGrade.STRONG_OUTPUT) {
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

    if (grade === AssignmentGrade.REDO) {
      const redoCode = await nextCode(tx, "ASSIGNMENT", "", 5);

      await tx.assignment.update({
        where: { id },
        data: {
          status: AssignmentStatus.REWRITE_REQUIRED,
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
          status: AssignmentStatus.ASSIGNED_TO_WRITER,
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
        status: AssignmentStatus.REWRITE_REQUIRED,
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
  const prodSuffix = parseEnumValue(payload.prodSuffix, PRODUCTION_TYPE_VALUES, "Production type");

  await prisma.$transaction(async (tx) => {
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
        status: AssignmentStatus.READY_FOR_PRODUCTION,
        productionReadyAt: new Date(),
      },
    });
  });
}

export async function createPerson(payload: Record<string, unknown>) {
  const name = requireString(payload.name, "Name");
  const role = parseEnumValue(payload.role, PERSON_ROLE_VALUES, "Role");

  return prisma.person.create({
    data: {
      name,
      role,
    },
  });
}

export async function removePerson(id: string) {
  const [submittedIdeas, assignedBeats, reviewedBeats, writingAssignments, podAssignments] = await Promise.all([
    prisma.idea.count({ where: { submittedById: id } }),
    prisma.beat.count({ where: { assignedToId: id } }),
    prisma.beat.count({ where: { reviewedById: id } }),
    prisma.assignment.count({ where: { writerId: id } }),
    prisma.assignment.count({ where: { podLeadId: id } }),
  ]);

  if (submittedIdeas + assignedBeats + reviewedBeats + writingAssignments + podAssignments > 0) {
    throw new AppError("This person is already referenced in workflow data and cannot be deleted.", 409);
  }

  await prisma.person.delete({
    where: { id },
  });
}
