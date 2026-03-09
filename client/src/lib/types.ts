export type PersonRole = "WRITER" | "POD_LEAD" | "BUSINESS";
export type IdeaStatus = "NOT_REVIEWED" | "ACCEPTED" | "REJECTED";
export type IdeaRank = "UNRANKED" | "HIGH_CONVICTION" | "BET" | "REJECT";
export type BeatAssigneeRole = "WRITER" | "POD_LEAD";
export type BeatStatus = "ASSIGNED" | "SUBMITTED" | "APPROVED_FOR_SCRIPT_WRITING" | "TO_BE_REDONE";
export type AssignmentType = "NEW" | "IMPROVEMENT";
export type AssignmentStatus =
  | "ASSIGNED_TO_WRITER"
  | "COMPLETED_BY_WRITER"
  | "READY_FOR_PRODUCTION"
  | "REWRITE_REQUIRED";
export type AssignmentGrade = "STRONG_OUTPUT" | "MINOR_FLAWS" | "MAJOR_FLAWS" | "REDO";
export type ProductionType = "GA" | "GU";

export interface Person {
  id: string;
  name: string;
  role: PersonRole;
}

export interface Show {
  id: string;
  name: string;
}

export interface Idea {
  id: string;
  code: string;
  show: string;
  angle: string;
  submittedById: string;
  submittedByName: string;
  submittedOn: string | null;
  status: IdeaStatus;
  rank: IdeaRank;
  setting: string;
  opening: string;
  tickingClock: string;
  stakes: string;
  goal: string;
  cliffhanger: string;
  note: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Beat {
  id: string;
  code: string;
  ideaId: string;
  ideaCode: string;
  ideaShow: string;
  ideaAngle: string;
  title: string;
  setting: string;
  opening: string;
  tickingClock: string;
  stakes: string;
  goal: string;
  cliffhanger: string;
  note: string;
  docLink: string | null;
  assignedToId: string;
  assignedToName: string;
  assignedRole: BeatAssigneeRole;
  requestRaisedOn: string | null;
  expectedStartDate: string | null;
  expectedCompleteDate: string | null;
  status: BeatStatus;
  submittedOn: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedOn: string | null;
  reviewNotes: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Assignment {
  id: string;
  code: string;
  assignmentType: AssignmentType;
  beatId: string | null;
  beatCode: string | null;
  show: string;
  angle: string;
  writerId: string;
  writerName: string;
  podLeadId: string;
  podLeadName: string;
  dateAssigned: string | null;
  dateDue: string | null;
  notes: string;
  status: AssignmentStatus;
  submission: string;
  grade: AssignmentGrade | null;
  feedback: string;
  finalOutput: string;
  prodSuffix: ProductionType | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  productionReadyAt: string | null;
  parentAssignmentId: string | null;
  parentCode: string | null;
  editCode: string;
  codeToRework: string;
  updatedBeats: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WorkflowSnapshot {
  shows: Show[];
  people: Person[];
  ideas: Idea[];
  beats: Beat[];
  assignments: Assignment[];
}

export interface SessionState {
  role: PersonRole;
  personId: string;
  personName: string;
}

export interface CreateIdeaInput {
  show: string;
  angle: string;
  submittedById: string;
  submittedOn: string;
  setting: string;
  opening: string;
  tickingClock: string;
  stakes: string;
  goal: string;
  cliffhanger: string;
  note: string;
}

export interface ReviewIdeaInput {
  status: IdeaStatus;
  rank: IdeaRank;
}

export interface CreateBeatInput {
  ideaId: string;
  title: string;
  setting: string;
  opening: string;
  tickingClock: string;
  stakes: string;
  goal: string;
  cliffhanger: string;
  note: string;
  docLink?: string;
  assignedToId: string;
  assignedRole: BeatAssigneeRole;
  requestRaisedOn: string;
  expectedStartDate: string;
  expectedCompleteDate: string;
}

export interface SubmitBeatInput {
  docLink: string;
}

export interface ReviewBeatInput {
  decision: Extract<BeatStatus, "APPROVED_FOR_SCRIPT_WRITING" | "TO_BE_REDONE">;
  reviewedById: string;
  notes?: string;
}

export interface CreateBeatAssignmentInput {
  beatId: string;
  writerId: string;
  podLeadId: string;
  dateAssigned: string;
  dateDue: string;
  notes?: string;
  editCode: string;
}

export interface CreateImprovementAssignmentInput {
  assignmentType?: "IMPROVEMENT";
  show: string;
  angle: string;
  writerId: string;
  podLeadId: string;
  dateAssigned: string;
  dateDue: string;
  notes?: string;
  editCode: string;
  codeToRework?: string;
  updatedBeats?: string;
}

export interface SubmitAssignmentInput {
  submission: string;
}

export interface ReviewAssignmentInput {
  grade: AssignmentGrade;
  feedback?: string;
  finalOutput: string;
}

export interface ProductionInput {
  prodSuffix: ProductionType;
}

export interface CreatePersonInput {
  name: string;
  role: PersonRole;
}

export interface CreateShowInput {
  name: string;
}

export interface ReviewAssignmentResult {
  createdRedoCode: string | null;
}

export interface WorkflowActions {
  refresh(): Promise<void>;
  validateAdminPassword(password: string): Promise<void>;
  createIdea(input: CreateIdeaInput): Promise<void>;
  reviewIdea(id: string, input: ReviewIdeaInput): Promise<void>;
  createBeat(input: CreateBeatInput): Promise<void>;
  submitBeat(id: string, input: SubmitBeatInput): Promise<void>;
  reviewBeat(id: string, input: ReviewBeatInput): Promise<void>;
  createAssignmentFromBeat(input: CreateBeatAssignmentInput): Promise<void>;
  createImprovementAssignment(input: CreateImprovementAssignmentInput): Promise<void>;
  submitAssignment(id: string, input: SubmitAssignmentInput): Promise<void>;
  reviewAssignment(id: string, input: ReviewAssignmentInput): Promise<ReviewAssignmentResult>;
  markAssignmentReady(id: string, input: ProductionInput): Promise<void>;
  createPerson(input: CreatePersonInput): Promise<void>;
  removePerson(id: string): Promise<void>;
  createShow(input: CreateShowInput): Promise<void>;
  removeShow(id: string): Promise<void>;
}
