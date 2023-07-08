SELECT 
  Submission.*,
  player.name AS player_name,
  Map.name AS map_name,
  Campaign.name AS campaign_name,
  Objective.name AS objective_name,
  Objective.description AS objective_description,
  Difficulty.name AS difficulty_name,
  Challenge.difficulty_subtier AS difficulty_subtier,
  verifier.name AS verifier_name,
  Challenge.requires_fc AS challenge_requires_fc,
  Challenge.requires_special AS challenge_requires_special
FROM Submission 
JOIN Challenge ON Submission.challenge_id = Challenge.id
JOIN Objective ON Challenge.objective_id = Objective.id
JOIN Difficulty ON Challenge.difficulty_id = Difficulty.id
JOIN Player player ON Submission.player_id = player.id
JOIN Player verifier ON Submission.verifier_id = verifier.id
LEFT JOIN Map ON Challenge.map_id = Map.id
LEFT JOIN Campaign ON Map.campaign_id = Campaign.id
WHERE Submission.player_id IN (SELECT Player.id FROM Player WHERE Player.name LIKE 'voddie');
