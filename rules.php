<?php
require_once("bootstrap.inc.php");

require_once("include_site/header.php");

$toc = array(
	'Rules for Maps' => '#rules-maps',
	'Rules for All Submissions' => array(
		'.' => '#rules-submissions-all',
		'Additional Rules for Full Game Submissions' => '#rules-submissions-fullgame',
	),
	'General Recommendations' => '#general-recs',
	'Allowed and Recommended Mods' => '#recommended-mods',
	'FAQ' => array (
		'.' => '#faq',
		'What is the criteria for getting a full clear?' => '#faq-fc-criteria',
		'Why are some maps ineligible for full clear runs?' => '#faq-fc-map-ineligible',
		'Why do some map names include [Full Clear]?' => '#faq-fc-map-names',
	),
);
?>

<main>
	<header>
		<h1>Rules and Info</h1>
		<?php generate_toc($toc) ?>
	</header>

	<hr/>

	<p>This page exists mostly as a formalization of rules and edge cases for said rules. The long and short of it all is what you'd expect: Don't cheat, don't use gameplay-altering mods, all the like. However, if you are confused about if something may be allowed or want some recommendations for doing deathless challenges, please read the respective section.</p>

	<?php toc_next_heading($toc) ?>
	<ul>
		<li><p>The map or map pack <em>must</em> be uploaded to <a href="https://gamebanana.com/games/6460">GameBanana</a>. If a map was previously on GameBanana but it was taken down afterwards, it will be uploaded to <a href="https://archive.org/details/celeste-golden-list-removed-from-gb-maps">this archive.org item</a> unless the map creator specifically requests to remove its downloadability.</p></li>
		<li><p>The map or map pack <em>must</em> pose a non-trivial amount of difficulty, even if that difficulty may be very small. Maps with little to no ways to die will be rejected.</p></li>
		<li><p>The map or map pack <em>must</em> be at least three gameplay screens or checkpoints in length. This matches the shortest c-sides in the vanilla game.</p></li>
		<li><p>The map or map pack <em>must not</em> contain NSFW content.</p></li>
		<li><p>The map or map pack <em>is recommended to not</em> resemble a base game map or an existing custom map to a high degree. Unique map packs such as <a href="https://gamebanana.com/mods/150418">Etselec</a> or more thoughtful, usually more difficult edits such as <a href="https://www.youtube.com/watch?v=aYpean9AahU">Farewell^9</a> are acceptable, while maps such as <a href="https://gamebanana.com/mods/349586">1a Undefined</a> are likely to be rejected.</p></li>
		<li><p>The map or map pack <em>is recommended to not</em> be low-quality in nature. "Shitpost" or "meme" maps are fine, so long as there remains playable and generally-thought-out gameplay beneath it. Since this is vague, it's really decided more on a case by case basis, but if one would like a quick comparison: Maps like <a href="https://www.youtube.com/watch?v=MsScIP3ZqCM">Shitpost Summit</a> or <a href="https://www.youtube.com/watch?v=XODzWNSNKZk">The Decline</a> are fine, but maps like <a href="https://youtu.be/qRz5XC0P7MQ">frickyou</a> are not.</p></li>
	</ul>

	<?php toc_next_heading($toc) ?>
	<ul>
		<li><p>The submission video <em>must</em> be uploaded to a place that does not require "signing in" to view. The most popular sites for such videos are <a href="https://www.youtube.com/">YouTube</a>, <a href="https://www.twitch.tv/">Twitch</a>, <a href="https://www.bilibili.com/">bilibili</a>, and <a href="https://www.nicovideo.jp/">nicovideo</a>, but sites outside of these are perfectly fine to be submitted. A messaging service CDN (i.e. <code>cdn.discordapp.com</code> or similar) is not accepted for submissions.</p></li>
		<li><p>The submission video <em>must</em> show the complete achievement of the challenge, e.g. from obtaining the golden strawberry to when the golden strawberry collects. It is not necessary that one must stay alive after the completion of the challenge but before exiting the map (e.g. "Heart Deaths"). Note that a golden strawberry collecting may not always be the end of a challenge, such as a berry remaining in a full clear challenge, as is the case for <a href="https://youtu.be/c4VwQrNwGjE?t=235">Anubi Full Clear</a>. Exceptions to this are very rare and evaluated on a case-by-case basis, such as a livestream cutting out for a brief moment, so long as the circumstances and player are deemed trustworthy.</p></li>
		<li><p>Submissions <em>must</em> be done in one contiguous play session.</p></li>
		<li><p>Submissions <em>must not</em> make use of gameplay-altering mods, variants, or assist mode. Visual-altering mods and variants <em>may</em> be allowed on a case-by-case basis. See <a href="#recommended-mods">allowed and recommended mods</a> for more details.</p></li>
		<li><p>Submissions for challenges as or more difficult than <strong>Tier 3</strong> <em>must</em> have a recording of a full session. In the event that the submission was done near the beginning of the session, a request for a previous session recording may be asked.</p></li>
		<li><p>Submissions <em>are recommended to not</em> make use of "info mods" which give you information that you otherwise would not know during gameplay, such as input history, stamina bar, or CelesteTAS's info HUD. On challenges where these make little to no difference, submissions will be accepted without issue. On challenges where these may make some difference, but not enough to be exceedingly notable, submissions will be accepted, but with a note. On challenges where these make a big difference, such as subpixel-level alignment or stamina-heavy maps, submissions will likely be rejected.</p></li>
		<li><p>Submissions <em>must not</em> abuse the use of <i>pause buffering</i> to a degree that trivializes the difficulty of the challenge. Pause buffering can make tight inputs in a map extremely easy, and heavy use of it is grounds for rejection. Since this is vague, it's usually evaluated on a case-by-case basis, but for a quick comparison: Pause buffering <a href="https://youtu.be/rpSFgT29hK8?t=61">this one wallbounce in Aquatic Underground</a> is fine, whereas pause buffering <a href="https://www.youtube.com/watch?v=G-bmAvDaBtY">I Wanna Atone the Flower Golden</a> is grounds for rejection. Runs which use a non-rejectable amount of pause buffering will have a note placed on them.</p></li>
		<li><p>Submissions <em>must not</em> abuse the <i>long wait spinner deload glitch</i>. Submissions <em>may</em> utilize the technique known as <i>spinner stunning</i> due to its frame-perfect nature and general unviability for goldens. For more info on these techniques, check out <a href="https://youtu.be/UGQ5rXStKXg?t=64">this video</a>.</p></li>
		<li><p>If a map does not have a golden strawberry, one <em>is allowed</em> to use the console command <code>give_golden</code> to give themselves a golden strawberry. This command <em>must</em> be used in the <em>first</em> room of the map. Alternatively, one may use <a href="https://github.com/CelestialCartographers/Ahorn">Ahorn</a> or <a href="https://github.com/CelestialCartographers/Loenn">Lönn</a> to add a golden strawberry in the first room of the map.</p></li>
		<li><p>For golden strawberry (or other similar berry) submissions, the submission <em>does not have to</em> actually collect the berry so long as the run follows the same challenge requirements (A.K.A. a <i>deathless berryless</i> run). Runs where a golden strawberry is fundamentally different than a non-golden, such as a golden room, <em>will most likely not</em> be accepted in this manner. While of course discouraged and we urge submissions to collect the applicable berry, we also understand that sometimes things happen and people unexpectedly fluke, and we don't want that to take away from anyone's achievement. Deathless berryless submissions will be given a note.</p></li>
		<li><p>For golden strawberry (or other similar berry) submissions, submissions <em>may</em> edit the <em>end</em> of a map to add a golden collect trigger <em>if and only if</em> a golden collect trigger does not exist. If a crystal heart indicates the ending but doesn't kick the player out, editing it to kick the player out is fine. This will be evaluated on a case-by-case basis, as this is very rare.</p></li>
		<li><p>For golden strawberry (or other similar berry) submissions, submissions <em>are allowed to</em> die during <em>map intentional golden strawberry detachments</em> as many times as one would like. This does <em>not</em> apply to golden detachments made to fix an issue (such as in <a href="https://youtu.be/iJuGoYOPFt4?t=782">A Beautiful Meadow</a>) or unintentional golden detachments.</p></li>
	</ul>

	<?php toc_next_heading($toc) ?>
	<p>There are two types of "full game" submissions: ones that complete a relevant subset of all maps in a map pack (which will be referred to as <i>partial full game runs</i>), such as all c-sides deathless or beginner lobby deathless, and completely full game runs, such as all maps deathless or 100% deathless (which will be referred to as <i>complete full game runs</i>). Rules which apply to only a specific category of these will be indicated.</p>
	<ul>
		<li><p>The submission video <em>must</em> show the run in full. For a partial full game run, the video must start at or before the chapter select screen of the first map completed and end after completing the final map. For a complete full game run, the video must start at or before the file select screen and end after completing the final map.</p></li>
		<li><p>Submissions for complete full game runs <em>must</em> complete the maps as how they would be completed from a new save file. It is recommended to <em>always</em> use a new save file for complete full game runs and <em>not</em> use cheat mode as a result. Partial full game runs may complete the applicable maps in any order.</em>
		<li><p>Submissions <em>must not</em> use "Return to Map" or any similar option to cheat likely death or otherwise make a map easier. This includes instances where one is "softlocked" in a map by any means brought on by the player.</p></li>
		<li><p>Submissions <em>must not</em> utilize more than one save file.</p></li>
		<li><p>If the run has forced deaths (e.g. a Farewell-esque moon berry), runs <em>are allowed</em> to die in such instances, but <em>no more than the minimum required</em> to pass the section. Compare this to the previous note about individual level detachments</p></li>
		<li><p>Submissions <em>must</em> have the "File Timer" enabled, <em>not just</em> the chapter timer.</p></li>
		<li><p>Submissions <em>must not</em> have an overlay covering a large amount or essential parts of the screen. Essential parts include the timer, the total berry count in the top left, the pause menu berry tracker, the player, and the save icon in the bottom right.</p></li>
		<li><p>Submissions <em>are recommended to not</em> take long breaks on the menu or pause screen. It is more acceptable to take breaks while inside a map and not paused, though taking frequent breaks might raise suspicion and request for more proof.</p></li>
		<li><p>If a submission does not collect golden/silver berries, it <em>may</em> be submitted for individual map runs on the respective sheet if the challenge follows the same aforementioned rule about deathless berryless runs.</p></li>
	</ul>
	<p>Of course, some of these rules are not 100% set and carved in stone, and very rarely will exceptions be made for valid circumstances. Please do try your best to follow these rules and guidelines for submissions, though.</p>

	<?php toc_next_heading($toc) ?>
	<p>These aren't <em>exactly</em> rules that need to be followed, but they help in aiding proof strength, avoiding giving your submission a note, helping one complete a challenge, or is a general courteous decision for others.</p>
	<ul>
		<li><p>Using the chapter or file timer will help credibility, but it is not required for single-map submissions. Recall that file timer <em>is</em> required for full game submissions.</p></li>
		<li><p>Using an external input display, such as <a href="https://github.com/ThoNohT/NohBoard">NohBoard</a> for Windows, <a href="https://github.com/yoshiyoshyosh/kbdisplay">kbdisplay</a> for Linux (X11), or <a href="https://github.com/RoanH/KeysPerSecond">KeysPerSecond</a> for cross-platform, will help credibility.</p></li>
		<li><p>For video compilations with multiple maps, adding timestamps in the description or on the submission page will help greatly.</p></li>
		<li><p>For maps with lobbies and do not require a complete video, such as Strawberry Jam, putting all the lobby maps in one video would help ease on verifiers.</p></li>
		<li><p>Keep one or two full session runs on hand, especially for high tier goldens, in the event that a verifier requests more proof.</p></li>
	</ul>

	<?php toc_next_heading($toc) ?>
	<p>All mods listed here are allowed for submissions unless otherwise specified. Mods not listed here are also allowed for submissions unless they violate the gameplay altering mod rule or info gaining mod rule.</p>
	<ul>
		<li><p>The <em>only</em> gameplay-altering mod that is allowed is the <i>No Freeze Frames</i> variant in <a href="https://gamebanana.com/mods/53650">Extended Variants</a>. The rationale is that this mod does not fundamentally change the game as well as makes the game harder in most instances.</p></li>
		<li><p>For complete full game runs, using the <a href="https://gamebanana.com/mods/53679">hardcore mode</a> mod may help reset runs faster, but is not required. Hardcore mode will also allow goldens to spawn without needing cheat mode, which means the full game run may be submitted to individual maps without issue.</p></li>
		<li><p>The <a href="https://gamebanana.com/mods/363600">Golden QOL</a> mod is allowed for submissions. This mod gives players some helpful quality of life features, such as making the golden berry transparent, being able to place a persistent golden berry without using a map editor, or allowing one to start at the same room they died in a golden run.</p></li>
		<li><p>The <a href="https://gamebanana.com/tools/6597">Speedrun Tool</a> mod and <a href="https://gamebanana.com/tools/6715">CelesteTAS</a> mods can help finding strategies and setups for parts in a challenge. Do note, however, that utilizing any gameplay-altering of info-gaining features of these mods during a challenge is disallowed.</p></li>
		<li><p>Other mods frequently used for deathless challenges include <a href="https://gamebanana.com/mods/358978">Consistency Tracker</a> and <a href="https://gamebanana.com/mods/53681">DeathTracker</a>.</p></li>
	</ul>

	<?php toc_next_heading($toc) ?>
		<?php toc_next_heading($toc) ?>
		<p>Maps can have the following optional collectibles that may or may not be obtained in a golden run: Heart, cassette, red berries, and non-red berries such as moon, dashless, or custom berries. Full clear runs generally require getting all optional collectibles, unless a collectible significantly changes the nature of the run, such as the winged golden strawberry in 1A. In that case, the collectible is considered as a special berry, and runs which collect it will gain the [SB] tag.</p>
		<?php toc_next_heading($toc) ?>
		<p>Some maps have collectibles which are not optional, such as the cassette in 8A or the strawberries in Hell Gym. For other maps, the collectibles do not add any extra challenge to the run, and therefore collecting them in a full clear run is not considered to be different from a standard run. For example, the moon berry in Path of D-espair or the cassette in Void Side.</p>
		<?php toc_next_heading($toc) ?>
		<p>This means that a Full Clear is required to be entered into the list, and a normal clear will be rejected. There's a note attached to each of these maps that explains exactly what is needed in the run and why. These extra requirements are added either because a map is too easy to be on the Standard List without them (Cheyenne, RITE), or because the extra challenge means it should be on the Hard List (Hakoniwa Adventure).</p>

</main>

<?php
require_once("include_site/footer.php");
?>
