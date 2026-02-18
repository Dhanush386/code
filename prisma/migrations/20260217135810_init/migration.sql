-- CreateTable
CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamName" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "members" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputFormat" TEXT NOT NULL,
    "outputFormat" TEXT NOT NULL,
    "constraints" TEXT NOT NULL,
    "sampleInput" TEXT NOT NULL,
    "sampleOutput" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "languages" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    CONSTRAINT "Exam_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "accessCode" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    CONSTRAINT "ExamLevel_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionOnExam" (
    "questionId" TEXT NOT NULL,
    "examLevelId" TEXT NOT NULL,

    PRIMARY KEY ("questionId", "examLevelId"),
    CONSTRAINT "QuestionOnExam_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionOnExam_examLevelId_fkey" FOREIGN KEY ("examLevelId") REFERENCES "ExamLevel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParticipantExam" (
    "participantId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,

    PRIMARY KEY ("participantId", "examId"),
    CONSTRAINT "ParticipantExam_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParticipantExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_username_key" ON "Organizer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_teamName_key" ON "Participant"("teamName");

-- CreateIndex
CREATE UNIQUE INDEX "ExamLevel_accessCode_key" ON "ExamLevel"("accessCode");
