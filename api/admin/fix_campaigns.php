<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!$account->is_admin) {
  die_json(403, "Not authorized");
}

//Set content type to plain text
header('Content-Type: text/plain');

$sj = array(
  array(
    "name" => "Forest Path",
    "sort_major" => 0,
    "sort_minor" => 0,
    "sort_order" => 1,
  ),
  array(
    "name" => "Azure Caverns",
    "sort_major" => 0,
    "sort_minor" => 0,
    "sort_order" => 2,
  ),
  array(
    "name" => "Loopy Lagoon",
    "sort_major" => 0,
    "sort_minor" => 0,
    "sort_order" => 3,
  ),
  array(
    "name" => "Collapsing Skyline",
    "sort_major" => 0,
    "sort_minor" => 0,
    "sort_order" => 4,
  ),
  array(
    "name" => "Seeing is Believing",
    "sort_major" => 0,
    "sort_minor" => 0,
    "sort_order" => 5,
  ),
  array(
    "name" => "If my 'driveway' almost did you in...",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 1,
  ),
  array(
    "name" => "Cassette Cliffs",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 2,
  ),
  array(
    "name" => "Over the City",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 3,
  ),
  array(
    "name" => "Troposphere",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 4,
  ),
  array(
    "name" => "Potential for Anything",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 5,
  ),
  array(
    "name" => "Midnight Spire",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 6,
  ),
  array(
    "name" => "paint",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 7,
  ),
  array(
    "name" => "Rose Garden",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 8,
  ),
  array(
    "name" => "Treehive",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 9,
  ),
  array(
    "name" => "The Squeeze",
    "sort_major" => 0,
    "sort_minor" => 1,
    "sort_order" => 10,
  ),
  array(
    "name" => "Soap",
    "sort_major" => 0,
    "sort_minor" => 2,
    "sort_order" => 1,
  ),
  array(
    "name" => "Switchtube Vista",
    "sort_major" => 0,
    "sort_minor" => 2,
    "sort_order" => 2,
  ),
  array(
    "name" => "A Gift From the Stars",
    "sort_major" => 0,
    "sort_minor" => 2,
    "sort_order" => 3,
  ),
  array(
    "name" => "Strawberry Orchard",
    "sort_major" => 0,
    "sort_minor" => 2,
    "sort_order" => 4,
  ),
  array(
    "name" => "Dropzle",
    "sort_major" => 0,
    "sort_minor" => 2,
    "sort_order" => 5,
  ),
  array(
    "name" => "Coresaken City",
    "sort_major" => 0,
    "sort_minor" => 2,
    "sort_order" => 6,
  ),
  array(
    "name" => "Blueberry Bay",
    "sort_major" => 0,
    "sort_minor" => 4,
    "sort_order" => NULL,
  ),
  array(
    "name" => "Sleeping Under Stars",
    "sort_major" => 1,
    "sort_minor" => 0,
    "sort_order" => 1,
  ),
  array(
    "name" => "Frosted Fragments",
    "sort_major" => 1,
    "sort_minor" => 0,
    "sort_order" => 2,
  ),
  array(
    "name" => "Fifth Dimension",
    "sort_major" => 1,
    "sort_minor" => 0,
    "sort_order" => 3,
  ),
  array(
    "name" => "Low-G Botany",
    "sort_major" => 1,
    "sort_minor" => 0,
    "sort_order" => 4,
  ),
  array(
    "name" => "Sea of Soup",
    "sort_major" => 1,
    "sort_minor" => 0,
    "sort_order" => 5,
  ),
  array(
    "name" => "Vertigo",
    "sort_major" => 1,
    "sort_minor" => 1,
    "sort_order" => 1,
  ),
  array(
    "name" => "EAT GIRL",
    "sort_major" => 1,
    "sort_minor" => 1,
    "sort_order" => 2,
  ),
  array(
    "name" => "Honeyzip Inc.",
    "sort_major" => 1,
    "sort_minor" => 1,
    "sort_order" => 3,
  ),
  array(
    "name" => "In Filtration",
    "sort_major" => 1,
    "sort_minor" => 1,
    "sort_order" => 4,
  ),
  array(
    "name" => "Supernautica",
    "sort_major" => 1,
    "sort_minor" => 1,
    "sort_order" => 5,
  ),
  array(
    "name" => "The Tower",
    "sort_major" => 1,
    "sort_minor" => 1,
    "sort_order" => 6,
  ),
  array(
    "name" => "Construction Conundrum",
    "sort_major" => 1,
    "sort_minor" => 1,
    "sort_order" => 7,
  ),
  array(
    "name" => "Square the Circle",
    "sort_major" => 1,
    "sort_minor" => 2,
    "sort_order" => 1,
  ),
  array(
    "name" => "Deep Blue",
    "sort_major" => 1,
    "sort_minor" => 2,
    "sort_order" => 2,
  ),
  array(
    "name" => "Temple of a Thousand Skies",
    "sort_major" => 1,
    "sort_minor" => 2,
    "sort_order" => 3,
  ),
  array(
    "name" => "Midnight Monsoon",
    "sort_major" => 1,
    "sort_minor" => 2,
    "sort_order" => 4,
  ),
  array(
    "name" => "Pufferfish Transportation Co.",
    "sort_major" => 1,
    "sort_minor" => 2,
    "sort_order" => 5,
  ),
  array(
    "name" => "Pointless Machines",
    "sort_major" => 1,
    "sort_minor" => 2,
    "sort_order" => 6,
  ),
  array(
    "name" => "Raspberry Roots",
    "sort_major" => 1,
    "sort_minor" => 4,
    "sort_order" => NULL,
  ),
  array(
    "name" => "Sands of Time",
    "sort_major" => 2,
    "sort_minor" => 0,
    "sort_order" => 1,
  ),
  array(
    "name" => "Slime Time!",
    "sort_major" => 2,
    "sort_minor" => 0,
    "sort_order" => 2,
  ),
  array(
    "name" => "Lethal Laser Laboratory",
    "sort_major" => 2,
    "sort_minor" => 0,
    "sort_order" => 3,
  ),
  array(
    "name" => "Starry Ruins",
    "sort_major" => 2,
    "sort_minor" => 0,
    "sort_order" => 4,
  ),
  array(
    "name" => "Undergrowth",
    "sort_major" => 2,
    "sort_minor" => 0,
    "sort_order" => 5,
  ),
  array(
    "name" => "Lost Woods",
    "sort_major" => 2,
    "sort_minor" => 0,
    "sort_order" => 6,
  ),
  array(
    "name" => "Jellyfish Sanctum",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 1,
  ),
  array(
    "name" => "Tectonic Trenches",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 2,
  ),
  array(
    "name" => "Golden Dawn",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 3,
  ),
  array(
    "name" => "Forest Rush",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 4,
  ),
  array(
    "name" => "Attack of the Clone",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 5,
  ),
  array(
    "name" => "Bee Berserk",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 6,
  ),
  array(
    "name" => "Java's Crypt",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 7,
  ),
  array(
    "name" => "Raindrops on Roses",
    "sort_major" => 2,
    "sort_minor" => 1,
    "sort_order" => 8,
  ),
  array(
    "name" => "Toggle Theory",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 1,
  ),
  array(
    "name" => "Superstructure",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 2,
  ),
  array(
    "name" => "The Tower (XVI)",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 3,
  ),
  array(
    "name" => "Starlight Station",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 4,
  ),
  array(
    "name" => "Dusk City",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 5,
  ),
  array(
    "name" => "Synapse",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 6,
  ),
  array(
    "name" => "The Lab",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 7,
  ),
  array(
    "name" => "Belated Valentine's Day",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 8,
  ),
  array(
    "name" => "Thinking with Portals",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 9,
  ),
  array(
    "name" => "Rightside-Down Cavern",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 10,
  ),
  array(
    "name" => "Call of the Void",
    "sort_major" => 2,
    "sort_minor" => 2,
    "sort_order" => 11,
  ),
  array(
    "name" => "Mango Mesa",
    "sort_major" => 2,
    "sort_minor" => 4,
    "sort_order" => NULL,
  ),
  array(
    "name" => "Flying Battery",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 1,
  ),
  array(
    "name" => "The Core Problem",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 2,
  ),
  array(
    "name" => "Overgrown Linn",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 3,
  ),
  array(
    "name" => "Hydroshock",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 4,
  ),
  array(
    "name" => "Subway Neon",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 5,
  ),
  array(
    "name" => "Meaningless Contraptions",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 6,
  ),
  array(
    "name" => "Golden Alleyway",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 7,
  ),
  array(
    "name" => "System.InvalidMapException",
    "sort_major" => 3,
    "sort_minor" => 0,
    "sort_order" => 8,
  ),
  array(
    "name" => "A Change in Direction",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 1,
  ),
  array(
    "name" => "Skyline Usurper",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 2,
  ),
  array(
    "name" => "Clockwork",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 3,
  ),
  array(
    "name" => "Plasma Reactor",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 4,
  ),
  array(
    "name" => "FLOATING POINT",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 5,
  ),
  array(
    "name" => "Storm Runner",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 6,
  ),
  array(
    "name" => "Time Trouble",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 7,
  ),
  array(
    "name" => "Hypnagogia",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 8,
  ),
  array(
    "name" => "Ethereal Ascension",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 9,
  ),
  array(
    "name" => "Vinculum",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 10,
  ),
  array(
    "name" => "Mosaic Garden",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 11,
  ),
  array(
    "name" => "Lunar Pagoda",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 12,
  ),
  array(
    "name" => "Caper Cavortion",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 13,
  ),
  array(
    "name" => "Madeline: The Bubble",
    "sort_major" => 3,
    "sort_minor" => 1,
    "sort_order" => 14,
  ),
  array(
    "name" => "Chromatic Complex",
    "sort_major" => 3,
    "sort_minor" => 2,
    "sort_order" => 1,
  ),
  array(
    "name" => "Fortress Fall",
    "sort_major" => 3,
    "sort_minor" => 2,
    "sort_order" => 2,
  ),
  array(
    "name" => "Psychokinetic",
    "sort_major" => 3,
    "sort_minor" => 2,
    "sort_order" => 3,
  ),
  array(
    "name" => "Garden of Khu'tara",
    "sort_major" => 3,
    "sort_minor" => 2,
    "sort_order" => 4,
  ),
  array(
    "name" => "Narrow Hollow",
    "sort_major" => 3,
    "sort_minor" => 2,
    "sort_order" => 5,
  ),
  array(
    "name" => "Summit Down-Side",
    "sort_major" => 3,
    "sort_minor" => 2,
    "sort_order" => 6,
  ),
  array(
    "name" => "Polaris",
    "sort_major" => 3,
    "sort_minor" => 2,
    "sort_order" => 7,
  ),
  array(
    "name" => "Starfruit Supernova",
    "sort_major" => 3,
    "sort_minor" => 4,
    "sort_order" => NULL,
  ),
  array(
    "name" => "Flipside Cliffside",
    "sort_major" => 4,
    "sort_minor" => 0,
    "sort_order" => 1,
  ),
  array(
    "name" => "Lava Layer",
    "sort_major" => 4,
    "sort_minor" => 0,
    "sort_order" => 2,
  ),
  array(
    "name" => "kevintechspam.bin",
    "sort_major" => 4,
    "sort_minor" => 0,
    "sort_order" => 3,
  ),
  array(
    "name" => "Fractured Iridescence",
    "sort_major" => 4,
    "sort_minor" => 0,
    "sort_order" => 4,
  ),
  array(
    "name" => "Superluminary",
    "sort_major" => 4,
    "sort_minor" => 1,
    "sort_order" => 1,
  ),
  array(
    "name" => "Belly of the Beast",
    "sort_major" => 4,
    "sort_minor" => 1,
    "sort_order" => 2,
  ),
  array(
    "name" => "Cycle Madness B-Side",
    "sort_major" => 4,
    "sort_minor" => 1,
    "sort_order" => 3,
  ),
  array(
    "name" => "Cave of the Crimson Sky",
    "sort_major" => 4,
    "sort_minor" => 1,
    "sort_order" => 4,
  ),
  array(
    "name" => "Drifting Deep",
    "sort_major" => 4,
    "sort_minor" => 1,
    "sort_order" => 5,
  ),
  array(
    "name" => "World Abyss",
    "sort_major" => 4,
    "sort_minor" => 2,
    "sort_order" => 1,
  ),
  array(
    "name" => "Stellar Odyssey",
    "sort_major" => 4,
    "sort_minor" => 2,
    "sort_order" => 2,
  ),
  array(
    "name" => "74",
    "sort_major" => 4,
    "sort_minor" => 2,
    "sort_order" => 3,
  ),
  array(
    "name" => "Shattersong",
    "sort_major" => 4,
    "sort_minor" => 2,
    "sort_order" => 4,
  ),
  array(
    "name" => "summit",
    "sort_major" => 4,
    "sort_minor" => 2,
    "sort_order" => 5,
  ),
  array(
    "name" => "Ivory",
    "sort_major" => 4,
    "sort_minor" => 3,
    "sort_order" => 1,
  ),
  array(
    "name" => "Pinball Purgatory",
    "sort_major" => 4,
    "sort_minor" => 3,
    "sort_order" => 2,
  ),
  array(
    "name" => "The Solar Express",
    "sort_major" => 4,
    "sort_minor" => 3,
    "sort_order" => 3,
  ),
  array(
    "name" => "Nelumbo",
    "sort_major" => 4,
    "sort_minor" => 3,
    "sort_order" => 4,
  ),
  array(
    "name" => "Passionfruit Pantheon",
    "sort_major" => 4,
    "sort_minor" => 4,
    "sort_order" => NULL,
  ),
);
fix_campaign_sorts(1199, $sj);


