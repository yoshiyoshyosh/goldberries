# goldberries.net

## Purpose

Over the years, the deathless community has grown to incredible extends with over 30 **thousand** submissions of various goldens, silvers and other challenges! Managing such an amount of data over Google Sheets _works_, but it's not nice, and even smaller changes to the lists structure are often a headache to implement for the team.

With `goldberries.net` this is supposed to change. `goldberries.net` is going to be the replacement for the [Custom Map Golden Strawberry List](https://docs.google.com/spreadsheets/d/1v0yhceinMGr5alNekOxEkYCxXcYUsbtzMRVMezxbcVY/edit?pli=1#gid=475305335), so instead of a somewhat organized Google Sheet document there will be:

- A proper database to store all of the submissions (and many more things too!)
- A proper API (opening up the golden list to 3rd party projects)
- A proper website (with many things to improve everyones lives, let it be submitting runs, verifying runs, managing the vast landscapes of data and more)

## Progress

Things we have completed, or that are currently in the works:

- Database:
  - Model ✅
  - Build Scripts for Postgres ✅
  - Data Migration Pipeline (Google Sheets -> Database) 🔧
- PHP Api:
  - User Authentication (via Email & Password, or Discord) ✅
  - General Purpose Endpoints (to get/add/edit/remove single objects) 🔧
  - Combined Endpoints (for e.g. the Top Golden List, or Hard Golden List) 🔧
- Frontend ❌

## You Can Help

You have skills in web development and would like to help us? Join the [Celeste Modded Done Deathless Discord Server](https://discord.gg/GeJvmMycaC) and check out the **#goldberries.net** channel. (There is a thread in that channel where everyone can chat). We are currently looking especially for anyone capable of frontend web design!

Even if you don't have any dev skills, be sure to check out that channel. As soon as we start development on the frontend it will be great to have community feedback quickly available on bigger design choices!

## Project Setup

### Test Environment

- Database (model is on branch `php-api`)
  - Run the `goldberries.sql` script from `documentation/models/database-build-scripts`
  - Run the data import scripts in the following order:
    - `example-data/Difficulty.sql`
    - `example-data/Objective.sql`
    - `migrated-data/sql_campaign.sql`
    - `migrated-data/sql_maps.sql`
    - `migrated-data/sql_player.sql`
    - `migrated-data/sql_chals.sql`
    - `migrated-data/sql_subs.sql`
  - If you change the datamodel in a way that needs a table to be truncated, be sure to reset the sequences or else the backend will run into 500 errors. Safest is always to go through the whole data import from scratch again
- Backend (most recent changes on branch `php-api`)
  - Postgres server running on localhost
  - Following PHP extension enabled: curl, gd, pgsql
  - Webserver needs these environment variables set:
    - `GB_DBPORT <port>` (5432 for default postgres port)
    - `GB_DBNAME <database>`
    - `GB_DBUSER <user>`
    - `GB_DBPASS <password>`
    - `DEBUG true`
  - Optional additional environment variables:
    - `DISCORD_CLIENT_ID <id>`
    - `DISCORD_CLIENT_SECRET <secret>` (these 2 to allow login with discord. you'll have to setup your own discord developer app for this tho)
    - `SUGGESTION_BOX_WEBHOOK_URL <url>` (for allowing the server to send webhook messages on certain events)
    - `PYTHON_COMMAND python` (if you want to use the embed generation via wkhtmltoimage, which you will have to setup first. if this variable is omitted, a default embed generation will generate a test image instead)
    - `WKHTMLTOIMAGE_PATH` (path to wkhtmltoimage.exe, if not on path)
- Frontend (most recent changes on branch `frontend-react`)
  - Setup the React project in `/frontend´
  - Adjust the environment variables in `.env` if either the React app or the backend is mounted to something non-default (e.g. React app is not running on `localhost:3000` or backend is not running on `localhost`)
