INSERT INTO "objective" ("id", "name", "description", "display_name_suffix", "is_arbitrary", "icon_url") VALUES
	(1, 'Golden Berry', 'Collect the golden strawberry of the map', NULL, 'false', '/icons/goldenberry-8x.png'),
	(2, 'Silver Berry', 'Collect the silver strawberry of the map', NULL, 'false', '/icons/silverberry-8x.png'),
	(3, 'All Maps Deathless', 'Complete all maps in the campaign or a subset of the campaign without dying', NULL, 'false', NULL),
	(4, '100% Deathless', 'Complete all maps and obtain all collectibles in the campaign without dying', NULL, 'false', NULL),
	(5, 'Special Berry', 'Get the special berry without dying.', NULL, 'false', NULL),
	(6, 'Bronze Berry', 'Collect the bronze berry (shielded golden berry) of the map. The bronze berry allows you to die a maximum of one time per room.', NULL, 'true', NULL),
	(7, 'Segment', 'Complete a segment of the map without dying', NULL, 'true', '/icons/goldenberry-8x.png'),
	(8, 'DTS', 'Collect the golden strawberry while using a Dash-Trigger-Skip', 'DTS', 'false', '/icons/goldenberry-8x.png'),
	(9, 'No DTS', 'Collect the golden strawberry without using an existing Dash-Trigger-Skip', 'No DTS', 'false', '/icons/goldenberry-8x.png'),
	(10, 'True Ending', 'Achieve the true ending of the map without dying', 'True Ending', 'false', '/icons/goldenberry-8x.png'),
	(11, 'Platinum Berry', 'Collect the platinum strawberry of the map', NULL, 'false', '/icons/platinumberry-8x.png');