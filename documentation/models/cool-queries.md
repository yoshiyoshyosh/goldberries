# Cool Queries

These are some cool queries that I cooked up at some point, but haven't put into actual endpoints yet

## Time in days between 1st and 2nd submission on all challenges

```
SELECT
 t.challenge_id,
 MIN(t.date_achieved) AS date_achieved_first,
 MAX(t.date_achieved) AS date_achieved_second,
 EXTRACT(DAY FROM MAX(t.date_achieved) - MIN(t.date_achieved)) AS days_difference
FROM (
  SELECT
    submission.*,
    row_number() over (partition BY submission.challenge_id ORDER BY submission.date_achieved) AS row_number
   FROM submission
   WHERE submission.is_verified = TRUE
) t
JOIN challenge ON t.challenge_id = challenge.id
WHERE t.row_number = 1 OR t.row_number = 2
GROUP BY t.challenge_id
ORDER BY days_difference DESC
```

## Most searched terms

```
SELECT
	tmp.search_term,
	COUNT(*) AS count_searched
FROM (SELECT
		LOWER(regexp_replace((regexp_matches(traffic.query, 'q=([^&]+)', ''))[1], '\+', ' ', 'g')) AS search_term
	FROM traffic
	WHERE traffic.page = '/api/search') AS tmp
WHERE LENGTH(tmp.search_term) > 1
GROUP BY search_term
ORDER BY count_searched DESC
```

## Map Totals Collectibles

```
SELECT
  split_part(entry, '|', 1)::INTEGER AS collectible_id,
  SUM(
    CASE
      WHEN split_part(entry, '|', 3) = '' THEN 1
      ELSE split_part(entry, '|', 3)::INTEGER
    END
  ) AS total_amount
FROM "map",
  unnest(string_to_array(collectibles, E'\t')) AS entry
GROUP BY collectible_id
ORDER BY collectible_id;
```

## Average time for submission to get verified

```
SELECT
  TO_CHAR(date_created, 'YYYY-MM') AS month,
  ROUND(AVG(ABS(EXTRACT(EPOCH FROM (date_verified - date_created)) / 86400.0)), 2) AS avg_days_to_verify
FROM
  submission
WHERE
  date_created >= '2024-08-01'
  AND date_verified IS NOT NULL
  AND date_created IS NOT NULL
GROUP BY
  TO_CHAR(date_created, 'YYYY-MM')
ORDER BY
  month;
```

## Oldest lonely challenges

```
SELECT
  view_challenges.challenge_id,
  submission.player_id,
  submission.date_achieved,
  EXTRACT(DAY FROM NOW() - submission.date_achieved) AS days_difference
FROM view_challenges
JOIN submission ON view_challenges.challenge_id = submission.challenge_id
WHERE view_challenges.count_submissions = 1
ORDER BY days_difference DESC
```
