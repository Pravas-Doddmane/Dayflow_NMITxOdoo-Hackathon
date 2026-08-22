-- V2: Create users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255),
    role_id          BIGINT       NOT NULL REFERENCES roles(id),
    email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    account_status   VARCHAR(50)  NOT NULL DEFAULT 'INVITED',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
