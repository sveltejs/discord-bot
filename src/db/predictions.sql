CREATE TABLE IF NOT EXISTS predictions (
    message_id VARCHAR(18) PRIMARY KEY NOT NULL,
    author_id VARCHAR(18) NOT NULL,
    prediction FLOAT8 NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() at time zone 'utc'),
    correct BOOLEAN NOT NULL DEFAULT true
)