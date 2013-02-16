var main_data;

function jsDoFirstMobile()
{
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


function showCategory( urlObj, options )
{
	console.info(urlObj,options,main_data);
	
	var categoryName = urlObj.hash.replace( /.*node=/, "" ),

		category = main_data[ categoryName ],
		pageSelector = urlObj.hash.replace( /\?.*$/, "" ); //шаблон страницы
		
		console.info(categoryName,category,pageSelector);

	if ( category ) {
		var $page = $( pageSelector ),
			$header = $page.children( ":jqmData(role=header)" ),
			$content = $page.children( ":jqmData(role=content)" ),
			markup = "<ul data-role='listview' data-inset='false'>",
			cItems = category,
			numItems = cItems.length;
		$.each(cItems, function(i,data) {
		
		  if(data.have_child>0)
			{
			a1 = "<a href='#category-items?node="+data.id+"'><div class='ui-li-count'>"+data.have_child+"</div>";
			a2 = "</a>";
			}
		  else 
		    {
		    if(data.text.length>5)
		    	{
				a1 = "<a href='#note-items?node="+data.id+"'>";
				a2 = "<p>"+data.text.replace(/<\/?[^>]+>/gi, ' ')+"</p></a>";
		    	}
		    else
		        {
		        a1 = a2 = '';
		        }
		    }
			
			markup += "<li>"+ a1 + "<h3>" + data.title + "</h3>" + a2 + "</li>";
			old_parent = data.old_parent;
			old_title = data.old_title;
		
		});

		text_note='';
		$.each(main_data, function(i,data) {
			if(data[categoryName]) { 
			 	text_note = data[categoryName].text;
			 	title_note = data[categoryName].title;
			 	}
		});

		if(text_note.length>5) markup += "<br><h1 style='center'>Заметка: "+title_note+"</h1><p>"+text_note+"</p>";
		markup += "</ul>";
		$header.find( "h1" ).html( old_title );
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

		category = main_data[ categoryName ],
		pageSelector = urlObj.hash.replace( /\?.*$/, "" );
		
		var $page = $( pageSelector );
		$header = $page.children( ":jqmData(role=header)" );
		$content = $page.children( ":jqmData(role=content)" );


		$.each(main_data, function(i,data) {
			if(data[categoryName]) { 
			 	text_note = data[categoryName].text;
			 	title_note = data[categoryName].title;
			 	parent_id = data[categoryName].parent_id;
			 	}
		});


		$header.find( "h1" ).html( title_note );
		$content.html( text_note );

		$.mobile.changePage( $page, options );

		$(".back1").attr("href","#category-items?node="+parent_id);
		
    console.info('node=',categoryName);

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