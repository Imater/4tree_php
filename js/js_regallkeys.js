var scrolltimer;
var last_blur_sync_time = 0;
var mytimer6;
var QueryString;

function jsRegAllKeyOld() //все общие delegate и регистрация кнопок. Нужно указать точнее родительские элементы.
{
		
	   
	 $('body').delegate("#diaryleft","click", function ()
	   {
	   diaryrewind = diaryrewind - 1;
	   jsSetDiaryDate(diaryrewind);
	   old_before_diary=0;
	   $(".todaydate").click();
	   return false;
	   });

	 $('body').delegate("#diaryright","click", function ()
	   {
	   diaryrewind = diaryrewind + 1;
	   jsSetDiaryDate(diaryrewind);
	   old_before_diary=0;
	   $(".todaydate").click();
	   return false;
	   });
		
	 $('body').delegate(".show_childdate_do","click", function ()
	   {
	   if(!show_childdate) 
	   		{
	   		show_childdate = true;
	   		$.cookie('sd',show_childdate,{ expires: 300 });
			$(".show_childdate_do").html("Скрыть дату следующего действия у папки"); 
	   		jsTitle("Даты отображаются",20000);
	   		}
	   else 
	   		{
	   		show_childdate = false;
	   		$.cookie('sd',show_childdate,{ expires: 300 });
			$(".show_childdate_do").html("Показывать дату следующего действия у папки"); 
	   		jsTitle("Даты скрыты",20000);
	   		}
	   jsRefreshTree();
	   return false;
	   });
	   		
		
	 $('body').delegate(".show_hidden_do","click", function ()
	   {
	   if(!show_hidden) 
	   		{
	   		show_hidden = true;
	   		$.cookie('sh',show_hidden,{ expires: 300 });
			$(".show_hidden_do").html("Скрыть выполненные дела"); 
	   		jsTitle("Выполненные дела видны",20000);
	   		}
	   else 
	   		{
	   		show_hidden = false;
	   		$.cookie('sh',show_hidden,{ expires: 300 });
			$(".show_hidden_do").html("Показать выполненные дела"); 
	   		jsTitle("Выполненные дела скрыты",20000);
	   		}
	   		
	   jsRefreshTree();
	   return false;
	   });
		
		
	 $('body').delegate(".makeremindsms","click", function ()
	   {
	   id = $(this).parents(".makedone").attr("myid");
	   if(jsFind(id).date1!="") 
	   		{
	   		jsFind(id,{ remind: 15 });
		    jsRefreshTree();	
		   
		    }
		else
			{
			jsTitle("Сначала установите дату и время");
			}
	   return false;
	   });


	 $('body').delegate(".makeunremindsms","click", function ()
	   {
	   id = $(this).parents(".makedone").attr("myid");	   
	   jsFind(id,{ remind: 0 });
	   jsRefreshTree();

	   return false;
	   });
		
		
	 $('body').delegate(".makedid","click", function ()
	   {
	   id = $(this).parents(".makedone").attr("myid");
	   jsMakeDid(id);	   

	   return false;
	   });

	 $('body').delegate(".makedatenull","click", function ()
	   {
	   id = $(this).parents(".makedone").attr("myid");
	   jsFind(id, { date1:"", date2:"", remind:0 });
	   setTimeout(function(){ jsRefreshTree(); },300);
	   return false;
	   });

	 $('body').delegate(".makeundid","click", function ()
	   {
	   id = $(this).parents(".makedone").attr("myid");
	   jsMakeUnDid(id);
	   return false;
	   });

	 $('body').delegate("#makeshare","click", function ()
	 	{
   	  	$(this).focus().select();
   	  	return false;
   	  	});


if(false)
  $("body").delegate(".n_title","mouseenter",
  	function(){ 
  	var need_to_open = $(this);
  	clearTimeout(tttt);
  	tttt=setTimeout(function(){
	  	console.info("open"); need_to_open.parent("li:first").click(); 
  		},1000);
  	return false;
  	
  	})

	 $('body').delegate(".basket","click", function ()
	   {
//	   jsShowBasket();
	   $(".basket_panel").slideToggle(300);
	   return false;
	   });


	$('.on_off').iphoneStyle({ checkedLabel: 'да', uncheckedLabel: 'нет',         
          onChange: function(element,value) 
          	{ 
			if(is_rendering_now) return true;
          	id_element = element.attr("id");
		    id = element.parents(".makedone").attr("myid");
		    node = jsFind(id);
		    if(!id || !node) return false;

          	if(id_element == "on_off_did") //did - undid
          	   {
          	   if(value) 
          	   		{
					jsMakeDid(id);
          	   		}
          	   else 
          	   		{
					jsMakeUnDid(id);
          	   		}
          	   }

          	if(id_element == "on_off_date") //дата начала
          	   {
          	   if(value) 
          	   		{
          	   		$("#makedate").slideDown(200);
				    setTimeout(function(){ $("#makedatetime").change(); jsRefreshTree(); jsPlaceMakedone(id); },300);
					$('#calendar').fullCalendar( 'refetchEvents' ); 
          	   		}
          	   else 
          	   		{
          	   		$("#makedate").slideUp(200);
				    jsFind(id, { date1:"", date2:"", remind:0 });
				    setTimeout(function(){ jsRefreshTree(); jsPlaceMakedone(id); },300);
					$('#calendar').fullCalendar( 'refetchEvents' ); 
          	   		}
          	   }


          	if(id_element == "on_off_sms") //переключатель SMS
          	   {
          	   if(value) 
          	   		{
			   		jsFind(id,{ remind: 15 });
				    setTimeout(function(){ jsRefreshTree(); jsPlaceMakedone(id); },300);
          	   		}
          	   else 
          	   		{
			   		jsFind(id,{ remind: 0 });
				    setTimeout(function(){ jsRefreshTree(); jsPlaceMakedone(id); },300);
          	   		}
          	   }
          	   
          	   
          	if(id_element == "on_off_share") //поделиться
          	   {
          	   if(value) 
          	   		{
          	   		$(".makesharediv").slideDown(200,function(){ if( parseInt($("#makesharestat_count span").text(),10)>0 ) $("#makesharestat_count").show(); });
          	   		$("#makeshare").focus().select();
					jsStartShare(id,1);
          	   		console.info("share_on!!!",is_rendering_now);
          	   		jsTitle("Нажмите ctrl+c, чтобы скопировать ссылку в буфер", 10000);
          	   		}
          	   else 
          	   		{
					$("#makesharestat_count").hide();   
					jsStartShare(id,0);
          	   		$(".makesharediv").slideUp(200);
          	   		}
          	   }
          	   
			jsPlaceMakedone(id);
          	} });
	$(".makedone").hide();


//$(".on_off2").is(":checked");
//onChange: function(element,value) { console.info( value.toString() ); }

setTimeout(function(){
	
	  jsGetAllMyNotes();
	  num = 13;
	  $(".makedonecalendar").datepicker({
			numberOfMonths: num,
			/*defaultDate:currentdate,*/
			showButtonPanel: false,
			dateFormat:"dd.mm.yy",
			showWeek:true,
			beforeShowDay : function(date) {
			  highlight_class = "ui-has-note";
			  finddate = jsDiaryFindDateDate(date);
			  if( finddate[0] ) highlight_class = 'ui-has-note';
			  else highlight_class = "";
			  
			  return [true, highlight_class, finddate[1]];
			  },
			
			onSelect:function(dateText, inst) 
			  { 
			  				my_time_id = $(".makedone").attr("myid");
			  				
			  				dd = dateText.split('.');
			  				
			  				date1 = dd[2]+'-'+dd[1]+'-'+dd[0];
						 	myold_date = $("#makedatetime").datetimeEntry('getDatetime').toMysqlFormat();
						 	
						 	my_dd = myold_date.split(" ");
						 	
						 	new_date = date1+" "+my_dd[1];
							mydate = Date.createFromMysql(new_date);
						    $("#makedatetime").datetimeEntry("setDatetime",mydate);
							$( ".makedonecalendar" ).multiDatesPicker('resetDates'); //снимаю выделение
			  }
			});			
	},200);	

	var maketimer;
	 //дата и время - поле ввода в панели makedone
	 $("#makedatetime").datetimeEntry({datetimeFormat: "W N Y / H:M",spinnerImage:""}).change(function()
	 			{
	 			clearTimeout(maketimer);
	 			if(!$("#makedate").is(":visible") ) return true;
	 			maketimer = setTimeout(function()
	 				{
			  		my_time_id = $(".makedone").attr("myid");
				 	mydate = $("#makedatetime").datetimeEntry('getDatetime');
	 			    $('.makedonecalendar').datepicker("setDate",mydate);
				 	my_current_date = mydate;
				 	date1 = mydate.toMysqlFormat();
				 	if(date1!=jsFind(my_time_id).date1)
				 		{
					 		console.info( date1 );
			  				jsFind(my_time_id,{ date1:date1 });
							jsTitle("Дата и время сохранены",5000);
							$( ".makedonecalendar" ).multiDatesPicker('resetDates'); //снимаю выделение
			  				jsRefreshTree();
			  				jsPlaceMakedone(my_time_id);
			  				jsCalendarNode(my_time_id);
			  			}
			  		},400);
				});

	 //нажатие на кнопку вызова меню настройки элемента
	 //mousedown быстее, чем click
	 $('#mypanel').delegate(".tcheckbox","click", function (e)
	   {
	   	console.info("tcheckbox mousedown");
//	   	e.preventDefault();
	   	is_rendering_now = true;
//	   	setTimeout(function(){ is_rendering_now = false; },100);
	   	
	   var id = api4tree.node_to_id( $(this).parents("li").attr("id") );
	   	   
	   if(!$("#mypanel #node_"+id).hasClass("selected")) api4panel.jsTitleClick($(this).nextAll(".n_title"));
	   		   
	   if( $(this).parents("#mypanel").length || $(this).parents(".search_panel_result").length )
	   	   {
	   	   jsPlaceMakedone(id);
			  $("#mypanel").scroll(function()
			  		{
			    	if($(".makedone").is(":visible")) 
			    		jsPlaceMakedone( $(".makedone").attr("myid") );
			    	});
			  $(".panel").scroll(function()
			  		{
			    	if($(".makedone").is(":visible")) 
			    		jsPlaceMakedone( $(".makedone").attr("myid") );
			    	});
	   	   
		   }
		
		
	   var element = api4tree.jsFind(id);

	   date1 = element.date1;
	   
	   if(date1=="")  //устанавливаю дату
	   	  { 
	   	  mydate = new Date(); 
	   	  mydate = new Date(mydate.getTime()+60*60000); //новые дела - по умолчанию через час
	   	  $("#makedate").hide();
		  if($("#on_off_date").prop("checked")==true)
		  		{ 
				  $("#on_off_date").prop("checked",false); $("#on_off_date").iphoneStyle("refresh");
				}
	   	  }
	   else
		  {
		  mydate = Date.createFromMysql(date1);
	   	  $("#makedate").show();
		  if($("#on_off_date").prop("checked")==false)
		  		{ 
				  $("#on_off_date").prop("checked",true); $("#on_off_date").iphoneStyle("refresh");
				}
		  }
		$("#makedatetime").datetimeEntry("setDatetime",mydate);

	   if(element.did=="")  //устанавливаю переключатель выполнения дела
	   	  { 
		  if($("#on_off_did").prop("checked")==true) 
		  		{ 
		  		$("#on_off_did").prop("checked",false); $("#on_off_did").iphoneStyle("refresh");
		  		}
	   	  }
	   else
		  {
		  if($("#on_off_did").prop("checked")==false) 
		  		{ 
				  $("#on_off_did").prop("checked",true); $("#on_off_did").iphoneStyle("refresh");
				}
		  }

	   if(parseInt(element.remind,10)==0)  //устанавливаю переключатель SMS напоминалки
	   	  { 
		  if($("#on_off_sms").prop("checked")==true) 
		  		{ 
		  		$("#on_off_sms").prop("checked",false); $("#on_off_sms").iphoneStyle("refresh");
		  		}
	   	  }
	   else
		  {
		  if($("#on_off_sms").prop("checked")==false) 
		  		{ 
				  $("#on_off_sms").prop("checked",true); $("#on_off_sms").iphoneStyle("refresh");
				}
		  }
		
		jsStartShare(id);
		
		return false;
	   });
		



	
//	autosave_timer = setTimeout(function() { jsRefreshDo(); },5000 );

	$("body").delegate(".divider","click",function()
		{
		return false;
		});
		
	$("#mypanel").delegate(".makedate,.date1","click",function()
		{
		if($(this).hasClass("fromchildren")) 
			{
			id=$(this).attr("myid");
			api4panel.jsOpenPath(id);
			return false;
			}
		else
			{
			$(this).parent("li").find(".tcheckbox").click();
			}
		return false;		
		}); //date1 click
		
		
	$("body").delegate(".open_calendars","click",function()
		{
		$(this).toggleClass("active");
		if( $(this).hasClass("active") )
			{
			jsGetAllMyNotes();
			if(!$(".diary_calendar").hasClass("hasDatepicker")) 
			  {
			  currentdate = new Date();		
			  $(".diary_calendar").multiDatesPicker({
					numberOfMonths: num,
					defaultDate:currentdate,
					showButtonPanel: false,
					dateFormat:"dd.mm.yy",
					showWeek:true,
					onSelect:function(dateText, inst) 
					  { 
					  mydates = $( ".diary_calendar" ).multiDatesPicker('getDates');
					  $( ".diary_calendar" ).multiDatesPicker('resetDates'); //снимаю выделение
					  need_date = mydates[0];
					  need_date = need_date.split(".");
					  
					  mydate = new Date(need_date[1]+"."+need_date[0]+"."+need_date[2]);
					  jsDiaryPath( mydate+1 );
					  console.info(mydate);
					  }
					});
		 	  $(".diary_calendar .ui-icon-circle-triangle-w").click(); //перематываю на один месяц назад
			  }
			
			$(".diary_calendar").slideDown(300, function() { $(".redactor_editor").css({bottom:210}); } );
			$(".diary_arrow").show();
			}
		else
			{
			$(".redactor_editor").css({bottom:27});
			$(".diary_calendar").slideUp(300);
			$(".diary_arrow").hide();
			}
		return false;
		});
	

	$("body").delegate(".fullscreen_button","click",function()
		{
		panel = $(this).parent("div");
		if(!panel.hasClass("fullscreen")) 
			{
			panel.addClass("fullscreen");
			$(this).addClass("icon-resize-small");
			}
		else 
			{
			panel.removeClass("fullscreen");
			$(this).removeClass("icon-resize-small");
			}
		onResize();
		return false;
		})

	//клик в быстрые табы
	$('.basket_panel,#fav_tabs,#fav_tabs + .favorit_menu,.tree_history,.search_panel_result').delegate("li","click", function () {
		api4panel.jsOpenPath( $(this).attr("myid") );
		setTimeout(function(){ jsHighlightText() },1000);
		return false;
		});

    //клик в табы под редактором
	$('#fav_red,#fav_red_mini').delegate("li","click", function () {
		
		id = $(this).attr("myid");
		if(id==-1) id = jsOpenDiary(); //если нужно открыть дневник
		
		api4panel.jsOpenPath( id, 'fav_red' );
		return false;
		});


	$('#add_do_panel').delegate("input","click", function () {
		if(!$(this).hasClass("active"))
			{
			$(this).addClass("active");
			$(this).focus();
		  	document.execCommand('selectAll',false,null);
			}
		last_input_click = jsNow();
		return true;
		});

	$('#search_panel').delegate("input","click", function () {
		$(this).addClass("active");
//	  	$("#wrap").append("<div class='all_screen_click'></div>");
//		$(".search_panel_result").slideDown(500);

		return false;
		});
		
		
	//Клик в LI открывает детей этого объекта LILILI
	$('#mypanel').delegate("li","mousedown", function () {
		if( $(this).find(".ntitle").attr("contenteditable") ) return true;
		console.info("li mousedown");
		var nowtime = jsNow();
		var dif_between_click = nowtime - lastclick;
		lastclick = jsNow();
		
		var isTree = $("#top_panel").hasClass("panel_type1");

		if(isTree)
		  if( (dif_between_click)<150 ) 
			{
			console.info("nowtime-lastclick",dif_between_click);
			var id = api4tree.node_to_id( $(this).attr("id") );
			$(".panel li").removeClass("selected");
			jsOpenNode( id ); //открываю панель
			jsSelectNode( id ,'tree');
			return false;
			}

		
		if( $(this).hasClass('tree-closed') ) 
			{
			id = api4tree.node_to_id( $(this).attr("id") );
			jsOpenNode( id ); //открываю панель
			jsSelectNode( id ,'tree');
			$(this).removeClass("tree-closed").addClass("tree-open");
	
			if( isTree && ($(this).find(".folder_closed").length!=0) )
				{
				$(this).find(".date1").hide();
				timelong = parseInt($(this).find(".countdiv").html(),10)*15;
				if(timelong>1000) timelong=1000;
				if(timelong<300) timelong=300;
				$(this).find("ul:first").slideDown(timelong,function(){ $(this).find(".date1[title!='']").show(); });
				}
			}
		else
			{
			if(isTree)
				{
				$(this).removeClass("tree-open").addClass("tree-closed");
				$(this).find("ul:first").slideUp(100);
				}
			else
				{
				$(this).removeClass("tree-open").addClass("tree-closed");
				id = api4tree.node_to_id( $(this).attr("id") );
				jsOpenNode( id ); //открываю панель
				jsSelectNode( id ,'tree');
				$(this).removeClass("tree-closed").addClass("tree-open");
				}
			}

		$(".highlight").contents().unwrap();
		return false;
		});

		 $('*').undelegate("#add_do", "keyup").delegate("#add_do", "keyup", function(event) 
			{
			if(event.keyCode==27) //отмена добавления нового дела
				{
	  	   		$("#add_do").blur();
  		   		$("#wrap").click(); 
  		   		return false;
  		   		};
			if(event.keyCode==13) //добавление нового дела
				{
				jsAddDo( "new", 599, $("#add_do").val() ); //почему 599?
				jsRefreshTree();
  		   		return false;
  		   		};
  		   		
			clearTimeout(tttt);
			tttt = setTimeout(function(){
			mynewdate = jsParseDate( $("#add_do").val() );
			if( mynewdate.date == "") { $(".header_text").html(""); return true; }
			$(".header_text").html( mynewdate.date.jsDateTitleFull() );
			$(".header_text").attr( "title", mynewdate.date.jsDateTitleFull() );
			jsTitle(mynewdate.title,15000);
			},150);
			return false;
			});

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
     $(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(300);
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
		$(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(300);
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
	$(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(300);
	$.Menu.closeAll();
  	return false;
  	});


     
  $("body").delegate(".m_refresh","click", function () {
    jsSync();
 	jsRefreshDo();
  	return false;
  	});

  $("body").delegate(".m_refresh_all","click", function () {
  	localStorage.clear();
	document.location.href="./index.php";
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
