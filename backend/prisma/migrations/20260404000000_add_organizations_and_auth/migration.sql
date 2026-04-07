-- CreateTable: organizations
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- Add organizationId to teams
ALTER TABLE "teams" ADD COLUMN "organizationId" TEXT;
-- Add organizationId to projects
ALTER TABLE "projects" ADD COLUMN "organizationId" TEXT;
-- Add organizationId to tasks
ALTER TABLE "tasks" ADD COLUMN "organizationId" TEXT;
-- Add organizationId to weekly_metrics
ALTER TABLE "weekly_metrics" ADD COLUMN "organizationId" TEXT;

-- Add email, passwordHash, organizationId to users
ALTER TABLE "users"
    ADD COLUMN "email" TEXT,
    ADD COLUMN "passwordHash" TEXT,
    ADD COLUMN "organizationId" TEXT;

-- Drop old unique constraint on system_configs key (was globally unique, now per-org)
ALTER TABLE "system_configs" DROP CONSTRAINT IF EXISTS "system_configs_key_key";
ALTER TABLE "system_configs" ADD COLUMN "organizationId" TEXT;

-- Create a default org for existing data
INSERT INTO "organizations" ("id", "name", "slug", "createdAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Org', 'default-org', NOW());

-- Backfill organizationId on all tables
UPDATE "teams" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "projects" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "tasks" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "weekly_metrics" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "system_configs" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "users" SET
    "organizationId" = '00000000-0000-0000-0000-000000000001',
    "email" = id || '@placeholder.local',
    "passwordHash" = 'PLACEHOLDER'
WHERE "organizationId" IS NULL;

-- Now make columns NOT NULL
ALTER TABLE "teams" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "weekly_metrics" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "system_configs" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add unique constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "system_configs_organizationId_key_key" ON "system_configs"("organizationId", "key");
CREATE INDEX "tasks_organizationId_idx" ON "tasks"("organizationId");

-- Add foreign keys
ALTER TABLE "teams" ADD CONSTRAINT "teams_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "weekly_metrics" ADD CONSTRAINT "weekly_metrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "system_configs" ADD CONSTRAINT "system_configs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
