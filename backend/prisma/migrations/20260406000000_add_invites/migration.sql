CREATE TABLE "invites" (
  "id"             TEXT NOT NULL,
  "email"          TEXT NOT NULL,
  "role"           "Role" NOT NULL DEFAULT 'CONTRIBUTOR',
  "token"          TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "invitedById"    TEXT NOT NULL,
  "expiresAt"      TIMESTAMP(3) NOT NULL,
  "acceptedAt"     TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");
CREATE INDEX "invites_token_idx" ON "invites"("token");
CREATE INDEX "invites_organizationId_email_idx" ON "invites"("organizationId", "email");

ALTER TABLE "invites"
  ADD CONSTRAINT "invites_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invites"
  ADD CONSTRAINT "invites_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
