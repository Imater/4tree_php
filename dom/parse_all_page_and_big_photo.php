<?
require_once 'simple_html_dom.php';
function getYandexImages($url,$findpages = true){
	static $i = 1;
	$n = 200;
	// загружаем данный URL
	$data = file_get_html($url);
	// очищаем страницу от лишних данных, это не обязательно, но когда HTML сильно захламлен бывает удобно почистить его, для дальнейшего анализа
	foreach($data->find('script,link,comment') as $tmp)$tmp->outertext = '';
	// находим URL страниц только для первого вызова функции
	if( $findpages and count($data->find('div.b-pager__pages a'))){
		foreach($data->find('div.b-pager__pages a') as $a){	
			// довольно распространенный случай - локальный URL. Поэтому иногда url надо дополнять до полного
			if( !preg_match('#^http://#',$a->href) )$a->href = 'http://images.yandex.ru'.$a->href;
			// и еще дна тонкость, &amp; надо заменять на &
			$a->href = str_replace('&amp;','&',$a->href);
			// вызываем функцию для каждой страницы
			getYandexImages($a->href,false);
		}
	}
	// находим все изображения на странице
	if(count($data->find('div.b-image img'))){
		foreach($data->find('div.b-image img') as $img){
			// выводим на экран изображение 
			echo '<img src="'.$img->src.'"/>';
			// и скачиваем его в файл
			file_put_contents('data/'.($i++).'.jpg',file_get_contents($img->src));
			if($i>$n)exit; // завершаем работу если скачали достаточно фотографий
		}
	}
	$data->clear();// подчищаем за собой
	unset($data);
}
// поисковый URL
$url = 'http://images.yandex.ru/yandsearch?text='.urlencode('Джессика Альба').'&rpt=image';
getYandexImages($url);
?>