<?php
include_once 'class.get.image.php';

$image = new GetImage;

$image->source = 'http://ya.ru';
$image->save_to = 'images/'; 

$get = $image->download('curl'); 

if($get)
{
echo 'Картинка сохранена.';
}
?>