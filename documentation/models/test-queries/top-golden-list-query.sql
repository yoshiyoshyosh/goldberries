SELECT Challenge.id, Challenge.map_id, Challenge.date_created,
  Challenge.requires_fc, Challenge.requires_special, Challenge.has_fc, Challenge.has_special,
  Objective.name AS "objective_name",
  Difficulty.name AS "difficulty_tier", Challenge.difficulty_subtier,
  Difficulty.tier AS "tier_sort",
  Map.name AS "map_name",
  Campaign.id AS "campaign_id",
  Campaign.name AS "campaign_name",
  (SELECT COUNT(*) FROM Submission WHERE Submission.challenge_id = Challenge.id) AS "clear_count",
  (SELECT Submission.proof_url FROM Submission WHERE Submission.challenge_id = Challenge.id ORDER BY Submission.date_created ASC LIMIT 1) AS "first_clear_url"
FROM Challenge
JOIN Difficulty ON Challenge.difficulty_id = Difficulty.id
LEFT JOIN Map ON Challenge.map_id = Map.id
LEFT JOIN Campaign ON Map.campaign_id = Campaign.id
JOIN Objective ON Challenge.objective_id = Objective.id
WHERE Challenge.difficulty_id IN (SELECT * FROM TopGoldenListDifficultyIds)
 AND Challenge.challenge_type = "map"
 AND Objective.is_arbitrary = 0
ORDER BY "tier_sort" ASC
