<?php

DEFINE("ADMIN_EMAIL", "admin@domain.com");
DEFINE("NOREPLY_EMAIL", "noreply@goldberries.net");
DEFINE("DB_STRING", "host=localhost dbname=" . getenv("GB_DBNAME") . " user=" . getenv("GB_DBUSER") . " password=" . getenv("GB_DBPASS"));

if (getenv('DEBUG') === 'true') {
  DEFINE("BASE_URL", "http://localhost:3000");
  DEFINE("BASE_URL_API", "http://localhost/api");
  DEFINE("REGISTER_URL", "http://localhost:3000/register");
} else {
  DEFINE("BASE_URL", "https://goldberries.net");
  DEFINE("BASE_URL_API", "https://goldberries.net/api");
  DEFINE("REGISTER_URL", "https://goldberries.net/register");
}