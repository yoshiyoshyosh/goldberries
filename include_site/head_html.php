<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8"/>
	<link href="https://goldberries.net" rel="canonical"/>
	<?php
		if (isset($CSS) && is_array($CSS)) {
			foreach ($CSS as &$val) {
				echo '<link rel="stylesheet" href="/style/' . $val . '.css">';
			}
		} else {
			echo '<link rel="stylesheet" href="/style/main.css">';
		}
	?>

	<title><?= escape_html($TITLE ? $TITLE : "goldberries -- impress your friends") ?></title>
</head>
