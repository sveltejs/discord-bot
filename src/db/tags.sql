CREATE TABLE IF NOT EXISTS tags (
	id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	tag_name VARCHAR(255) NOT NULL UNIQUE,
	tag_content TEXT NOT NULL,
	author_id TEXT NOT NULL
);

CREATE UNIQUE INDEX tag_name_idx on tags(tag_name);

CREATE EXTENSION pg_trgm;

CREATE OR REPLACE FUNCTION matching_tags(to_search VARCHAR) RETURNS TABLE (
		id BIGINT,
		tag_name VARCHAR(255),
		tag_content TEXT,
		author_id TEXT
	) AS $$
	BEGIN 
		RETURN QUERY
		SELECT tags.id,
			tags.tag_name,
			tags.tag_content,
			tags.author_id
		FROM tags
		WHERE tags.tag_name % to_search
		ORDER BY similarity(tags.tag_name, to_search)
		LIMIT 3;
	END;
$$ LANGUAGE PLPGSQL;