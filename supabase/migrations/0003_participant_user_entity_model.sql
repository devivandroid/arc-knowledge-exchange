ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS user_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT;

UPDATE participants
SET user_type = CASE
  WHEN LOWER(COALESCE(participant_type, '')) = 'agent' THEN 'AGENT'
  ELSE 'HUMAN'
END
WHERE user_type IS NULL;

UPDATE participants
SET entity_type = CASE
  WHEN LOWER(COALESCE(participant_type, '')) = 'organization' THEN 'ORGANIZATION'
  ELSE 'INDIVIDUAL'
END
WHERE entity_type IS NULL;
