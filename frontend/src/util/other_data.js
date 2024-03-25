export const FAQData = [
  {
    question: "Can I submit maps that aren't in the list yet?",
    answer:
      "Yes, you can submit a golden for a map that isn't in the list yet. In this case you must also provide a link to the map and make sure that the map follows all the rules. But even if it does, we may not add it to the list for certain reasons which we will specify in the page with rejected maps.",
  },
  {
    question: "What difficulty should a map have to make it into the list?",
    answer:
      "Generally, it should be a map with at least some obstacles on your way and not too short. This is very much a blurry line, but one can generally see the boundaries by looking at the Rejected List, as well as the easier Standard List maps.",
  },
  {
    question:
      "Are there any factors that decide whether a map is gonna be added to the list, other than difficulty?",
    answer:
      "Yes, we also consider the quality of the map and amount of effort the creator(s) of the map took to make it. Generally, maps that are both good and hard to golden will most certainly get into the list. But maps that are hard and have bizarre design decisions or just aimed to be “joke” maps might get rejected. ",
  },
  {
    question: "What do I do if the map has no golden berry?",
    answer:
      "In this case you can use debug console (press ~ to open it and to close it) and type the give_golden command to get a golden berry. Alternatively, you can add a golden berry in Ahorn or Loenn (map editors). Make sure that the golden is close to the spawn and isn't directly in the way so one will need more movement to avoid it than to grab it in a non-golden run.",
  },
  {
    question: "Why are some maps easier than rule requirements?",
    answer:
      "Some maps that are not satisfying the difficulty criteria may be added for various reasons, at the discretion of the Modded Golden Team. For example, if a map is less than 3 screens but is a part of a collab with all other maps satisfying the criteria.",
  },
  {
    question: "Are demodash buttons/multiple jump binds allowed?",
    answer:
      "Demodash buttons and multiple jump binds are allowed. The same goes for any combination of inputs that can be mapped on the same key/button, but external macros which press multiple inputs on different frames are not allowed.",
  },
  {
    question: "Are pause buffers allowed?",
    answer:
      "For pause buffers, you can pause the game but if pause was used too aggressively or distinctly used to frame advance (pause/unpause to progress frame by frame), a note may be put into the cell with the golden clear. A run that abuses pause buffering too much might get rejected.",
  },
  {
    question: "What about spinner stunning?",
    answer:
      "Due to its difficulty and lack of golden viability, spinner stunning is allowed (pausing frame perfectly multiple times to keep spinners/lightning unloaded). However, deloading spinners by waiting 118+ hours is not allowed.",
  },
  {
    question: "What is the criteria for getting a full clear?",
    answer:
      "Maps can have the following optional collectibles that may or may not be obtained in a golden run: Heart, cassette, red berries, and non-red berries such as moon, dashless, or custom berries. Full clear runs generally require getting all optional collectibles, unless a collectible significantly changes the nature of the run, such as the winged golden strawberry in 1A. In that case, the collectible is considered as a special berry, and runs which collect it will gain the [SB] tag.\n" +
      "Examples of some maps that have an optional special berry are: A Christmas Night by JaThePlayer, Starship Ruins from Winter Collab and Into The Jungle chapter 1a.\n" +
      "The example when a special berry is required is Rite of the Jungle, the run that doesn't get the berry can't be submitted to the list.",
  },
  {
    question: "Why are some maps ineligible for full clear runs?",
    answer:
      "Some maps have collectibles which are not optional, such as strawberries in Hell Gym. For other maps, the collectibles do not add any extra challenge to the run, and therefore collecting them in a full clear run is not considered to be different from a standard run. For example, the moon berry in Path of D-espair or the cassette in Void Side.",
  },
  {
    question: "Why do some map names include [Full Clear]?",
    answer:
      "This means that a Full Clear is required to be entered into the list, and a normal clear will be rejected. There's a note attached to each of these maps that explains exactly what is needed in the run and why. These extra requirements are added either because a map is too easy to be on the Standard List without them (Cheyenne, Aibohphobia), or because the extra challenge means it should be on the Hard List (Hakoniwa Adventure, X-Side). ",
  },
  {
    question: "What is the Top Golden List Rankings?",
    answer:
      "The Top Golden List Rankings is a list of the hardest golden strawberry clears, where the minimum requirement to get on the list is to be harder than 'Hell Trio' from vanilla, which are the B-Side golden strawberries of chapters 6, 7, and 8. These are ordered by tier, so each color represents a different tier, and the higher up on the list means the harder it is. Please note that these are all decided subjectively by people with experience on the goldens, so these won't be perfectly accurate, and shouldn't be treated as such. The fewer people with the golden the more possible variance there is, so less popular goldens are more likely to be more inaccurate. It's intended to be our best estimate based on what the people who have done the goldens so far have said, so they're subject to change if and when more people do them. People generally try to base off a few things: their total playtime/experience with the game at the time of the golden, how much time they took on the map individually, and a more subjective analysis of the map's length, difficulty distribution, and gameplay consistency, among other things.",
  },
  {
    question: "Why do some entry counters have bolded font and are different color?",
    answer:
      "If you see a bolded font on entry counter this means that this golden/silver berry is harder than base game goldens (other than Farewell). The color represents their difficulty corresponding to Top Golden List. Note that Subtier colors aren't used for goldens/silvers that belong to Tiers 3, 2 and 1.",
  },
];

