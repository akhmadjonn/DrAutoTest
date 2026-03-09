-- DrAutoTest Database Initialization Script
-- This runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Note: EF Core migrations will handle table creation.
-- This script sets up PostgreSQL-level optimizations.

-- Create a read-only role for analytics
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'drautotest_readonly') THEN
        CREATE ROLE drautotest_readonly;
    END IF;
END
$$;

GRANT CONNECT ON DATABASE drautotest TO drautotest_readonly;
GRANT USAGE ON SCHEMA public TO drautotest_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO drautotest_readonly;
