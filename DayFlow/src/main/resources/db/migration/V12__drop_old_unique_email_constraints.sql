-- V12: Drop all legacy unique constraints on users(email) and employees(employee_code)

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop any single-column unique constraint on users(email)
    FOR r IN (
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        WHERE c.conrelid = 'users'::regclass
          AND c.contype = 'u'
          AND array_length(c.conkey, 1) = 1
          AND a.attname = 'email'
    ) LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop any single-column unique constraint on employees(employee_code)
    FOR r IN (
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        WHERE c.conrelid = 'employees'::regclass
          AND c.contype = 'u'
          AND array_length(c.conkey, 1) = 1
          AND a.attname = 'employee_code'
    ) LOOP
        EXECUTE 'ALTER TABLE employees DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Ensure composite uniqueness per company
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email_company ON users(email, company_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_employees_code_company ON employees(employee_code, company_id);
