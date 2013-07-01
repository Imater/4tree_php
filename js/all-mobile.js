var main_data, preloader, my_all_frends, old_parent=1, old_title="4tree.ru", is_mobile = true;
var start_sync_when_idle=false;

function jsRegAllKeys() {
	$("#load_from_server").on("click",function(){
		$(".ui-header h1").html("Загружаю...");
		api4tree.js_LoadAllDataFromServer().done(function(){
			$(".ui-header h1").html("Данные загружены успешно");
		});
	});

	$("body").on("click",".save_text",function(){
		var old_save_title = $(".save_text .ui-btn-text" ).html();
		$(".save_text .ui-btn-text" ).html( "Сохраняю.");
		var myid = $("#redactor").attr("myid");
		var new_text = $("#redactor").redactor("get");
		if(!myid) return false;
		api4tree.jsFindLongText(myid,new_text).done(function(){
			setTimeout(function(){ $(".save_text .ui-btn-text" ).html("Сохраняю.."); },200);
			api4tree.jsSync();
			setTimeout(function(){ $(".save_text .ui-btn-text" ).html("Сохраняю..."); },350);
			setTimeout(function(){ $(".save_text .ui-btn-text" ).html(old_save_title); },500);
		});
		start_sync_when_idle = true;
		return false;
	});

	$("body").on("click","#sync_now",function(){
		    $("#sync_now .ui-icon-refresh").css("background-color","#417b2e");
		api4tree.jsSync().done(function(){
			$("#sync_now .ui-icon-refresh").css("background-color","");
		});
	});



}


function jsLoadAllData() {
	api4tree.js_LoadAllFromLocalDB().done(function(){

	});
}


function jsMakeIconText(text) { 
		  	var mylength = strip_tags(text).length;
		  	var i_size = parseInt( mylength/50,10 );
		  	if(i_size>6) i_size=6;
		  	if(mylength<100) i_size = "1";	
		  	if(mylength==0) { i_size = "clean"; }
		  	
		  	var mylength1 = parseInt(mylength/30,10)/10;
		  	if(mylength>0 && mylength1==0) mylength1 = 0.1;
		  	if(mylength1>1) mylength1 = 0.7;
		  	
		  	if(text=="<p>&#x200b;</p>") i_size="clean";
		  	
		  	return { myclass:("note-"+i_size), mylength:mylength1 };
}

