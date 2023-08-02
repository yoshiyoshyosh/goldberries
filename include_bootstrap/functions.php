<?php

function escape_html($s)
{
	return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, "utf-8");
}

?>
