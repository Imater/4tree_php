<?
require_once("cssmin.php");

// Simple minification WITHOUT filter or plugin configuration
$result = CssMin::minify(file_get_contents("css/styles.css"));

// Minification WITH filter or plugin configuration 
//$filters = array(/*...*/);
//$plugins = array(/*...*/);
// Minify via CssMin adapter function
//$result = CssMin::minify(file_get_contents("path/to/source.css"), $filters, $plugins);
// Minify via CssMinifier class
//$minifier = new CssMinifier(file_get_contents("path/to/source.css"), $filters, $plugins);
//$result = $minifier->getMinified();
echo $result;
?>