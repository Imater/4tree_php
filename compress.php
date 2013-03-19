<?php

echo "START NOW";
ini_set('memory_limit', '-1');
//set_time_limit (4000);
/*
*
* Name: compress.php 
*
* Purpose: 
*	Allow Apache server to directly serve pre-gzipped and minified JS and CSS files
*	with no server overhead for deflating or gzipping the file each time it is served.
*	This script combines, minifies and gzips Javascript and Cascading Style Sheet files
*	in batch mode. Each combined group of JS or CSS creates two files: 
*		Minified; Minified and Gzipped; base file names set by user
*
* Reason for using:
*	You want to reduce server overhead by eliminating server calls and decreasing the number
*		of bytes transmitted.
*	You are serving move than one JS or CSS file per page.
*	Your JS and CSS are not minified and/or not GZipped	
*	Your Host server does not support or implement mod_pagespeed
*	Your Host server does not support/implement by default gzip or deflate for js or css files
*	Online minify packages have performance issues on your server and increase server overhead
*
* Features:
*	Source files unchanged, output written to user specified directory reserved
*		for compressed/minified files 
*	Appends time stamp to user file names avoiding cache issues when file data changes. 
*	Creates a PHP file that provides the timestamp for the created files
*		so user written PHP code can easily generate correct html links.
*	Creates output directory and .htaccess file on initial execution 
* 		allowing Apache to correctly serve gzipped JS and CSS files
*		and cache the combined files for one week
*	Deletes outdated versions of combined files
*
* Usage:
*	Install module in www/dir where dir is a directory of your choice
*		PHP file compress_timestamp.php is written to this directory
*		directory can be at any level	      
*	Install CSSMIN into www/dir and optionally change settings	
*	Install JSMIN into www/dir and optionally change settings	
*	Set output directory name, default: ../min
*		should be at the same level as your CSS directory or background-url may need to change
*	code the combining output file names and source file names
*	execute the script (initial)
*	Change your source code to use generated files, sample shown below
*	execute the script when changes are made to the source CSS or JS files
*	(optional) setup Cron job on your host to run weekly catching changes
*		that may not have been compressed 
*	
* Sample PHP implementation code:
* 
* require_once('compress_timestamp.php');		//load timestamp created by compress.php module
*							//sets field $compress_stamp=unix_timestamp					
* if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)	
*	$gz='gz';
* else
*	$gz=null;
* echo '<link rel="stylesheet" type="text/css" href="min/css_schedule_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
* 
* //    the following scripts were combined into two groups named css_schedule and css_non_schedule
* //	echo '<link rel="stylesheet" type="text/css" href="CSS/menu.css" />',PHP_EOL;
* //	echo '<link rel="stylesheet" type="text/css" href="CSS/ThreeColumnFixed.css" />',PHP_EOL;
* //	echo '<link rel="stylesheet" type="text/css" href="CSS/sprite.css" />',PHP_EOL;
* //	echo '<link rel="stylesheet" type="text/css" href="CSS/iCal.css" />',PHP_EOL;
* 	
* PHP 5 or higher is required.
*
* Copyright (c) 2011 Arnold Burkhoff
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*
* --
*
* @package compress.php
* @author Arnold Burkhoff <arnbme@gmail.com>
* @license http://opensource.org/licenses/mit-license.php MIT License
* @version 1.0.1 (2011-02-06)
* @link http://code.google.com/p/compress
* @dependencies: 
*	JSMin author Ryan Grove <ryan@wonko.com> https://github.com/rgrove/jsmin-php/
*		PHP version of Douglas Crockford's JSMin
* 	copyright 2002 Douglas Crockford <douglas@crockford.c
* 	copyright 2008 Ryan Grove <ryan@wonko.com> (PHP port)
*
*	CSSMin author Joe Scyllia http://code.google.com/p/cssmin/
*	copyright	2008 - 2011 Joe Scylla <joe.scylla@gmail.com>*
*/

