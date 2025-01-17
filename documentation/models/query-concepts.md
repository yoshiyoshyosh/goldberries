# Query Concepts

These are some queries for concepts that don't yet exist on goldberries.net

## Submission Count by Input Method > Difficulty

```
SELECT
  account.input_method,
  difficulty.name AS diff_name, difficulty.subtier AS diff_subtier,
  COUNT(*) AS submission_count
FROM submission
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
JOIN player ON submission.player_id = player.id
LEFT JOIN account ON account.player_id = submission.player_id
WHERE submission.is_verified = TRUE
GROUP BY account.input_method, difficulty.id
ORDER BY account.input_method DESC, difficulty.sort DESC
```

## Count of Difficulty Suggestions by Difficulty

```
SELECT
  difficulty.sort AS diff_sort,
  COUNT(*) AS count_suggested_difficulties
FROM submission
LEFT JOIN difficulty ON submission.suggested_difficulty_id = difficulty.id
WHERE submission.is_verified = TRUE
GROUP BY difficulty.id
ORDER BY difficulty.sort DESC
```

## Verified Submission Count

```
SELECT
  player.name,
  COUNT(submission.id) as verified_submissions
FROM submission
JOIN player ON submission.verifier_id = player.id
JOIN challenge ON submission.challenge_id = challenge.id
JOIN map ON challenge.map_id = map.id
GROUP BY player.id
ORDER BY verified_submissions DESC
```

## Submission Count by Country

```
SELECT
  COUNT(submission.id) AS submission_count,
  account.country AS country
FROM submission
JOIN player ON submission.player_id = player.id
LEFT JOIN account ON player.id = account.player_id
WHERE submission.is_verified = TRUE
GROUP BY account.country
ORDER BY submission_count DESC
```

And additionally by difficulty

```
SELECT
  account.country AS country,
  difficulty.id AS difficulty_id,
  COUNT(submission.id) AS submission_count
FROM submission
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
JOIN player ON submission.player_id = player.id
LEFT JOIN account ON player.id = account.player_id
WHERE submission.is_verified = TRUE
GROUP BY account.country, difficulty.id
ORDER BY account.country ASC, difficulty.sort DESC, submission_count DESC
```
