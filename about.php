<?php
require_once("bootstrap.inc.php");

require_once("include_site/header.php");

$toc = array(
	'FAQ' => array(
		'.' => "#faq",
		'What is the Top Golden List?' => '#faq-what-is-top-list',
		'Why no map rankings? (Sub)tiers?' => '#faq-why-no-map-ranks',
		'Why no player rankings?' => '#faq-why-no-player-ranks',
	),
	'Credits' => '#credits',
	'Contact' => '#contact',
);
?>

<main>
	<header>
		<h1 id="about">About the Site</h1>
		<?php generate_toc($toc) ?>
	</header>
	<hr/>
	<p>This site is meant serve as a successor to the <a href="https://docs.google.com/spreadsheets/d/1v0yhceinMGr5alNekOxEkYCxXcYUsbtzMRVMezxbcVY/edit">Custom Golden Map Strawberry List</a> and <a href="https://docs.google.com/spreadsheets/d/1FesTb6qkgMz-dCn7YdioRydToWSQNTg1axFEIHU4FF8/edit#gid=0">Farewell Golden Collectors List</a> as a new archive for deathless achievements in Farewell and Modded Celeste. The main goal of this site is to archive and maintain all the recorded golden clears of both Farewell from vanilla Celeste and modded maps and to hopefully to encourage people to go for golden strawberries themselves.</p>
	<?php toc_next_heading($toc) ?>
		<?php toc_next_heading($toc) ?>
		<p>The Top Golden List Rankings is a list of the hardest golden strawberry clears, where the minimum requirement to get on the list is to be harder than "Hell Trio" from vanilla, which are the B-Side golden strawberries of chapters 6, 7, and 8.</p>
		<?php toc_next_heading($toc) ?>
		<p>Maps on the top golden list are ordered by tier. Each color represents a different tier, and the lower the tier number, the harder it is. Please note that these are all decided subjectively by people with experience on the goldens, so these won't be perfectly accurate, and shouldn't be treated as such. The subjective nature of difficulty is also why these maps are not ranked individually, in that different people with different skillsets will take wildly different times to complete challenge. As such, tiers are meant to be a "general category" of difficulty for people to estimate how much time it would take them to complete a challenge. Tiers 3 through 0 have subtiers, or difficulty categorizations more fine than that of tiers, simply due to the major discrepancy of difficulty that comes with harder maps that would be unviable to separate into separate tiers.</p>
		<?php toc_next_heading($toc) ?>
		<p>There are no player rankings on this site in a bid to highlight individual accomplishment. The purpose of this site is to archive recordings of achievements, not to rank people against each other. If, however, you desire to do such a thing, we have an <a href="/api">API</a> that you can use for whatever rankings you would like to do.</p>
	<?php toc_next_heading($toc) ?>
		<p>A big thank you to everyone making the list and website possible. This includes:</p>
		<ul>
			<li><p>The modded golden team, who have tirelessly collected and organized golden strawberries and deathless challenges long before this site's existence. These people include Kriog16, isabelle, Parrot Dash, cattastic212, Yoshi, Ezel, Revi64, Zerex, Natalie, paradox_bones, Create, Habbedaz, and DeathKontrol.</p></li>
			<li><p>The website development team, including Yoshi, viddie, Reinhardt, and anyone whom has contributed to the repository.</p></li>
			<li><p>Maddy Thorson and the rest of the EXOK Team, for creating a beloved game for all.</p></li>
			<li><p>Celeste map makers and modders, for providing endless hours of fun and community-made maps and mods to be enjoyed by all.</p></li>
		</ul>
	<?php toc_next_heading($toc) ?>
	<p>The most active and consistent way to contact the team for matters related to the list is Discord. This can be done via <a href="https://discord.gg/celeste">the official Celeste Discord</a> or <a href="https://discord.gg/GeJvmMycaC">the list specific Discord</a>.</p>
	<p>Of course, having Discord as the only means of contact is undesirable to some. You may also contact one of the list members with <a href="mailto:goldberries@riseup.net">this email address</a> where further communication can be established.</p>
</main>

<?php
require_once("include_site/footer.php");
?>
