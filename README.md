# goldberries.net

## Purpose

Over the years, the deathless community has grown to incredible extends with over 30 **thousand** submissions of various goldens, silver and other challenges! Managing such an amount of data over Google Sheets _works_, but it's not nice, and even smaller changes to the lists structure are often a headache to implement for the team.

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

Even if you don't have any dev skills, be sure to check out that channel. When we eventually start development on the frontend it will be great to have community feedback quickly available on bigger design choices!
