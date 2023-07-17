CREATE TABLE IF NOT EXISTS thread_solves (
	user_id VARCHAR(18) PRIMARY KEY,
	count BIGINT NOT NULL DEFAULT 0
);

CREATE VIEW leaderboard AS (
	SELECT * FROM thread_solves ORDER BY count DESC LIMIT 10
);

CREATE OR REPLACE FUNCTION increment_solve_count(solver_id VARCHAR(18))
RETURNS void
LANGUAGE plpgsql AS
$$
DECLARE i_count BIGINT;
BEGIN
	SELECT count INTO i_count FROM thread_solves WHERE user_id = solver_id;
	IF i_count IS NULL THEN
		INSERT INTO thread_solves (user_id, count) VALUES (solver_id, 1);
	ELSE
		UPDATE thread_solves SET count = i_count + 1 WHERE user_id = solver_id;
	END IF;
END;
$$;
