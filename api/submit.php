<?php

require("../bootstrap.inc.php");

$query = "SELECT * FROM CAMPAIGN;";

$result = pg_query($DB, $query);
if (!$result) {
	echo "bitch";
	exit;
}

while ($row = pg_fetch_row($result)) {
	echo "id: $row[0] | name: $row[1]";
	echo "<br>\n";
}
?>
