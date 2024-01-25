# Frontend Pages

## List Pages

### `/top-golden-list`

- Purpose: Display all T7+ challenges grouped by tiers and subtiers (+ undetermined maps)
- Data:
  - (Hierarchy) all tiers -> subtiers -> challenges -> submissions
- Display:
  - For each entry: campaign icon (if available), campaign name, map name, challenge objective suffix (if available), challenge clear type, number of submissions, link to the first clear of the challenge
- Interactions:
  - Visibility toggles (full game challenges, arbitrary challenges)
  - Links to: Campaign, Map
- Alt Views: none

- ### `/golden-list/<type>`

  - Purpose: Display all submissions of a type (`hard`, `standard`, `arbitrary`, `archived`) grouped by campaigns, maps and challenges

- Data:

  - (Hierarchy) all campaigns -> maps -> challenges -> submissions

- Display:

  - For each entry: campaign name (& icon if available), map name, challenge objective suffix (if available), challenge clear type, submissions list
  - Submissions list displays: player name, proof url, c/fc

- Interactions:

  - Links to: Campaign, Map, Challenge, Submission

- Alt Views: none

## Individual Pages

### `/campaign/<id>`

- Purpose: Display a campaigns submissions, grouped by lobby, sub-difficulty, maps and challenges 
- Data:
  - (Hierarchy) campaign -> maps -> challenges -> submissions
- Display:
  - Campaign details somewhere (name, url, gamebanana artwork?, icon?, date_added, gamebanana authors name)
  - Submissions in the familiar format known from the spreadsheet
  - Every campaign has 2 properties to group the maps: `sort_major` and `sort_minor`. A `major` sort property is what is commonly referred to as "Lobby". A `minor` sort property is e.g. the colors in SJ "green", "yellow", "red", "cracked". On top of that can maps set a `sort_order` value to mimic journal sort order. 
  - If all sort value are identical for multiple maps, they will be sorted alphabetically.
- Interactions:
  - Breadcrumb navigation: `/campaign-name`
  - Links to: Maps, Challenges, Submissions
- Alt Views: Some way for verifiers to modify the campaign details. Maybe an edit button that opens a modal to edit the campaign?

### `/map/<id>`

- Purpose: List all submissions in a map, grouped by challenges
- Data: map -> challenges -> submissions
- Display:
  - Map details somewhere (name, url and gamebanana authors name (if null, take from campaign), date_added, has_fc, is_rejected, is_archived)
  - List all challenges + submissions
- Interactions:
  - Breadcrumb navigation: `/campaign-name/map-name`
  - Links to: Challenges, Submissions
- Alt Views: Edit modal for verifiers

### `/challenge/<id>`

- Purpose: List all submissions in a challenge
- Data: challenge -> submissions
- Display:
  - Challenge details somewhere (map name, objective name & description, difficulty name + subtier, date_created, requires_fc/has_fc, is_arbitrary (if null, take from objective))
  - List all submissions + suggested difficulty opinions
- Interactions: 
  - Breadcrumb navigation: `/campaign-name/map-name/challenge-<id>`
  - Links to: Submissions
- Alt Views: Edit modal for verifiers

### `/submission/<id>`

- Purpose: Display all data of a single submission
- Data: submission
- Display:
  - Campaign/Map/Challenge details somewhere
  - Submission details somewhere somehow
- Interactions:
  - Breadcrumb navigation: `/campaign-name/map-name/challenge-<id>/submission-<id>`
- Alt Views: Edit modal for verifiers (all properties) and submitee (pre verification: [raw session url, suggested difficulty, notes], post verification: [suggested difficulty, notes])

### `/player/<id>/<view>`

- Purpose: Show all of a players associated submissions.
- Data: campaigns -> maps -> challenges -> submissions (filtered for the player)
- Display:
  - Golden List, but only with the players submissions
  - Top Golden List, but only with the players submissions. Replace the submission count with suggested difficulty for a challenge
  - Cool stats or smth idk
- Alt Views: Edit modal for verifiers (player name)

## User Pages

### `/login/<redirect>`

- Purpose: Login the user via email or discord oauth. Potentially redirect the user to a different page after login
- Alt Views: Disabled if already logged in

### `/register`

- Purpose:
  - Register via email. Redirects to "email confirmation notice" page after registration
    - After email has been confirmed: Redirect to `/claim-player`
  - Register via discord. Exactly the same as login via discord, except it redirects to `/claim-player` after login
- Alt Views: `/register/<code>` email verification page. will be directly linked from the confirm email

### `/my-account/<tab>`

- Purpose: Manage own account / player
- Interactions:
  - Manage account
    - Add email & password when not set yet
    - Link discord account when not set yet
    - Change email & password
  - Manage their `Player`
    - Change their own name (might need some limitations)
- Data: account -> player

### `/claim-player`

- Purpose: Manage the initial player claiming to properly set up the account of a user. All actions that require a logged in user also require a player claim to have been made!
- Display: 
  - [player_id == null && claimed_player_id == null]:
    - Show mask to create new player for yourself, or claim an existing one
  - [player_id == null && claimed_player_id != null]: Show message like `Please contact a team member (list of all team members) and provide evidence for your claim!`
  - [player_id exists]: Show simple message like `Your account is fully set up. No more action is required from you!`
- Interactions:
  - Create new player: Type in a unique name (checked against all existing names). Click `Create Player`
  - Claim an existing player: Search for a player name, then click `Claim`

### `/submit`

- Purpose: Create a submission for a challenge
- Data: 
- Interactions:
  - Challenge select (via campaign -> map -> challenge)
  - Form for submission details
- Alt Views:
  - For verifiers, add a `Player` select that is by default set to the verifier's Player's name

## Verifier Pages

### `/manage/logs`

- Purpose: See logs

### `/manage/submission-queue`

- Purpose: Show all submissions currently up for verification
- Data: submissions
- Display:
  - Show one submission at a time. All the details displayed, video embedded if possible.
  - Side-Drawer with the submissions in queue (paginated, ~15 per page)
- Interactions: 
  - Able to modify all the submissions values
  - 3 buttons: `Verify`, `Reject` and `Skip` (go to next submission without changing the current one)
  - Links to Campaign, Map, Challenge (maybe via Breadcrumbs)

### `/manage/accounts`

- Purpose: Manage account properties for all accounts
- Display:
  - All accounts & player_names (if available) in a table
- Interactions:
  - Button to open account edit modal
  - Account edit modal: verifiers [email, new_password, unlink discord id, player_id & claimed_player_id, is_suspended & suspension_reason, see email verification status], admins [all verifier stuff + is_verifier, is_admin]

### `/manage/players`

- Purpose: Shows all claimed player, claim requests and unclaimed players
- Display:
  - 3 lists/tabs: Claimed Players, Claim Requests and Unclaimed Players
- Interactions:
  - For claimed players: Open player edit modal (for renaming the player)
  - For claim requests: Buttons `Accept` (moves `claimed_player_id` to `player_id`) and `Reject` (clears `claimed_player_id`)
  - For unclaimed players: Open player edit modal (for renaming the player)
  - Search bar to filter all lists