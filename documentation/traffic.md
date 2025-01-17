# Traffic Logging System

## Setup

### Cron Job

Cron job executes every 15 minutes: `crontab -e` -> `*/15 * * * * /var/www/goldberries.net/api/admin/log.sh`.  
Make sure the cron job has the permissions to access the log file and the execute the shell script.

### 2. Shell Script

This pipes all necessary environment variables into the php script. Place in `/var/www/goldberries.net/api/admin/`

```
cd /var/www/goldberries.net/api/admin
export GB_DBPORT=<port> && export GB_DBNAME=<name> && export GB_DBUSER=<user> && export GB_DBPASS=<password> && export TRAFFIC_FILE=/var/log/apache2/goldberries.net_traffic.log && php log_traffic.php
```

### 3. PHP Script

Thats just the file from `/api/admin/log_traffic.php`

## Stats

Include a start/end timestamp for all endpoints.  
Stuff to calculate:

- Global Stats
  - Pie chart of all user agents used
  - Pie chart of mobile vs. desktop usage
  - Pie chart of all referrers
  - List of most requested pages
  - Avg. Serve Time
- Over Time Stats (Ranges: 1d (hourly), 1m (daily), All Time (monthly))
  - Total requests
  - Total new requests (referrer IS NULL)
  - Total requests per-module (in/out)
- Per-Module Stats
  - Generic
    - Total requests to module
    - Avg. Serve Time
    - Most common referrers to module
    - Most common pages this module is referring
    - Last X requests
  - Search
    - Most searched for terms
  - Campaign/Map
    - Most requested campaign/map
  - Player
    - Most viewed profile
  - Other modules:
    - Suggestions
    - Top Golden List
    - Change
    - Translation Files
    - Submission Embeds
    - Difficulty
