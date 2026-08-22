-- V7: Create salary_structures table
CREATE TABLE IF NOT EXISTS salary_structures (
    id             BIGSERIAL      PRIMARY KEY,
    employee_id    BIGINT         NOT NULL REFERENCES employees(id),
    basic_salary   NUMERIC(15,2)  NOT NULL CHECK (basic_salary >= 0),
    hra            NUMERIC(15,2)  NOT NULL DEFAULT 0 CHECK (hra >= 0),
    allowances     NUMERIC(15,2)  NOT NULL DEFAULT 0 CHECK (allowances >= 0),
    deductions     NUMERIC(15,2)  NOT NULL DEFAULT 0 CHECK (deductions >= 0),
    net_salary     NUMERIC(15,2)  NOT NULL CHECK (net_salary >= 0),
    effective_from DATE           NOT NULL,
    effective_to   DATE,
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_salary_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_salary_employee_id ON salary_structures(employee_id);
