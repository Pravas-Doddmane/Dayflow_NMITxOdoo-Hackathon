-- V11: Allow one email across multiple companies and add company logo
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- Drop global unique constraint on users(email) to allow one email in multiple companies
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_company ON users(email, company_id);

-- Drop global unique constraint on employees(employee_code) to allow unique code per company
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_employee_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_code_company ON employees(employee_code, company_id);
