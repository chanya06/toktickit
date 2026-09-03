-- CreateIndex
CREATE INDEX "Attachment_removedByRequesterId_idx" ON "Attachment"("removedByRequesterId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_removedByRequesterId_fkey" FOREIGN KEY ("removedByRequesterId") REFERENCES "DevelopmentRequester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
