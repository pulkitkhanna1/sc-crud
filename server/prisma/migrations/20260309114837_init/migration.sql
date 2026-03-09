-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('WRITER', 'POD_LEAD', 'BUSINESS');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('NOT_REVIEWED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IdeaRank" AS ENUM ('UNRANKED', 'HIGH_CONVICTION', 'BET', 'REJECT');

-- CreateEnum
CREATE TYPE "BeatAssigneeRole" AS ENUM ('WRITER', 'POD_LEAD');

-- CreateEnum
CREATE TYPE "BeatStatus" AS ENUM ('ASSIGNED', 'SUBMITTED', 'APPROVED_FOR_SCRIPT_WRITING', 'TO_BE_REDONE');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('NEW', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED_TO_WRITER', 'COMPLETED_BY_WRITER', 'READY_FOR_PRODUCTION', 'REWRITE_REQUIRED');

-- CreateEnum
CREATE TYPE "AssignmentGrade" AS ENUM ('STRONG_OUTPUT', 'MINOR_FLAWS', 'MAJOR_FLAWS', 'REDO');

-- CreateEnum
CREATE TYPE "ProductionType" AS ENUM ('GA', 'GU');

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PersonRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowCounter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "WorkflowCounter_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "show" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedOn" TIMESTAMP(3) NOT NULL,
    "status" "IdeaStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "rank" "IdeaRank" NOT NULL DEFAULT 'UNRANKED',
    "setting" TEXT NOT NULL,
    "opening" TEXT NOT NULL,
    "tickingClock" TEXT NOT NULL,
    "stakes" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "cliffhanger" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beat" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "opening" TEXT NOT NULL,
    "tickingClock" TEXT NOT NULL,
    "stakes" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "cliffhanger" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "docLink" TEXT,
    "assignedToId" TEXT NOT NULL,
    "assignedRole" "BeatAssigneeRole" NOT NULL,
    "requestRaisedOn" TIMESTAMP(3) NOT NULL,
    "expectedStartDate" TIMESTAMP(3) NOT NULL,
    "expectedCompleteDate" TIMESTAMP(3) NOT NULL,
    "status" "BeatStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submittedOn" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedOn" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL,
    "beatId" TEXT,
    "show" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "podLeadId" TEXT NOT NULL,
    "dateAssigned" TIMESTAMP(3) NOT NULL,
    "dateDue" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED_TO_WRITER',
    "submission" TEXT,
    "grade" "AssignmentGrade",
    "feedback" TEXT,
    "finalOutput" TEXT,
    "prodSuffix" "ProductionType",
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "productionReadyAt" TIMESTAMP(3),
    "parentAssignmentId" TEXT,
    "editCode" TEXT NOT NULL,
    "codeToRework" TEXT,
    "updatedBeats" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Show_name_key" ON "Show"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Idea_code_key" ON "Idea"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Beat_code_key" ON "Beat"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_code_key" ON "Assignment"("code");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beat" ADD CONSTRAINT "Beat_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beat" ADD CONSTRAINT "Beat_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beat" ADD CONSTRAINT "Beat_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_podLeadId_fkey" FOREIGN KEY ("podLeadId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_parentAssignmentId_fkey" FOREIGN KEY ("parentAssignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