$winter_collab = array(
  array(
    "name" => "Sapphire Summit",
    "sort_major" => NULL,
    "sort_minor" => 0,
    "sort_order" => 0,
  ),
  array(
    "name" => "Sapphiretissimo",
    "sort_major" => NULL,
    "sort_minor" => 0,
    "sort_order" => 1,
  ),
  array(
    "name" => "Tempestissimo",
    "sort_major" => NULL,
    "sort_minor" => 0,
    "sort_order" => 2,
  ),
  array(
    "name" => "Abandoned Mines",
    "sort_major" => NULL,
    "sort_minor" => 1,
    "sort_order" => 0,
  ),
  array(
    "name" => "Tower of the Moon",
    "sort_major" => NULL,
    "sort_minor" => 1,
    "sort_order" => 1,
  ),
  array(
    "name" => "Candy Cliffs",
    "sort_major" => NULL,
    "sort_minor" => 2,
    "sort_order" => 0,
  ),
  array(
    "name" => "Cheese Farewell (With Extra Cheese)",
    "sort_major" => NULL,
    "sort_minor" => 2,
    "sort_order" => 1,
  ),
  array(
    "name" => "Cheesecake Country",
    "sort_major" => NULL,
    "sort_minor" => 2,
    "sort_order" => 2,
  ),
  array(
    "name" => "Crystal Quarry",
    "sort_major" => NULL,
    "sort_minor" => 2,
    "sort_order" => 3,
  ),
  array(
    "name" => "Garden in the Sky",
    "sort_major" => NULL,
    "sort_minor" => 2,
    "sort_order" => 4,
  ),
  array(
    "name" => "Opalescent Caverns",
    "sort_major" => NULL,
    "sort_minor" => 2,
    "sort_order" => 5,
  ),
  array(
    "name" => "Storm Garden",
    "sort_major" => NULL,
    "sort_minor" => 2,
    "sort_order" => 6,
  ),
  array(
    "name" => "Distorted",
    "sort_major" => NULL,
    "sort_minor" => 3,
    "sort_order" => 0,
  ),
  array(
    "name" => "Frigid Storm",
    "sort_major" => NULL,
    "sort_minor" => 3,
    "sort_order" => 1,
  ),
  array(
    "name" => "Momentum Sanctuary",
    "sort_major" => NULL,
    "sort_minor" => 3,
    "sort_order" => 2,
  ),
  array(
    "name" => "Portal Reef",
    "sort_major" => NULL,
    "sort_minor" => 3,
    "sort_order" => 3,
  ),
  array(
    "name" => "Starship Ruins",
    "sort_major" => NULL,
    "sort_minor" => 3,
    "sort_order" => 4,
  ),
  array(
    "name" => "Warped Bay",
    "sort_major" => NULL,
    "sort_minor" => 3,
    "sort_order" => 5,
  ),
  array(
    "name" => "Lunar Ascension",
    "sort_major" => NULL,
    "sort_minor" => 4,
    "sort_order" => 0,
  ),
  array(
    "name" => "FORWARD FACILITY",
    "sort_major" => NULL,
    "sort_minor" => 4,
    "sort_order" => 1,
  ),
  array(
    "name" => "Chaos Complex",
    "sort_major" => NULL,
    "sort_minor" => 4,
    "sort_order" => 2,
  ),
  array(
    "name" => "Winter Collab Fusion Side",
    "sort_major" => NULL,
    "sort_minor" => 5,
    "sort_order" => NULL,
  ),
);
fix_campaign_sorts(977, $winter_collab);



