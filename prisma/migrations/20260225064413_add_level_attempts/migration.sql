-- CreateTable
CREATE TABLE "LevelAttempt" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "examLevelId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LevelAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LevelAttempt_participantId_examLevelId_key" ON "LevelAttempt"("participantId", "examLevelId");

-- AddForeignKey
ALTER TABLE "LevelAttempt" ADD CONSTRAINT "LevelAttempt_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelAttempt" ADD CONSTRAINT "LevelAttempt_examLevelId_fkey" FOREIGN KEY ("examLevelId") REFERENCES "ExamLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
