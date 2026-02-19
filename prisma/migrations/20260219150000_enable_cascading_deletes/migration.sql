-- DropForeignKey
ALTER TABLE "QuestionOnExam" DROP CONSTRAINT "QuestionOnExam_questionId_fkey";

-- AddForeignKey
ALTER TABLE "QuestionOnExam" ADD CONSTRAINT "QuestionOnExam_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
