<?php

/* miscellaneous functions that do not necessarily fit anywhere else */

function escape_html(string $s): string
{
	return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, "utf-8");
}

/* this function generates a list of links based on array structure.
 * sublists use the '.' key as their link
 */
function generate_link_list(array &$arr, bool $ol = false)
{
	echo $ol ? '<ol>' : '<ul>';
	foreach($arr as $key => &$val) {
		if ($key === '.')
			continue;
		if (is_array($val)) {
			echo '<li><a href="' . escape_html($val['.']) . '">' . escape_html($key) . '</a>';
			generate_link_list($val, $ol);
			echo '</li>';
			continue;
		}
		echo '<li><a href="' . escape_html($val) . '">' . escape_html($key) . '</a></li>';
	}
	echo $ol ? '</ol>' : '</ul>';
}

function generate_toc(array &$arr)
{
	echo '<nav aria-labelledby="toc-label">';
	echo '<h2 id="toc-label">Table of Contents</h2>';
	generate_link_list($arr, true);
	echo '</nav>';
}

/* this function shifts the first thing out of the toc and uses it as a heading.
 * the complete toc array isn't needed after generate_toc, so this is fine.
 * the function starts at header_depth 2 for h2, since h1 isn
 */
function toc_next_heading(array &$toc, int $header_depth = 2)
{
	$key = &array_key_first($toc);
	$val = &array_shift($toc);

	if (is_array($val)) {
		if (isset($val['.'])) {
			echo '<h' . $header_depth . ' id="' . substr($val['.'], 1) . '">' . $key . ' <a href="#">#</a></h' . $header_depth . '>';
			unset($val['.']);
		} else {
			toc_next_heading($val, $header_depth + 1);
		}
		/* push back only if array is nonempty, hence more in this section */
		if (!empty($val))
			array_unshift($toc, $val);
	} else {
		echo '<h' . $header_depth . ' id="' . substr($val, 1) . '">' . $key . ' <a href="#">#</a></h' . $header_depth . '>';
	}
}
