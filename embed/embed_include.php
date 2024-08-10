<?php

function output_text_embed($url, $title, $description, $site_name)
{
  $template = file_get_contents("text-embed-template.html");
  $template = str_replace("{{url}}", $url, $template);
  $template = str_replace("{{title}}", $title, $template);
  $template = str_replace("{{description}}", $description, $template);
  $template = str_replace("{{site_name}}", $site_name, $template);
  echo $template;
}

function output_image_embed($url, $title, $description, $image_url)
{
  $template = file_get_contents("image-embed-template.html");
  $template = str_replace("{{url}}", $url, $template);
  $template = str_replace("{{title}}", $title, $template);
  $template = str_replace("{{description}}", $description, $template);
  $template = str_replace("{{image_url}}", $image_url, $template);
  echo $template;
}