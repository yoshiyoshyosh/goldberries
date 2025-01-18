# Traffic Logging System

## Setup

### Cron Job

Cron job executes every 15 minutes: `crontab -e` -> `*/15 * * * * /var/www/goldberries.net/api/traffic/log.sh`.  
Make sure the cron job has the permissions to access the log file and the execute the shell script.

### 2. Shell Script

This pipes all necessary environment variables into the php script. Place in `/var/www/goldberries.net/api/traffic/`

```
cd /var/www/goldberries.net/api/traffic
export GB_DBPORT=<port> && export GB_DBNAME=<name> && export GB_DBUSER=<user> && export GB_DBPASS=<password> && export TRAFFIC_FILE=/var/log/apache2/goldberries.net_traffic.log && php log_traffic.php
```

### 3. PHP Script

Thats just the file from `/api/admin/log_traffic.php`

## Stats

Include a start/end timestamp for all endpoints.  
Stuff to calculate:

- Global Stats
  - Total (new) requests (D/I)
  - Avg. Serve Time (D/I)
  - Pie chart of all user agents used (D/I)
  - Pie chart of mobile vs. desktop usage (D/I)
  - Pie chart of all referrers (D/I)
  - List of most requested pages (D)
  - Last X requests (D)
- Per-Module Stats
  - Generic
    - Total requests to module (D/I)
    - Avg. Serve Time (D/I)
    - Most common referrers to module (D/I)
    - Most common pages this module is referring (D/I)
    - List of most requested pages (D)
    - Last X requests (D)
  - Search
    - Most searched for terms (D)
  - Campaign/Map
    - Most requested campaign/map (D)
  - Player
    - Most viewed profile (D)
  - Other modules:
    - Suggestions
    - Top Golden List
    - Change
    - Translation Files
    - Submission Embeds
    - Difficulty

2 axis along which we display data:

- Time boundaries
  - Pre-defined: Last 24h, Last 1m, All Time
  - Custom boundaries: Select start/end dates manually
  - Result: start/end dates, controlled by the frontend
- Data intervals
  - Minutely, Hourly, Daily, Monthly, All

2 modes of display:

- Simple view
  - Select `All, 1d, 1m, 1y`
  - Date & interval ranges automatically set from this
- Advanced view
  - Select start/end date and interval individually

All components get fed the start/end date + data interval. If they want to honor it or not is up to the component. Components marked as (D) respect the date, (I) respect the interval, (X) respect neither.
