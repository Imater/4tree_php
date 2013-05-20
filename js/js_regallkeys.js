var scrolltimer;
var last_blur_sync_time = 0;
var mytimer6;
var QueryString;

//все общие delegate и регистрация кнопок. Нужно указать точнее родительские элементы.
function jsRegAllKeyOld() 
{




	
if(false)
$('#tree_back').bind("contextmenu",function(e){

	$(".tree_history ul").html('').show();
  	$(".all_screen_click").remove();
  	$("#wrap").append("<div class='all_screen_click'></div>");
    
    $.each(tree_history.reverse(),function(e){ $(".tree_history ul").append('<li path="'+this.path+'">'+this.time + ' — ' + this.title+'</li>'); });
	tree_history.reverse();
	
  	$(this).find("ul:first").slideDown(200);

    return false;
	}); 


  $("body").delegate(".makedel","click", function () {
  	   id = $(".makedone").attr("myid");
	   title = jsFind(id).title;
	   id_element = $("#mypanel #node_"+id);
	   
	   childrens = jsFindByParent(id,true).length;
	   if(childrens > 0) child_text = "\r\rСодержимое папки ("+childrens+" шт.), тоже будет удалено.";
	   else child_text = "";
	   
	  if(title)
	   if (confirm('Удалить "'+title+'" ?'+child_text)) 
		  jsDeleteDo( id_element );
		else return false;
     $(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(100);
     $.Menu.closeAll();
	 return false;
	 });
	   	  


  $("body").delegate("#tree_back","click", function () {
  	history.back();
  	return false;
  	});

  $("body").delegate("#tree_forward","click", function () {
  	history.forward();
  	return false;
  	});

  $("body").delegate(".favorit_menu","click", function () {
  	$(".all_screen_click").remove();
  	$("#wrap").append("<div class='all_screen_click'></div>");
  	$(this).find("ul:first").slideDown(200);
  	return false;
  	});

  	//закрываю всё, если клик в экран
	$("#wrap").bind("click",function() {   	
		if(jsNow() - last_input_click > 50) 
			{
			$("input.active").removeClass("active");
			$(".header_text").html("").attr("title","");
			}
		$(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(100);
		$.Menu.closeAll();
  		jsTitle("");
//  		$(".add_new_do").slideUp(500);
  		return true;
	} );  	
  	
  $("body").delegate(".all_screen_click","click", function () {
  	$("* .all_screen_click").remove();
  	$(".favorit_menu ul,.tree_history ul").slideUp(200);
  	$("input").removeClass("active");
	$(".send_mail_form").slideUp(500);
  	$(".search_panel_result,.search_arrow").slideUp(200);
	$("#minicalendar").remove();
	$(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(100);
	$.Menu.closeAll();
  	return false;
  	});


     
  $("body").delegate(".m_refresh","click", function () {
    jsSync();
 	jsRefreshDo();
  	return false;
  	});

  $("body").delegate(".add_do_down","click", function () {
	jsAddDo('down');
  	return false;
  	});
     
  $("body").delegate(".add_do_right","click", function () {
	$.Menu.closeAll();
	jsAddDo('right');
  	return false;
  	});
     
     
  $("body").delegate(".m_zoom_in","click", function () {
  	step = parseFloat(0.02);
	jsZoomTree(step);
  	return false;
  	});

  $("body").delegate(".m_zoom_out","click", function () {
  	step = parseFloat(-0.02);
	jsZoomTree(step);
  	return false;
  	});

  $("body").delegate(".m_zoom_default","click", function () {
  	step = parseFloat(-1000);
	jsZoomTree(step);
  	return false;
  	});
     
     
  $("body").delegate(".n_title","blur", function () {
  	console.info("blur_title",$(this).attr("contenteditable"));
	if($(this).attr("contenteditable")) jsSaveTitle( $(this), 1 ); //сохраняю заметку
  	return false;
  	});

  $("body").delegate(".n_title","keydown", function (e) {
  	
  	if(!$(this).attr("contenteditable")) return true;
  	
	if(e.keyCode==13) 
		{
		e.preventDefault();
		$(this).blur(); //enter - увожу фокус, при этом сохраняется заметка
		return false;
		}
	if(e.keyCode==27) 
		{
		e.preventDefault();
		jsSaveTitle( $(this), -1 );
//		$(this).blur(); //enter - увожу фокус, при этом сохраняется заметка
		return false;
		}
  	return true;
  	});	
  	
  /////lilili title click   
  $("#mypanel").delegate(".n_title","mousedown", function () {
  	var edit_now = $(this).attr("contenteditable");
  	if (edit_now) 
  		{ 
  		return false; 
  		}
  	api4panel.jsTitleClick($(this),"from_panel");
  	return false;
  	});
  	
  	
  $(".header_toolbar").delegate(".h_button","click", function () {
  	if($(this).attr('id')=='pt4') 
  		{ //дерево
  		$("#top_panel").removeClass("panel_type2").removeClass("panel_type3").addClass("panel_type1");
  		}
  	if($(this).attr('id')=='pt3') 
  		{ //большие иконки
  		$("#top_panel").removeClass("panel_type2").removeClass("panel_type1").addClass("panel_type3");
  		$("#top_panel .ul_childrens").remove();
  		$("#mypanel").scrollLeft(60000);
  		}

  	if($(this).attr('id')=='pt2') 
  		{ //панели
  		$("#top_panel").removeClass("panel_type3").removeClass("panel_type1").addClass("panel_type2");
  		$("#mypanel").scrollLeft(60000);
  		}
  	
  	return false;
  	});


  $("body").delegate("#v1,#v2,#v3,#v4","click", function () {
  	if($(".view_selected").attr('id')!=$(this).attr('id')) jsMakeView( $(this).attr("id") );
  	$("#v1,#v2,#v3,#v4").removeClass("view_selected");
  	$(this).addClass("view_selected");
  	return false;
  	});


}
