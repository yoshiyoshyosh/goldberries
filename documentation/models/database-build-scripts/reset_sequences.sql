-- Reset Sequences after importing data
SELECT setval('account_id_seq', (SELECT MAX(id) FROM account));
SELECT setval('player_id_seq', (SELECT MAX(id) FROM player));
SELECT setval('session_id_seq', (SELECT MAX(id) FROM session));

SELECT setval('campaign_id_seq', (SELECT MAX(id) FROM campaign));
SELECT setval('map_id_seq', (SELECT MAX(id) FROM "map"));
SELECT setval('challenge_id_seq', (SELECT MAX(id) FROM challenge));
SELECT setval('submission_id_seq', (SELECT MAX(id) FROM submission));

SELECT setval('objective_id_seq', (SELECT MAX(id) FROM objective));
SELECT setval('difficulty_id_seq', (SELECT MAX(id) FROM difficulty));
SELECT setval('new_challenge_id_seq', (SELECT MAX(id) FROM new_challenge));
SELECT setval('change_id_seq', (SELECT MAX(id) FROM change));
SELECT setval('logging_id_seq', (SELECT MAX(id) FROM logging));

SELECT setval('suggestion_id_seq', (SELECT MAX(id) FROM suggestion));
SELECT setval('suggestion_vote_id_seq', (SELECT MAX(id) FROM suggestion_vote));

SELECT setval('showcase_id_seq', (SELECT MAX(id) FROM showcase));
SELECT setval('traffic_id_seq', (SELECT MAX(id) FROM traffic));

-- Set sequences to 0 to start from scratch
SELECT setval('account_id_seq', 1);
SELECT setval('player_id_seq', 1);
SELECT setval('session_id_seq', 1);

SELECT setval('campaign_id_seq', 1);
SELECT setval('map_id_seq', 1);
SELECT setval('challenge_id_seq', 1);
SELECT setval('submission_id_seq', 1);

SELECT setval('objective_id_seq', 1);
SELECT setval('difficulty_id_seq', 1);
SELECT setval('new_challenge_id_seq', 1);
SELECT setval('change_id_seq', 1);
SELECT setval('logging_id_seq', 1);

SELECT setval('suggestion_id_seq', 1);
SELECT setval('suggestion_vote_id_seq', 1);

SELECT setval('showcase_id_seq', 1);