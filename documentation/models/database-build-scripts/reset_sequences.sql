-- Reset Sequences after importing data
SELECT setval('account_id_seq', (SELECT MAX(id) FROM account)+1);
SELECT setval('player_id_seq', (SELECT MAX(id) FROM player)+1);

SELECT setval('campaign_id_seq', (SELECT MAX(id) FROM campaign)+1);
SELECT setval('map_id_seq', (SELECT MAX(id) FROM "map")+1);
SELECT setval('challenge_id_seq', (SELECT MAX(id) FROM challenge)+1);
SELECT setval('submission_id_seq', (SELECT MAX(id) FROM submission)+1);

SELECT setval('objective_id_seq', (SELECT MAX(id) FROM objective)+1);
SELECT setval('difficulty_id_seq', (SELECT MAX(id) FROM difficulty)+1);
SELECT setval('new_challenge_id_seq', (SELECT MAX(id) FROM new_challenge)+1);
SELECT setval('change_id_seq', (SELECT MAX(id) FROM change)+1);
SELECT setval('logging_id_seq', (SELECT MAX(id) FROM logging)+1);

SELECT setval('suggestion_id_seq', (SELECT MAX(id) FROM suggestion)+1);
SELECT setval('suggestion_vote_id_seq', (SELECT MAX(id) FROM suggestion_vote)+1);