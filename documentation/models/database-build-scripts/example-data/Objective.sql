INSERT INTO Objective(name, description, is_arbitrary, display_name_suffix) 
VALUES 
('Golden Berry', 'Collect the golden strawberry of the map', false, NULL),
('Silver Berry', 'Collect the silver strawberry of the map', false, NULL),

('All Maps Deathless', 'Complete all maps in the campaign without dying', false, NULL),
('100% Deathless', 'Complete all maps and obtain all collectibles in the campaign without dying', false, NULL),
('All C-Sides Deathless', 'Complete all C-Sides of the campaign without dying', false, NULL),
('Void-Side Moon Berry', 'Get the moon berry in Void-Side. This entails doing the Spring-Side, Summer-Side, Winter-Side, Fall-Side and Void-Side golden strawberries in a row without dying, where Void-Side must be last. Void-Side B-Side is not required for this.', false, NULL),

('Bronze Berry', 'Collect the bronze berry (shielded golden berry) of the map. The bronze berry allows you to die a maximum of one time per room.', true, NULL),
('Segment Golden Berry', 'Collect a golden strawberry by completing a segment of the map without dying', true, NULL),
('Segment Silver Berry', 'Collect a silver strawberry by completing a segment of the map without dying', true, NULL),
('Segment Red Berry', 'Collect a red strawberry by completing a segment of the map without dying', true, NULL),

('DTS', 'Collect the golden strawberry while using a Dash-Trigger-Skip', true, NULL),
('No DTS', 'Collect the golden strawberry without using an existing Dash-Trigger-Skip', true, NULL),

('Quadruple Golden Berry', 'Collect all four golden strawberries (2 deathless, 2 one-dash) in one run.', false, 'Quadruple Golden'),
('Forwards Golden', 'Collect the start->end golden strawberry', true, 'Forwards'),
('Backwards Golden', 'Collect the end->start golden strawberry', true, 'Backwards'),
('Double Golden', 'Collect both the forwards and backwards golden strawberry', true, 'Double Golden'),

('Intermediate Lobby Deathless', 'Complete all maps in the intermediate lobby without dying', false, NULL);
