<?
require_once 'simple_html_dom.php';
// поисковый URL
$url = 'http://images.yandex.ru/yandsearch?text='.urlencode('Джессика Альба').'&rpt=image';
$n = 2;
// загружаем данный URL
$data = file_get_html($url);
// очищаем страницу от лишних данных, это не обязательно, но когда HTML сильно захламлен бывает удобно почистить его, для дальнейшего анализа
foreach($data->find('script,link,comment') as $tmp)$tmp->outertext = '';
// находим все изображения на странице
if(count($data->find('div.b-image img'))){
    $i = 1;
    foreach($data->find('div.b-image img') as $img){
        // выводим на экран изображение 
        echo '<img src="'.$img->src.'"/>';
        // и скачиваем его в файл
        file_put_contents('data/'.($i++).'.jpg',file_get_contents($img->src));
        if($i>$n)break; // выходим из цикла если скачали достаточно фотографий
    }
}
$data->clear();// подчищаем за собой
unset($data);
?>