function fix_campaign_sorts($campaign_id, $maps)
{
  global $DB;

  $campaign = Campaign::get_by_id($DB, $campaign_id);
  if (!$campaign) {
    echo "Campaign not found\n";
    return;
  }

  echo "\n\n ===== Fixing campaign: " . $campaign->name . " ===== \n\n";

  //Fetch 
  $query = "SELECT * FROM map WHERE campaign_id = $campaign_id";
  $result = pg_query($DB, $query);

  //Loop through maps
  while ($row = pg_fetch_assoc($result)) {
    $map = new Map();
    $map->apply_db_data($row);

    //Find the map in the JSON
    $found = false;
    foreach ($maps as $map_data) {
      if ($map_data['name'] == $map->name) {
        //Update the sort properties of the map
        $map->sort_major = $map_data['sort_major'];
        $map->sort_minor = $map_data['sort_minor'];
        $map->sort_order = $map_data['sort_order'];
        if ($campaign_id == 1199) {
          //For SJ specifically, get the challenges of the map and set their objective id's to 2 if the map name doesnt contain "Heart Side"
          $map->fetch_challenges($DB);
          foreach ($map->challenges as $challenge) {
            if (strpos($map->name, "Heart Side") === false) {
              $challenge->objective_id = 2;
              if (!$challenge->update($DB)) {
                echo "Failed to save challenge: " . $challenge->name . "\n";
              } else {
                echo "Updated challenge: " . $challenge->name . "\n";
              }
            }
          }
        }
        if (!$map->update($DB)) {
          echo "Failed to save map: " . $map->name . "\n";
        } else {
          echo "Updated map: " . $map->name . "\n";
        }
        $found = true;
        break;
      }
    }

    if (!$found) {
      echo "Map not found in JSON: " . $map->name . "\n";
    }
  }
}
