<?php

DEFINE("ADMIN_EMAIL", "admin@domain.com");
DEFINE("NOREPLY_EMAIL", "noreply@goldberries.net");
DEFINE("DB_STRING", "host=localhost port=" . getenv("GB_DBPORT") . " dbname=" . getenv("GB_DBNAME") . " user=" . getenv("GB_DBUSER") . " password=" . getenv("GB_DBPASS"));
DEFINE("SUGGESTION_BOX_WEBHOOK_URL", getenv("SUGGESTION_BOX_WEBHOOK_URL"));
DEFINE("CHANGELOG_WEBHOOK_URL", getenv("CHANGELOG_WEBHOOK_URL"));
DEFINE("NOTIFICATIONS_WEBHOOK_URL", getenv("NOTIFICATIONS_WEBHOOK_URL"));
DEFINE("PYTHON_COMMAND", getenv("PYTHON_COMMAND"));
DEFINE("WKHTMLTOIMAGE_PATH", getenv("WKHTMLTOIMAGE_PATH")); //false if not set

//Some difficulty details being used in the backend
$TRIVIAL_ID = 20;
$UNDETERMINED_ID = 19;

$LOW_TIER_0_SORT = 17;
$LOW_TIER_3_SORT = 8;
$STANDARD_SORT_START = 1;
$STANDARD_SORT_END = 3;
$TIERED_SORT_START = 4;
$MAX_SORT = 19;
$RAW_SESSION_REQUIRED_SORT = $LOW_TIER_3_SORT;
//=================================================


if (getenv('DEBUG') === 'true') {
  DEFINE("BASE_URL", "http://localhost:3000");
  DEFINE("BASE_URL_API", "http://localhost/api");
  DEFINE("REGISTER_URL", "http://localhost:3000/register");
} else {
  DEFINE("BASE_URL", "https://goldberries.net");
  DEFINE("BASE_URL_API", "https://goldberries.net/api");
  DEFINE("REGISTER_URL", "https://goldberries.net/register");
}