export const Rules = {
  maps: {
    rules: [
      "The map and/or map pack must be published on Gamebanana.com, or alternatively uploaded to this archive.org item.",
      "The golden must pose some sort of challenge or difficulty, even if small (around the same difficulty as 1A). The map also must be at least 3 gameplay screens (or segments) long.",
      "The map itself must not contain inappropriate visual or sound content, or any NSFW content.",
    ],
  },
  goldens: {
    rules: [
      "Must have video that shows the whole completion from start to finish of the run. The video must be permanent and published somewhere where it can be watched (YouTube, Twitch, etc).",
      "Usage of any gameplay affecting features is banned. These include but aren't limited to: Assist mode, Variant mode, Extended Variant mod, High Frame Rate Mod, etc. Debug is also banned unless it's used to get a golden on a map that doesn't have one by default (you may only use the give_golden command on the first screen of the map).",
      "Show the endscreen if one exists in the map. If it doesn't, show the journal right after the run.",
      "You must have raw recording of the run before it's verified, for Tier 3 and harder entries it's desirable to upload the raw recording together with the run itself.",
    ],
    recommendations: [
      "Don't use features that significantly affect the visual part of the run (e. g. simplified graphics feature from CelesteTAS).",
      "Don't use mods that can give you some important information that you normally don't have access to (such as stamina meter or input history).",
      "Disable screenshake and turn photosensitive mode on.",
      "Use chapter timer or file timer.",
      "Use an input display. Make sure it's not minimized as some of them (like NohBoard) are known for not working in this case, make sure it's properly shown in the video before every session.",
      "Put the link to the map in description of the video.",
      "For video compilations with multiple maps, put a time stamp for each map.",
      "For Spring Collab 2020 or similar map packs, submit one video for each lobby and/or Heart Side golden for easier and faster verification.",
      "Sharing your progress publicly (via official Celeste Discord server or Celeste Modded Done Deathless Discord server) or otherwise documenting it somewhere helps credibility.",
      "Using pause buffering might result in putting a note on a golden clear, or rejecting a golden clear, depending on how aggressively pause was utilized in a run.",
    ],
    info: [
      "When submitting a golden clear for a map that is already in the list, make sure that it follows all the rules for golden clear submissions. When submitting a golden clear for a map that is not in the list yet, make sure that the map follows the rules for maps as well as golden clear submission rules.",
      "There might be more rules for both golden clear submissions and maps that we didn't consider, so adding a golden clear or a map may be decided on a case by case basis.",
      "If a map pack has too many maps, then it may be listed in a separate page. For some map packs, all maps are tracked in a single cell and require a compilation video (you can also provide a link to the playlist if you have difficulties with making a single video).",
      "If the run doesn't follow some of the main rules, it might still get verified if it meets sufficient amount of recommendations to prove beyond any doubt that it's legit.",
      "A map may not be added to the list if a significant part of it resembles another map, both custom or from base game.",
    ],
  },
  fullgame: {
    preface: [
      "Those are challenge runs that involve completing multiple maps (3 or more, runs that involve 2 maps can be accepted on case by case basis) in a row without dying. Generally, they resemble one of the following (including but not limited to):",
      "All A-Sides of the map pack without dying (All A-Sides Deathless) / All B-Sides of the map pack without dying (All B-Sides Deathless) / All C-Sides of the map pack without dying (All C-Sides Deathless);",
      "All the A-Sides (or B-Sides/C-Sides/etc) of the map pack with all red berries/all collectibles without dying (All Red Berries deathless, All Full Clears Deathless);",
      "Completing one lobby without dying, if the map pack uses lobby system (Lobby Deathless)",
      "All maps of the map pack without dying (All Chapters Deathless);",
      "All maps + all red berries/all collectibles of the map pack without dying (All Red Berries deathless, 100% Deathless)",
      "For full game runs there are two ways to make a verifiable run:",
      "Create a new file and complete the run. Some runs may require cheat mode to access certain maps, but if cheat mode isn't mentioned then it isn't allowed for the run.",
      "Get the golden berry on every map that's required for the run, without creating a new file. Some runs may only be possible to complete from existing file (e. g. Glyph Void-Side Moon Berry).",
    ],
    rules: [
      "Must have a video that shows the run from creating a new file to completing the final chapter of the run. If you play from existing file, you must show chapter select screen of the first chapter of the run.",
      "If you play from existing file, you must follow the order of chapters that would only be possible from a newly created save. Keep in mind heart gates and other similar measures that limit options of what chapters you can play at any moment.",
      'You are not allowed to use Return to Map (Restart Chapter) option in order to avoid death. This also includes cases when you are on "safe ground" but can\'t proceed and finish a map by any means.',
      "Using more than one save file in one run is not allowed.",
      "If the run has forced deaths, you must not have more deaths than the minimum it takes to progress (for example, dying 2 times to one death warp isn't allowed if only 1 death is enough to progress).",
      "Runs must be done in one play session.",
      "Layout must not cover essential parts of the screen: timer, total berry counter in top left, berry tracker at the bottom, and save icon in bottom right.",
      "Have Full File Timer enabled.",
    ],
    notes: [
      "Refrain from long breaks if you're on menu (AFK during gameplay is acceptable but such breaks may cause suspicion if they are too long). 	",
      "Using hardcore mod isn't required.	",
      "Collecting golden/silver berries is highly recommended if you're playing not from a new file.	",
      "Full game run that doesn't get golden/silver berries may be submitted as individial golden/silver entries in other tabs, unless the map has gameplay exclusive for having a golden/silver berry (golden room, golden blocks etc).	",
      "If some of the recommendations aren't followed, run still may get verified if enough additional proof is provided.	",
    ],
  },
};
