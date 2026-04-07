-- Drop the old global unique index on system_configs.key
-- It was replaced by the compound unique (organizationId, key)
DROP INDEX IF EXISTS "system_configs_key_key";
