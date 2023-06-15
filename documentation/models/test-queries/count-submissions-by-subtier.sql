SELECT
  COUNT(*) AS submission_count,
  Difficulty.name,
  Challenge.difficulty_subtier
FROM Submission
JOIN Challenge ON Submission.challenge_id = Challenge.id
JOIN Difficulty ON Challenge.difficulty_id = Difficulty.id
JOIN Player ON Submission.player_id = Player.id
GROUP BY Challenge.difficulty_id, Challenge.difficulty_subtier