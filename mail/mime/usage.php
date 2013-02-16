<?php
require_once('mime_parser.class.php');
$test_file='test.eml';
if(!file_exists($test_file))die('Please give me an e-mail.');
$eml=file_get_contents($test_file);
$mailWithHeaders=mailParser::parse($eml);
$mail=mailParser::niceClass($mailWithHeaders);
echo "\n\nNice e-mail object\n\n";
print_r($mail);
echo "\n\nE-mail object with all the found parts\n\n";
print_r($mailWithHeaders);
echo "\n\nOriginal E-mail text\n\n";
print_r($eml);