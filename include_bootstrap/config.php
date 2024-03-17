<?php

DEFINE("ADMIN_EMAIL", "admin@domain.com");
DEFINE("DB_STRING", "host=localhost dbname=" . getenv("GB_DBNAME") . " user=" . getenv("GB_DBUSER") . " password=" . getenv("GB_DBPASS"));

if (getenv('DEBUG') === 'true') {
  DEFINE("BASE_URL", "http://localhost:3000");
  DEFINE("BASE_URL_API", "http://localhost/api");
} else {
  DEFINE("BASE_URL", "https://www.domain.com");
  DEFINE("BASE_URL_API", "https://www.domain.com/api");
}