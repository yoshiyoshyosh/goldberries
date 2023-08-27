<?php

/* miscellaneous functions that do not necessarily fit anywhere else */

function escape_html(string $s): string
{
	return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, "utf-8");
}

function generate_toc_inner(array &$arr)
{
	echo '<ol>';
	foreach($arr as $key => $val) {
		if (is_array($val)) {
			generate_toc_inner($val);
			continue;
		}
		echo '<li><a href="#' . escape_html($key) . '">' . escape_html($val) . '</a></li>';
	}
	echo '</ol>';
}

function generate_toc(array &$arr)
{
	echo '<nav aria-labelledby="toc-label">';
	echo '<h2 id="toc-label">Table of Contents</h2>';
	echo generate_toc_inner($arr);
	echo '</nav>';
}

/* this function shifts the first thing out of the toc and uses it as a heading.
 * the complete toc array isn't needed after generate_toc, so this is fine */
function toc_next_heading(array &$toc, int $header_depth = 2)
{
	[$key, $val] = array(array_key_first($toc), array_shift($toc));

	if (is_array($val)) {
		toc_next_heading($val, $header_depth + 1);
		/* push back only if array is nonempty, hence more in this section */
		if ($val)
			array_unshift($toc, $val);
	} else {
		echo '<h' . $header_depth . ' id="' . $key . '">' . $val .
			' <a href="#">#</a></h' . $header_depth . '>';
	}
}