$unix_timestamp = time();		//get unix time stamp added to all file names
$adir = "min";			//directory to store output, must not be one of the source directories
require_once('jsmin.php');		//load javascript minifier	
require_once('cssmin.php');		//load css minifier	
exit;


//		Create target directory and write Apache htaccess file when no directory found 
if (!file_exists($adir))
	{
	mkdir($adir) && chmod($adir, 0777);
	$htaccess='Options All -Indexes'.PHP_EOL;
	$htaccess.='AddType text/css cssgz'.PHP_EOL;
	$htaccess.='AddType text/javascript jsgz'.PHP_EOL;
	$htaccess.='AddEncoding x-gzip .cssgz .jsgz'.PHP_EOL;
	$htaccess.='# for all files in min directory'.PHP_EOL;
	$htaccess.='FileETag None'.PHP_EOL;
	$htaccess.='# Cache for a week, attempt to always use local copy'.PHP_EOL; 
	$htaccess.='<IfModule mod_expires.c>'.PHP_EOL;
	$htaccess.='  ExpiresActive On'.PHP_EOL;
	$htaccess.='  ExpiresDefault A604800'.PHP_EOL;
	$htaccess.='</IfModule>'.PHP_EOL;
	$htaccess.='<IfModule mod_headers.c>'.PHP_EOL;
	$htaccess.='  Header unset ETag'.PHP_EOL;
	$htaccess.='  Header set Cache-Control "max-age=604800, public"'.PHP_EOL;
	$htaccess.='</IfModule>'.PHP_EOL;
	file_put_contents($adir.'/.htaccess',$htaccess);			//write initial htaccess file
	}

//		prepare combined, minfied and combined, minified and gzipped css and js files
//file_compress('css_schedule.css',array('../CSS/menu.css','../CSS/ThreeColumnFixed.css','../CSS/sprite.css','../CSS/iCal.css'));
//file_compress('css_non_schedule.css',array('../CSS/menu.css','../CSS/ThreeColumnFixed.css','../CSS/sprite.css'));
//file_compress('css_schedule_ie7.css',array('../CSS/menuIE.css','../CSS/ThreeColumnFixed.css','../CSS/sprite.css','../CSS/iCal.css'));
//file_compress('css_non_schedule_ie7.css',array('../CSS/menuIE.css','../CSS/ThreeColumnFixed.css','../CSS/sprite.css'));
//file_compress('css_ie6.css',array('../CSS/menuIE6.css','../CSS/ThreeColumnFixedIE6.css','../CSS/sprite.css'));
//file_compress('js_schedule.js',array('../JS/Schedule.js','../JS/iCal.js','../JS/Findit.js','../JS/UlScroll.js','../ExternalConnect/External.js'));
//file_compress('js_non_schedule.js',array('../JS/Findit.js','../JS/UlScroll.js','../ExternalConnect/External.js'));

if(false)
file_compress('styles.css',array('ui/css/smoothness/jquery-ui-1.8.21.custom.css','fullcalendar/fullcalendar/fullcalendar.css','fontello/css/fontello.css'));
//'css/styles.css',
/*
<link rel="stylesheet" href="./redactor/redactor/redactor.css" />
<link type="text/css" href="ui/css/smoothness/jquery-ui-1.8.21.custom.css" rel="stylesheet" />
<link rel="stylesheet" type="text/css" href="./pro_dropdown_3/pro_dropdown_3.css" />
<link rel='stylesheet' type='text/css' href='./fullcalendar-1.5.3/fullcalendar/fullcalendar.css' />
<link rel="stylesheet" href="./fontello/css/fontello.css">

	<script src="js/loader.js"></script>
	<script src="b_menu/jquery.dimensions.min.js"></script>
	<script src="b_menu/jquery.menu.js"></script>
	<script src="./js/jquery-ui.multidatespicker.js"></script>
    <script type="text/javascript" src="./js/jquery.idle-timer.js"></script>

*/