function jsDoFirstMobile()
{

	$.mobile.buttonMarkup.hoverDelay = 10;
	$.mobile.defaultPageTransition = "none";
	$.mobile.touchOverflowEnabled = true;

	main_user_id = $.cookie("4tree_user_id");

	api4tree = new API_4TREE("4tree_db");
	var mydb = api4tree.js_InitDB(); 

		  	myr = $('#redactor').redactor({ imageUpload: 'do.php?save_file='+11,
		  		  lang:'ru', focus:false, 
		  		  toolbarExternal: "#fav_redactor_btn",
		  		  fileUpload: './do.php?save_file='+11,
		  		  imageUpload: './do.php?save_file='+11
		  	   });
 	
 	preloader = $('#myloader').krutilka("show"); //глобально регистрирую крутилку

    jsRegAllKeys();

    jsLoadAllData();

    api4tree.jsMakeIdleFunction();
/*
   main_data = JSON.parse(localStorage.getItem("alltree"));

   main_node = 1;
   $.getJSON( "do.php?mobile="+main_node ,function(data)
	{
	main_data = data;
	localStorage.setItem("alltree",JSON.stringify(main_data));
	console.info(data);
    }).error(function() 
        { 
        alert("Нет соединения с интернетом, использую резервную копию дерева"); 
        });
*/

function showCategory( urlObj, options ) //показывает список
{
	console.info(urlObj,options,main_data);
	
	var categoryName = urlObj.hash.replace( /.*node=/, "" );

	var category = api4tree.jsFindByParent(categoryName);
	var pageSelector = urlObj.hash.replace( /\?.*$/, "" ); //шаблон страницы
		
	console.info(categoryName,category,pageSelector);

	if ( category ) {
		var $page = $( pageSelector ),
			$header = $page.children( ":jqmData(role=header)" ),
			$content = $page.children( ":jqmData(role=content)" ),
			markup = "<ul data-role='listview' data-inset='false'>",
			cItems = category,
			numItems = cItems.length;
		$.each(cItems, function(i,data) {
		
		  var text_length = data.text?strip_tags(data.text).length:0;

		  if(data.tmp_childrens>0)
			{
			a1 = "<a class='tree_li' href='#category-items?node="+data.id+"'><div class='ui-li-count'>"+data.tmp_childrens+"</div>";
			a2 = "</a>";
			var icon_img = "<div class='folder_closed'></div>";
			if(text_length>5) {
				var icon_img = "<div class='folder_closed full'></div>";
			}
			}
		  else 
		    {
		    var note_icon = jsMakeIconText(data.text).myclass;
			var icon_img = "<div class='node_img "+note_icon+"'></div>";
		    if(true)
		    	{

				a1 = "<a class='tree_li' href='#note-items?node="+data.id+"'>";
				a2 = "<p>"+data.text.replace(/<\/?[^>]+>/gi, ' ')+"</p></a>";
		    	}
		    else
		        {
		        a1 = a2 = '';
		        }
		    }
			
			markup += "<li>"+ a1 + "<h3>" + icon_img + data.title + "</h3>" + a2 + "</li>";
			old_parent = (data.parent_id==1)?1:api4tree.jsFind(data.parent_id).parent_id;
			old_title = data.title;

		
		});

		/*if(text_note.length>5) {
			myr.redactor("set",text_note);
		}*/
		//markup += "<div id='editor'><br><h1 style='center'>Заметка: "+title_note+"</h1><p>"+text_note+"</p></div>";
		markup += "</ul>";
		//window.location.hash = categoryName.toString(36); 
		if(old_title) $header.find( "h1" ).html( old_title );		
		$content.html( markup );
		$page.page();

		$content.find( ":jqmData(role=listview)" ).listview();
		options.dataUrl = urlObj.href;
		
		$(".back1").attr("href","#category-items?node="+old_parent);
		
		$.mobile.changePage( $page, options );
	}
}


function showCategory1( urlObj, options ) //показываю заметки
{
	var categoryName = urlObj.hash.replace( /.*node=/, "" ),

		
		pageSelector = urlObj.hash.replace( /\?.*$/, "" );
		var the_data = api4tree.jsFind(categoryName);
		if(!the_data) return true;

		var $page = $( pageSelector );
		$header = $page.children( ":jqmData(role=header)" );
		$content = $page.children( ":jqmData(role=content)" );
		$footer = $page.children( ":jqmData(role=footer)" );
		title_note = the_data.title;
		//text_note = data.text;



		$footer.find( ".save_text .ui-btn-text" ).html( "Сохранить: " + title_note);
		//$content.html( text_note );

		$.mobile.changePage( $page, options );
				
		old_parent = (the_data.parent_id==1)?1:the_data.parent_id;
		$(".save_text").attr("href","#category-items?node="+old_parent);
		myr.redactor("set","Loading...").attr("myid",the_data.id);

		api4tree.jsFindLongText(categoryName).done(function(text_note){
				if(myr.attr("myid")==the_data.id) {
				   myr.redactor("set",text_note);
			    }

		});
		
		
		

}



	$(document).bind( "pagebeforechange", function( e, data ) {
	if ( typeof data.toPage === "string" ) {
		var u = $.mobile.path.parseUrl( data.toPage ),
			re = /^#category-item/;
		if ( u.hash.search(re) !== -1 ) {
			showCategory( u, data.options );
			e.preventDefault();
		}
			re = /^#note-items/;
		if ( u.hash.search(re) !== -1 ) {
			showCategory1( u, data.options );
			e.preventDefault();
		}

		
	}
	});




}

function jsList()
{
}