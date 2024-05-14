<?php

DEFINE("ADMIN_EMAIL", "admin@domain.com");
DEFINE("NOREPLY_EMAIL", "noreply@goldberries.net");
DEFINE("DB_STRING", "host=localhost dbname=" . getenv("GB_DBNAME") . " user=" . getenv("GB_DBUSER") . " password=" . getenv("GB_DBPASS"));
DEFINE("SUGGESTION_BOX_WEBHOOK_URL", getenv("SUGGESTION_BOX_WEBHOOK_URL"));
DEFINE("PYTHON_COMMAND", getenv("PYTHON_COMMAND"));
DEFINE("WKHTMLTOIMAGE_PATH", getenv("WKHTMLTOIMAGE_PATH")); //false if not set

if (getenv('DEBUG') === 'true') {
  DEFINE("BASE_URL", "http://localhost:3000");
  DEFINE("BASE_URL_API", "http://localhost/api");
  DEFINE("REGISTER_URL", "http://localhost:3000/register");
} else {
  DEFINE("BASE_URL", "https://goldberries.net");
  DEFINE("BASE_URL_API", "https://goldberries.net/api");
  DEFINE("REGISTER_URL", "https://goldberries.net/register");
}