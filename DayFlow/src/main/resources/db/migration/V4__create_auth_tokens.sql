-- V4: Create auth_tokens table (hashed, typed, single-use, expiring)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_type') THEN
        CREATE TYPE token_type AS ENUM ('PASSWORD_SETUP', 'EMAIL_VERIFICATION', 'PASSWORD_RESET');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS auth_tokens (
    id           BIGSERIAL PRIMARY KEY,
    token_hash   VARCHAR(255) NOT NULL UNIQUE,
    user_id      BIGINT       NOT NULL REFERENCES users(id),
    token_type   VARCHAR(50)  NOT NULL,
    expires_at   TIMESTAMPTZ  NOT NULL,
    used_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_token_hash ON auth_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id    ON auth_tokens(user_id);
