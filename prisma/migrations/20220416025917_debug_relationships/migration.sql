/*
  Warnings:

  - You are about to drop the `Upvote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CommentToMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `memberId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_memberId_fkey";

-- DropForeignKey
ALTER TABLE "_CommentToMember" DROP CONSTRAINT "_CommentToMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_CommentToMember" DROP CONSTRAINT "_CommentToMember_B_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "memberId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Upvote";

-- DropTable
DROP TABLE "_CommentToMember";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
