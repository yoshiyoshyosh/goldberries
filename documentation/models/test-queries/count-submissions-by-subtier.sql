SELECT
  COUNT(*) AS submission_count,
  Challenge.difficulty_id,
  Challenge.difficulty_subtier AS difficulty_subtier,
  Difficulty.name AS difficulty_tier
FROM Submission
INNER JOIN Challenge ON Submission.challenge_id = Challenge.id
INNER JOIN Difficulty ON Challenge.difficulty_id = Difficulty.id
GROUP BY Challenge.difficulty_id, Challenge.difficulty_subtier, Difficulty.name
ORDER BY Challenge.difficulty_id, Challenge.difficulty_subtier;
