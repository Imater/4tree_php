<head>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="js/mjs.js"></script>	  	  


<link rel="stylesheet" type="text/css" href="css/ui/css/smoothness/jquery-ui-1.8.21.custom.css"/>
</head>

<body>

<script>

$(document).ready(function(){
	$('.sortable').nestedSortable({
            handle: 'div',
            items: 'li',
            toleranceElement: '> div'
        });
});

</script>

<?
	if(class_exists('Memcache')){
  // Memcache is enabled.
  	echo "HELLO!!!";
  	}
  	
  	$memcache_obj = new Memcache;
  	$t = microtime();
  	$memcache_obj->connect('localhost', 11211);
  	echo (microtime()-$t)."<hr>";
  	$var_key = $memcache_obj->get('our_var');
  	if(!empty($var_key)) {
  	    //Если объект закэширован, выводим его значение
  	    echo $var_key;
  	} else {
	  	$memcache_obj->set('our_var', date('G:i:s'), false, 60000);
	  	echo $memcache_obj->get('our_var');
  	}
  	print_r( $memcache_obj->getStats() );
  	$memcache_obj->close();
?>


<ol class="sortable">
    <li><div>Some content</div></li>
    <li>
        <div>Some content</div>
        <ol>
            <li><div>Some sub-item content</div></li>
            <li><div>Some sub-item content</div></li>
        </ol>
    </li>
    <li><div>Some content</div></li>
</ol>
</body>