var scrolltimer;
var last_blur_sync_time = 0;
var mytimer6;
var QueryString;

//все общие delegate и регистрация кнопок. Нужно указать точнее родительские элементы.
function jsRegAllKeyOld() 
{


		 $('*').undelegate("#textfilter", "keyup").delegate("#textfilter", "keyup", function(event) 
			{
					
					clearTimeout(tttt);
					tttt = setTimeout(function()
					         {
									    	var searchstring = $('#textfilter').val();
									    	
									    	if(searchstring.length<3) return true;

									         var tt = '';
									         try {
											 tt = ' = '+eval( $('#textfilter').val().replace(",",".") ); 
											 } catch (e) {
											   tt = '';
											 }
									    	if(tt!='') 
									    		{ 
									    		jsTitle(tt,100000); 
									    		//return true; 
									    		}
									    	
					var comment_ids_found=new Array;		
					var data = my_all_comments.filter(function(el)
						{
						if( el.text.toLowerCase().indexOf(searchstring.toLowerCase())!=-1 )
							if(comment_ids_found.indexOf(el.tree_id)==-1) comment_ids_found.push( el.tree_id );
						});				
									    	
			    	var data = my_all_data.filter(function(el) //поиск удовлетворяющих поисковой строке условий
		        		{ 
		        		if(!(!el.title)) 
		        		  return ( (el.title.toLowerCase().indexOf(searchstring.toLowerCase())!=-1) ||
		        		   		   (el.text.toLowerCase().indexOf(searchstring.toLowerCase())!=-1) ||
		        		   		   comment_ids_found.indexOf(el.id)!=-1 ); 
		        		});

									    	jsShowTreeNode(-1,false,data);
									    	
											setTimeout( function() 
												{ 
												jsPrepareDate(); 
												jsHighlightText(); 
												},50 );
									    	
					         if(searchstring!='') 
					         	{ 
					         	$("#tab_find").click();
					         	$("#search_empty").fadeIn(200); 
					         	}
					         
					         }, 300);

			return false;
		
			});



  $(window).keyup(function(e){
	
  	 if((e.keyCode==91))
  	 	{
  	 	mymetaKey = false;
		}

  	 if((e.keyCode==16)) //shift - убирает даты родителей
  	 	{
		//$(".fromchildren").hide();
  	 	}
  	
  	 if((e.keyCode==18))
  	 	{
  	 	clearTimeout(show_help_timer);
  	 	$("#hotkeyhelper").hide();
  	 	}
	});

  $(window).keydown(function(e){
  	 clearTimeout(show_help_timer);
  	 
//  	 console.info(e.keyCode);

  	 if((e.keyCode==91))
  	 	{
  	 	mymetaKey = true; //регистрируем глобально, что нажата Win или Cmd
		}
  	 
  	 if((e.altKey==true) && (e.keyCode==18)) //нажатый альт вызывает помощь по горячим клавишам
  	 	{
  	 	show_help_timer = setTimeout(function(){ $("#hotkeyhelper").show(); },1500);
  	 	}

  	 if( (e.altKey==true) && (e.keyCode==68) )  //D - diary
  	   {
		   e.preventDefault();
	  	   $(".todaydate").click();
	   }

  	 if( (e.altKey==true) && (e.keyCode==65) )  //A - new_do
  	   {
	   e.preventDefault();
  	   if(!$("#add_do").hasClass("active")) 
  	   		{
  	   		$("#add_do").click();
  	   		}
  	   else 
  	   		{
  	   		if( $("#add_do").is(":focus") )
  	   			{
	  	   		$("#add_do").blur();
	  	   		$("#wrap").click();
	  	   		}
	  	   	else
	  	   		{
	  	   		$("#add_do").focus();
			  	document.execCommand('selectAll',false,null);
	  	   		}
  	   		}
  	   return false;
  	   }
	   
  	 if( (e.altKey==true) && (e.keyCode==49) ) 
  	   {
	   e.preventDefault();
  	   jsTitle('Alt+1');
  	   $("#v1").click();
  	   }
  	 if( (e.altKey==true) && (e.keyCode==53) )
  	   {
  	     $( 'body' ).simulateKeyPress('x');
  	     $( 'body' ).simulateKeyPress('y');
  	     $( 'body' ).simulateKeyPress('j');
  	   }  
  	   
  	 if( (e.altKey==true) && (e.keyCode==50) ) 
  	   {
	   e.preventDefault();
  	   jsTitle('Alt+2');
  	   $("#v3").click();
  	   }
  	 if( (e.altKey==true) && (e.keyCode==51) ) 
  	   {
	   e.preventDefault();
  	   jsTitle('Alt+3');
  	   $("#v2").click();
  	   }
  	 if( (e.altKey==true) && (e.keyCode==52) ) 
  	   {
	   e.preventDefault();
  	   jsTitle('Alt+4');
  	   $("#v4").click();
  	   }
  	 if( (e.altKey==true) && ((e.keyCode==189) || (e.keyCode==173) ) ) 
  	   {
	   e.preventDefault();
  	   $(".m_zoom_out")[0].click();
  	   }
  	 if( (e.altKey==true) && ((e.keyCode==187) || (e.keyCode==61) || (e.keyCode==231)) ) 
  	   {
	   e.preventDefault();
  	   $(".m_zoom_in")[0].click();
  	   }
  	 if( (e.altKey==true) && (e.keyCode==48) ) 
  	   {
	   e.preventDefault();
  	   $(".m_zoom_default")[0].click();
  	   }
  	 if( (e.altKey==true) && (e.keyCode==82) )  //alt+R - обновляю дерево
  	   {
	   e.preventDefault();
  	   $(".m_refresh")[0].click();
  	   return false;
  	   }
  	 if( ((e.altKey==true) || (e.ctrlKey==true) ) && (e.keyCode==40) )  //alt + вниз
  	   {
	   e.preventDefault();
  	   jsAddDo('down');
  	   }
  	 if( ((e.altKey==true) || (e.ctrlKey==true) ) && (e.keyCode==39) )  //alt + вправо
  	   {
	   e.preventDefault();
  	   jsAddDo('right');
  	   }
  	 if( (e.altKey==true) && (e.keyCode==70) )  //alt+R - обновляю дерево
  	   {
	   e.preventDefault();
  	   $(".fullscreen_button")[0].click();
  	   return false;
  	   }
  	   
  	   
  	   
  if( (!($("input").is(":focus"))) && (!($(".redactor_editor").is(":focus"))) && (!($("#redactor").is(":focus"))) && ($(".n_title[contenteditable='true']").length==0) && (!$(".comment_enter_input").is(":focus")) ) //если мы не в редакторе
  	{
     if( (e.altKey==false) && (e.keyCode==13) )
       {
	    e.preventDefault();
       	ntitle = $(".selected").find(".n_title");
	  	ntitle.attr("contenteditable","true").attr("spellcheck","false").focus(); 
	  	ntitle.attr("old_title",ntitle.html());
	  	document.execCommand('selectAll',false,null);
       }
  	 if( (e.altKey==false) && (e.keyCode==40) )  //вниз
  	   {
	   e.preventDefault();
	   jsGo('down');
  	   }
  	 if( (e.altKey==false) && (e.keyCode==38) )  //вверх
  	   {
	   e.preventDefault();
	   jsGo('up');
  	   }
  	 if( (e.altKey==false) && (e.keyCode==37) )  //влево
  	   {
	   e.preventDefault();
	   jsGo('left');
  	   }
  	 if( (e.altKey==false) && (e.keyCode==39) )  //вправо
  	   {
	   e.preventDefault();
	   jsGo('right');
  	   }

  	 if( (e.metaKey==false) && (e.keyCode==46) )  //вправо
  	   {
	   e.preventDefault();
	   title = $(".selected .n_title").html();
	  if(title)
	   if (confirm('Удалить "'+title+'"?')) 
		  jsDeleteDo($(".selected"));
  	   }
	}
  	   
  	   
     });


	
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
