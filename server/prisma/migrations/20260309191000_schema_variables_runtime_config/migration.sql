-- CreateTable
CREATE TABLE "SchemaVariable" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemaVariable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchemaVariable_category_value_key" ON "SchemaVariable"("category", "value");

-- Convert enum-backed columns to text
ALTER TABLE "Person" ALTER COLUMN "role" TYPE TEXT USING "role"::text;

ALTER TABLE "Idea" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Idea" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'NOT_REVIEWED';
ALTER TABLE "Idea" ALTER COLUMN "rank" DROP DEFAULT;
ALTER TABLE "Idea" ALTER COLUMN "rank" TYPE TEXT USING "rank"::text;
ALTER TABLE "Idea" ALTER COLUMN "rank" SET DEFAULT 'UNRANKED';

ALTER TABLE "Beat" ALTER COLUMN "assignedRole" TYPE TEXT USING "assignedRole"::text;
ALTER TABLE "Beat" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Beat" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
ALTER TABLE "Beat" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED';

ALTER TABLE "Assignment" ALTER COLUMN "assignmentType" TYPE TEXT USING "assignmentType"::text;
ALTER TABLE "Assignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Assignment" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
ALTER TABLE "Assignment" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED_TO_WRITER';
ALTER TABLE "Assignment" ALTER COLUMN "grade" TYPE TEXT USING "grade"::text;
ALTER TABLE "Assignment" ALTER COLUMN "prodSuffix" TYPE TEXT USING "prodSuffix"::text;

-- Remove old enums once no columns depend on them
DROP TYPE "PersonRole";
DROP TYPE "IdeaStatus";
DROP TYPE "IdeaRank";
DROP TYPE "BeatAssigneeRole";
DROP TYPE "BeatStatus";
DROP TYPE "AssignmentType";
DROP TYPE "AssignmentStatus";
DROP TYPE "AssignmentGrade";
DROP TYPE "ProductionType";

-- Seed default workflow variables
INSERT INTO "SchemaVariable" ("id", "category", "value", "label", "sortOrder", "isCore", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'PERSON_ROLE', 'WRITER', 'Writer', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'PERSON_ROLE', 'POD_LEAD', 'POD Lead', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'PERSON_ROLE', 'BUSINESS', 'Business', 30, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'IDEA_STATUS', 'NOT_REVIEWED', 'Not Reviewed', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'IDEA_STATUS', 'ACCEPTED', 'Accepted', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'IDEA_STATUS', 'REJECTED', 'Rejected', 30, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'IDEA_RANK', 'UNRANKED', 'Unranked', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'IDEA_RANK', 'HIGH_CONVICTION', 'High Conviction', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'IDEA_RANK', 'BET', 'Bet', 30, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'IDEA_RANK', 'REJECT', 'Reject', 40, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BEAT_ASSIGNEE_ROLE', 'WRITER', 'Writer', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BEAT_ASSIGNEE_ROLE', 'POD_LEAD', 'POD Lead', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BEAT_STATUS', 'ASSIGNED', 'Assigned', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BEAT_STATUS', 'SUBMITTED', 'Submitted', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BEAT_STATUS', 'APPROVED_FOR_SCRIPT_WRITING', 'Approved For Script Writing', 30, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BEAT_STATUS', 'TO_BE_REDONE', 'To Be Redone', 40, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_TYPE', 'NEW', 'New Beat', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_TYPE', 'IMPROVEMENT', 'Improvement', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_STATUS', 'ASSIGNED_TO_WRITER', 'Assigned To Writer', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_STATUS', 'COMPLETED_BY_WRITER', 'Completed By Writer', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_STATUS', 'READY_FOR_PRODUCTION', 'Ready For Production', 30, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_STATUS', 'REWRITE_REQUIRED', 'Rewrite Required', 40, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_GRADE', 'STRONG_OUTPUT', 'Strong Output', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_GRADE', 'MINOR_FLAWS', 'Minor Flaws', 20, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_GRADE', 'MAJOR_FLAWS', 'Major Flaws', 30, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ASSIGNMENT_GRADE', 'REDO', 'Redo', 40, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'PRODUCTION_TYPE', 'GA', 'Q1 + TN', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'PRODUCTION_TYPE', 'GU', 'Full Gen AI', 20, true, NOW(), NOW())
ON CONFLICT ("category", "value") DO NOTHING;