if(false)
file_compress('all.js',array('js/jquery.min.js',
	'js/jquery.datetimeentry2.min.js',
	'js/jquery.datetimeentry-ru.js',
	'jstree/_lib/jquery.cookie.min.js',
	'jstree/_lib/jquery.hotkeys.min.js',
	'ui/js/jquery-ui-1.8.21.custom.min.js',
	'fullcalendar/jquery/jquery-ui-1.8.23.custom.min.js',
	'js/loader.js',
	'b_menu/jquery.dimensions.min.js',
	'b_menu/jquery.menu.js',
	'js/jquery.idle-timer.js',
	'js/jquery-ui.multidatespicker.js',
	'js/iphone-style-checkboxes.js',
	'js/handlebars.js',
	'fullcalendar/fullcalendar/fullcalendar.js',
	'js/pushstream.js',
	'js/jszip.js'
	));

//'jstree/jquery.jstree.js',

if(false)
file_compress('4tree.js',array('js/jquery.js','js/4tree.js','jstree/_lib/jquery.cookie.js','js/pwdwidget.js'));

if(false)
file_compress('4tree.css',array('css/4tree.css','js/pwdwidget.css'));


/*
    <script src="./js/jquery.datetimeentry2.min.js"></script>
    <script src="./js/jquery.datetimeentry-ru.min.js"></script>

	<script type="text/javascript" src="./jstree/_lib/jquery.cookie.min.js"></script>
	<script type="text/javascript" src="./jstree/_lib/jquery.hotkeys.min.js"></script>

	<script type="text/javascript" src="./jstree/jquery.jstree-ck.js"></script>
*/

//		write new timestamp file compress_timestamp.php for php execution code
$infofile='<?php'.PHP_EOL;
$infofile.='$compress_stamp='.$unix_timestamp.';'.PHP_EOL;
$infofile.='?>'.PHP_EOL;
file_put_contents ('compress_timestamp.php',$infofile,LOCK_EX);		//file loaded by ThreeColTemplate1.php to get unique stamp id

//		5 second delay should take care of 99.9% of inflight requests
//			except on super overloaded servers or slow connections
sleep(5);	

//		delete older files in library
$unix_timestamp.='';		//make a string
if (file_exists($adir) && $dh = opendir($adir)) 
	{
	while($fn = readdir($dh)) if ($fn[0] != ".")
		{
		if (strpos($fn,$unix_timestamp)===false)
			{
			unlink($adir.'/'.$fn);
			echo $fn,' deleted<br>';
			}
		}	
	closedir($dh);
	}
else
	echo 'failed to open ',$adir,' ',date("r"),PHP_EOL;

function file_compress($file_name,$file_input) {
	global $unix_timestamp,$adir;
	$pos=strrpos($file_name,'.');				//get last . in file name
	if ($pos==false)
		die ('illogical response from strrpos');
	$fn=substr($file_name,0,$pos).'_'.$unix_timestamp.substr($file_name,$pos);	//put timestamp into file name
	$fl=null;						//clear file data variable
	foreach($file_input as $value)				//merge files in the group
		$fl.= file_get_contents($value).' ';
	$len_orig=strlen($fl);		
	if (strtolower(substr($file_name,$pos+1,2)) == 'js')	
//		$fl = preg_replace('/\t| {2,}/', '', $fl);
		$fl = JSMin::minify($fl);			//minify js	
	else
//		$fl = preg_replace('/\n\r|\r\n|\n|\r|\t| {2,}/', '', $fl);
		$fl = CssMin::minify($fl);			//minify css

	$len_minify=strlen($fl);
    	$gzdata=gzencode ($fl,9);				//gzip 

//		write files no need to lock, filename is unique and not yet in use
 	file_put_contents ($adir.'/'.$fn,$fl);			 	//put out minified, non gzipped version
   	file_put_contents ($adir.'/'.$fn.'gz',gzencode ($fl,9));	//put out gzipped version
	echo $adir.'/'.$fn, ' created length: ', $len_minify, ' ', $len_orig,'<br />'; 
	echo $adir.'/'.$fn.'gz', ' created length: ', strlen($gzdata), ' ', $len_minify, ' ', $len_orig,'<br />'; 
}
?>