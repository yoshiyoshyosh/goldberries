<?php

require_once("head_html.php");

?>

<body>
<header>
	<img src="assets/header.png" alt="goldberries header image"/>

	<nav>
		<ul>
			<li><a href="index.php">Home</a></li>
			<li><a href="about.php">About</a></li>
			<li><a href="rules.php">Rules &amp; Info</a></li>
			<li><a href="modded.php">Modded List</a></li>
			<li><a href="farewell.php">Farewell List</a></li>
			<li><a href="submit.php">Submit</a></li>
			<?php if ($user) { ?>
			<li><a href="admin.php">Admin Portal</a></li>
			<?php } ?>
		</ul>
	</nav>
</header>
