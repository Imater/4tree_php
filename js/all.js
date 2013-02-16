var tip,hoverout,trtr,old_width=0,old_id_leaf=0,xhr_search, all_tree_data,xhr_load_note,chekout_hide,i_am_scrolling;
var myr = null,mynode,hover_tm,i_am_scroll=1;
var timeout,mt,mt2,timenow=0,mytree,tttt,sel_tm, leaf_count;
var calend;
var bg;
var i_am_busy = true;
var note_saved=true,show_checked=false;
var savecookies,myscroll=-1;
var mycookie = new Number;
var save_cookie=true;
var diarywindow;
var mydates = [false], mypomidor,endtime,my_min;
var old_title = "4tree.ru — мои дела", undo_level = 0;
var show_settings,my_all_data;

mycookie['current_tab'] = 1; //Таб по умолчанию

function jsMakeShortRecur()
{ 
		var weekday=new Array(7);
		weekday[0]="воскресение";
		weekday[1]="понедельник";
		weekday[2]="вторник";
		weekday[3]="среда";
		weekday[4]="четверг";
		weekday[5]="пятница";
		weekday[6]="суббота";

	if( $('select[name=SelectRemindType] option:selected').val()=='1' ) 
		{
		my_col = $("select[name=SelectRemindInterval] option:selected").val();
		if( my_col == 1 )
			text = 'каждую неделю';
		else
			{
			text = 'кажд. '+my_col+' нед.';
			}
		}
	
	n='';
	
	if(!$(".r_week").is(":checked"))
		{
		var d=$("input[name=recur_date1]").datepicker("getDate");
		if(d) var n = ' — '+weekday[d.getDay()];
		}
	else
		{
		n = ' — ';
		i = 0;
		$(".r_week:checked").each(function(){
			myday = $(this).attr('name').replace("w","");
			if(i != 0) mycoma = ', ';
			else mycoma = '';
			n = n + mycoma + weekday[myday];
			i = i + 1;
			});
		if(i==7) n = ' — все дни';
		}
	
	if( $("input[name=recur_end_radio]:checked").val() == 2 ) //если указано кол-во повторений
	  {
	  if($(".recur_col").val() != '') n = n + ', ' + $(".recur_col").val() + ' раз(а)';
	  }

	if( $("input[name=recur_end_radio]:checked").val() == 3 ) //если указана дата повторений
	  {
	  if($("input[name=recur_date2]").val()!='') n = n + ', до ' + $("input[name=recur_date2]").val();
	  }

	$(".recur_label_right b").html(text+n);
	
}

function jsFindParent(parent)
{
	
}


function jsShowTreePanel()
{
lnk = "do.php?get_all_data=1";
$.getJSON(lnk,function(data){

	my_all_data = data;

	jsShowTreeNode(1);
		
	});

}

function jsShowTreeNode(parent_node,data)
{
	data = my_all_data[parent_node];
	
	
	if(parent_node==0) mydata = data;
	else mydata = data;
	iii=0;
	jsLoadNote("node_"+parent_node);
	$.each(mydata, function(i,data)
		{
		  if(iii==0) $("#mypanel").append("<div id='panel_"+parent_node+"' class='panel'><ul></ul></div>");
		  $("#panel_"+parent_node+" ul").append("<li myid='"+data.id+"'>"+data.title+"</li>");
		  iii=iii+1;
	  	});
}


function jsDoOnce()
{

	jsShowTreePanel();
	
	$('#mypanel').delegate("li","click", function () {
		$(this).parents(".panel").next(".panel").remove();
		$(".panel li").removeClass("selected");
		$(this).addClass("selected");
		jsShowTreeNode( $(this).attr('myid') );
		return false;
		});


	$('#search-input').inputDefualts({
		cl: 'inactive',
		text: 'Поиск'
	});

	$.datepicker.setDefaults($.datepicker.regional['ru']);

	$('*').delegate("#recur_panel input,#recur_panel select","change", function () {
		jsMakeShortRecur();
		return false;
		});

	$('#recur_panel').delegate("#s_save","click", function () {

	    $("#s_recur_check").attr("checked","checked");
	    $("#s_recur_label").html('Повторить: ');
	    $("#s_recur_text").html( $(".recur_label_right b").html() );
		
		$("#all_screen").fadeOut('slow');
		return false;
		});


	$('*').delegate(".recur_close,#recur_panel #s_close","click", function (d1,d2) {
		console.info(d1,d2);
		$("#all_screen").fadeOut('slow');
		return false;
		});

	$('*').delegate("#s_recur_check,#s_recur_change","click", function () {
		if($(this).attr('checked')) 
		  {
		  $("#all_screen").fadeIn('slow');
		  return false;
		  }
		else
		  {
	      $("#s_recur_label").html('Повторить…');
	      $("#s_recur_check").removeAttr("checked");
	      $("#s_recur_text").html('');
		  }
		});

		$('.recur_date1').datepicker({numberOfMonths: 1,
            showButtonPanel: true,showOtherMonths:true,selectOtherMonths:true,dateFormat:"dd.mm.yy",changeMonth:true, changeYear:true,onClose:function(date){
		    } });


	$('*').delegate(".s_save","click", function () {
		new_inputs = $("#settings_form").serialize();

		id = $('.jstree-clicked').parent('li').attr('id').replace('node_','');

//			var $txt = $.ajax({type: "POST",url: "do.php", data: mycookie, success: function(t) { } });
		
		$('#bubu').load("do.php?save_do="+id+"&"+new_inputs,function(){
		   $('#calendar').fullCalendar( 'refetchEvents' ); 

		   li_parent = $("#node_"+id).parents("li").attr("id");
		   $("#demo").jstree("refresh",$("#"+li_parent));		   
		   
		   setTimeout(function(){ jsRefreshDate();},300); //обновляю дату в дереве
		   setTimeout(function(){ jsRefreshDate();},2000); //обновляю дату в дереве
		   jsTitle('Параметры дела сохранены');
		   });
		
		return false;
		});


	$('*').delegate("#s_allday","change", function () {
		if($(this).attr("checked")=='checked') {
			$(".s_time1,.s_time2").hide();
		 	}
		else
			{
			if( ($(".s_time1").val()=="00:00") && ($(".s_time2").val() == "00:00") )
				{
				$(".s_time1").val('15:00');
				$(".s_time2").val('16:00');
				}
			$(".s_time1,.s_time2").show();
			}
		
		return false;
	 	});
	 	
	 	
		$('.s_date1').datetimeEntry({datetimeFormat: 'D.O.Y',spinnerImage: ''}); //w - week name
		$('.s_date2').datetimeEntry({datetimeFormat: 'D.O.Y',spinnerImage: ''});
		
		$('.s_date1').datepicker({numberOfMonths: 2,
            showButtonPanel: true,showOtherMonths:true,selectOtherMonths:true,dateFormat:"dd.mm.yy",changeMonth:true, changeYear:true,onClose:function(date){
            if($('.s_date2').val()=='') $('.s_date2').val($('.s_date1').val());
            $('.s_date2').datepicker( "option", "minDate", date );
		    } });
		$('.s_date2').datepicker({numberOfMonths: 2,
            showButtonPanel: true,showOtherMonths:true,selectOtherMonths:true,dateFormat:"dd.mm.yy",changeMonth:true, changeYear:true,onClose:function(date){
		    } });

		$('.s_time1').datetimeEntry({datetimeFormat: 'H:M',spinnerImage: ''});
		$('.s_time2').datetimeEntry({datetimeFormat: 'H:M',spinnerImage: ''});
	


}

function jsShowDoSettings(id)
{
	if(show_settings) { show_settings.abort(); }
	    		
	lnk = "do.php?settings_do="+id;
	
	var show_settings = $.ajax({
	     url: lnk,
	     success: function(data) {
	     
	     		data = jQuery.parseJSON(data);
	     		
	    		$(".s_title").val(data.title);
	    		
	    	if((data.time1 == "00:00") && (data.time2 == "00:00")) 
	    	   	{
	    	   	$(".s_time1,.s_time2").hide();
	    	   	$("#s_allday").attr("checked","checked");
	    	   	}
	    	else
	    	   	{
	    	   	$(".s_time1,.s_time2").show();
	    	   	$("#s_allday").removeAttr("checked");
	    	   	}
	    	
//	    		d1 = new Date(data.date1);
//	    		$(".s_date1").datetimeEntry('setDatetime', d1);
				$(".s_date1").val(data.date1);
	    		$(".s_time1").val(data.time1);
	    		
//	    		d2 = new Date(data.date2);
//	    		$(".s_date2").datetimeEntry('setDatetime', d2);
				$(".s_date2").val(data.date2);
	    		$(".s_time2").val(data.time1);
	    			
	    	  if(false){
	    		$("#s_recur_check").attr("checked","checked");
	    		$("#s_recur_label").html('Повторить: ');
	    		$("#s_recur_text").html('каждый год начиная с 30.10.2012');
	    		}
	    	  else {
	    		$("#s_recur_label").html('Повторить…');
	    		$("#s_recur_check").removeAttr("checked");
	    		$("#s_recur_text").html('');
	    		}
	     

	     
	    }});
	
	
}


function afterLoad()
{
$(".redactor_toolbar").css("opacity",0.7);
$(".fc-header").css("opacity",0.7);

$("#calendar").hover( function(){ $(".fc-header").stop().animate({"opacity":0.7},500); } , function() { $(".fc-header").stop().animate({"opacity":0},500);} );

$("#main_redactor .redactor_box").hover( function(){ $("#main_redactor .redactor_toolbar").stop().animate({"opacity":0.7},500); } , function() { $("#main_redactor .redactor_toolbar").stop().animate({"opacity":0},500);} );

return true;

$("#left_top").hover( function(){ $(".tree_toolbar li").stop().animate({"opacity":0.7},500); } , function() { $(".tree_toolbar li").stop().animate({"opacity":0},500);} );

}


function addRecurring(y,m,d)
{
if(false)
calend.fullCalendar('renderEvent', 
                        {
                            title : 'Повторяющееся событие',
                            start : new Date(y,m,d, 12, 30),
                            end   : new Date(y,m,d, 14, 00),
                            allDay:false
                        });
                        
}



function jsLeafRefresh()
{
if($("#bottom").height()>3) $("#leaf_left_col li[class=current]").click();
} 

var diarywindow;

function modalWin() {
width = 540;
height = 640;

var a = new Date();
var b = a.toISOString().split("T")[0].split("-");
var c = b[2] + "." + b[1] + "." + b[0];

adress="diary.php?days="+c;

if(diarywindow)
if (diarywindow.closed == false) { diarywindow.alert('Дневник открыт'); return; }

if (!window.showModalDialog) {
window.showModalDialog(adress,"4tree-diary","dialogWidth:"+width+"px;dialogHeight:"+height+"px"); } 
else {
diarywindow = window.open(adress,'4tree-diary','height='+height+',width='+width+',toolbar=no,directories=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes ,modal=no');
}
}

var num;

function onResizeDiary(internal)
{
		if($("#diary_calendar").css('display')=='none') cal_height=0;
		else cal_height = $( "#diary_calendar" ).height();

		if(short!=0)
			height_top = 75;
		else
			height_top = 99;

			var height = $("#diary_content1").height() - $(".redactor_toolbar").height()-height_top-cal_height;
			var height2 = $("#diary_content1").height()-height_top-cal_height;
			
					$(".redactor_editor").height(height);
					$(".redactor_box").height(height2);
if(internal!=1)					
 {
 if ($( "#diary_calendar" ).hasClass('hasDatepicker')) 
   {
    ww = $("#diary_content1").width();
    if(ww<800) 
      {
	   $(".redactor_editor").addClass('padding-ten');
      }
    else 
      {
	   $(".redactor_editor").removeClass('padding-ten');
      }
    
    oldnum = num;    
    num = (parseInt(ww/170));
if(oldnum != num)    
    {
    $("#diary_calendar" ).datepicker('destroy');
    myDatePicker(num);
    }

    setTimeout(function()
      { 
      onResizeDiary(1);
	  },50);
   }
 }
	
		var width1 = $("#diary_content1").width()-4;
		$(".ui-datepicker-inline").width(width1);
		
		if($("#diary_calendar").css('display')=='none') height=34;
		else
		  height = $("#diary_calendar").height()+30;
		
		$("#cal_label").css("bottom",height).css("right",width1/2-100);
						
}


function myDatePicker(num)
{
//  $( "#diary_calendar" ).datepicker('distroy');
  $( "#diary_calendar" ).multiDatesPicker({
			numberOfMonths: num,
			showButtonPanel: false,
			dateFormat:"dd.mm.yy",
			showWeek:true,
			onSelect:function(dateText, inst) 
			  { 
			  mydates = $( "#diary_calendar" ).multiDatesPicker('getDates');
			  jsLoadNoteDiary(1,mydates); 
	  		  onResizeDiary(0);
			  }
		});
}

function jsDoFirstDiary()
{ 
  $.ajaxSetup({cache:false});

  myDatePicker(3);		
		
  myr = $('#redactor_content').redactor({ imageUpload: './redactor/demo/scripts/image_upload.php', lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php', autoresize:false, 
  			buttonsAdd: ['|', 'button1'], 
            buttonsCustom: {
                button1: {
                    title: 'Спойлер (скрытый текст)', 
                    callback: function(obj, event, key) 
                      { 
                      console.info(obj,event,key);
					  myr.execCommand('insertHtml',"<p><div class='spoiler_header'><b>&nbsp;Скрытый текст&nbsp;<br></b></div><div class='spoiler' style='display: block; '><div>Скрытый<br>текст</div></div></p>&nbsp;");
                      }  
                }
            }
     });
  
  
  $(".redactor_toolbar").animate({"opacity":0.7},500);
  
  onResizeDiary();
 
  jsLoadNoteDiary("node_665");

  $('*').delegate(".spoiler_header","click", function ()
    {
    $(this).next('.spoiler').slideToggle('fast');
      	
    return false;
    });

  
  $('*').delegate("#cal_label","click", function ()
    {

if(!($("#diary_calendar").css('display')=='none')) 
    {
    $("#diary_calendar").slideUp(300,function(){
	    onResizeDiary(0);
       });
    }
 else
    {
    $("#diary_calendar").slideDown(200,function(){
	    onResizeDiary(0);
       });
    }
    return false;
    });
  
  
function getDays(year, week) {
    var j10 = new Date(year, 0, 10, 12, 0, 0),
        j4 = new Date(year, 0, 4, 12, 0, 0),
        mon = j4.getTime() - j10.getDay() * 86400000,
        result = [];

    result.push(week+"week");


    for (var i = 0; i < 7; i++) {
    	d = new Date(mon + ((week - 1) * 7 + i) * 86400000);
    	
              
	var b = d.toISOString().split("T")[0].split("-");
	var c = b[2] + "." + b[1] + "." + b[0];
    	
    	
        result.push(c);
    }

    return result;
}  
  

  $('*').delegate(".ui-datepicker-week-col","click", function ()
    {
    //выбор всей недели
	weeknumber = $(this).html();    
	year = $(this).parents(".ui-datepicker-group").find(".ui-datepicker-year").html();
	mydates = getDays(year,weeknumber);
	$(".ui-datepicker-week-col").css("background-color","");
	$(this).css('background-color',"#336a22");
	jsLoadNoteDiary(1,mydates); 
	onResizeDiary(0);
    
    
    return false;
    });

  $('*').delegate("#prev,#next","click", function ()
    {
    
	var str = mydays;
	var dmy = str.split(".");
	
    if($(this).attr('id')=='prev') {
		var d = new Date(dmy[2], dmy[1] - 1, parseFloat(dmy[0])-1,12,12);    
       }
    else
       {
		var d = new Date(dmy[2], dmy[1] - 1, parseFloat(dmy[0])+1,12,12);    
       }
              
	var b = d.toISOString().split("T")[0].split("-");
	var c = b[2] + "." + b[1] + "." + b[0];
	
	mydays = c;
	
	mydates = [mydays]
       
    jsLoadNoteDiary(1,mydates);
    return false;
    });

}

function jsLoadNoteDiary(id,mydates)
{

		savetext(1);
		if (short!=0) $("#next,#prev").hide();
	    if (short!=0) { mydates = [short]; guest='_guest';}
	    else guest='';

		var notetext = '';
		
	    
		$.ajaxSetup({async: false});
		var need_h=1;

			  if(null == mydates)
			    {
			    var mydates = [mydays];
			    need_h=0;
			    }
			   if(mydates.length==1) need_h=0;
			    
				mydates.forEach(function(el,i)
				    {
					  mydays = el; 
					  

			 $('#bubu').load("do.php?diary"+guest+"="+mydays,function(){
			 	id = $('mynum').html();
			 	$('mynum').remove();

			 	path = $('path').html();
			 	$('path').remove();

			 	path2 = $('path2').html();
			 	$('path2').remove();
			 	

			 	if (short!=0) { window.document.title=path; $("#diary_header #d_header").html(path); }
			 	else $("#diary_header #d_header").html(path);
			 	
			    notetext = notetext + jsShowText( id , $('#bubu').html(), need_h,path2 );
			    $("#"+id).html(path);
				});



					});

				$('#redactor_content').attr('notes',id);
		  		$('#redactor_content').setCode(notetext);
		  		
		  		setTimeout(function(){
					$(".redactor_editor a").hover( function() { console.info(1); $(this).attr('contenteditable','false'); }, function() { $(this).attr('contenteditable','true'); console.info(0); });
		  		  	},2000);


		  
		$.ajaxSetup({async: true});
		  

}





function jsLeafCount()
{

clearTimeout(leaf_count);
leaf_count = setTimeout( function()
  {
   $.getJSON( "do.php?leaf_count=888" ,function(data)
	{
	var i=1;
	$.each(data, function(i,data)
		{
        amount = data.amount[0];
        $('#r'+i).html(amount);
        i=i+1;
        });
    });
   },200);

}


function PrintIt(stext){
    var ua=navigator.userAgent;
    var ie=/MSIE/.test(ua);
    wnd=window.open("", "tinyWindow", 'statusbar=no,toolbar=no,scrollbars=yes,resizable=yes,width=630,height=900');
    wnd.document.write("<html><title>4tree — мои дела</title><head><link href=\"css/print.css\"rel=\"stylesheet\"type=\"text/css\" media=\"all\"/><link rel=\"stylesheet\" href=\"css/styles.css\" type=\"text/css\"></style><link rel=\"stylesheet\" href=\"./redactor/redactor/redactor.css\" /><link rel='stylesheet' type='text/css' href='./fullcalendar-1.5.3/fullcalendar/fullcalendar.css' /></head><body onclick=\"window.close()\"><div id=\"watermark-top\"></div>");
    wnd.document.write(stext);
    if (!ie){
    wnd.document.write("<div id=\"watermark-bottom\">4tree.ru</div><body></html>");
    wnd.print();
    }else{
    wnd.document.write("<script>window.onload=self.print();<\/script></body></html>");
    wnd.location.reload()
    }
}


//v1 - название переменной, v2 - значение
function jscookie(v1,v2,v3)
{

if(!v2) { return mycookie[v1]; }
else 
  { 
  if(save_cookie)
     {
	  mycookie[v1] = v2;
	  clearTimeout(savecookies);
	  savecookies = setTimeout(function()
	     {
	  		//Сохраняю кукис с открытыми ветками
			var $txt = $.ajax({type: "POST",url: "do.php", data: mycookie, success: function(t) { } });
		 },10000);
	 }

  }
}

jQuery.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};

function jsRefreshTree()
{
var old_li = $("#li_temp").prev('li').attr('id');

$("#demo").jstree('refresh',-1,function()
  	{
	$(".second_ul").append($("<div id='li_temp'>"));
  	if(new_cookie_name!=1)
  	  {
		$("#node_"+new_cookie_name).swapWith("#li_temp");
		$(".main_ul").hide();
		$(".second_ul").show();
	  }
	 myscroll = jscookie(n_id+'_scroll');
	 setTimeout( function() { $('#demo').stop().scrollTop( myscroll ); myscroll=-1; }, 55);
	 jsTitle("Дерево обновлено");
	});
}

function jsFocus(n_id)
{
	$("#demo").jstree("deselect_all");
	
	save_cookie = false;
	parent = $(".second_ul").children('li').attr('id');
	$("#"+parent).swapWith("#li_temp");

  if(n_id!=1) //Если нужно фокусироваться на элементе
    {
	$(".main_ul").hide();
	$(".second_ul").show();
		     
	$(".second_ul ul").height('auto');

	$("#node_"+n_id).swapWith("#li_temp");
	
	$('#demo').jstree('show_cookie');
	to_open  =  mycookie[new_cookie_name+'save_opened'];
	$(".second_ul li[class*='jstree-open']").each(function()
	  {
	  the_id = $(this).attr('id');
	  if(to_open.indexOf(the_id)==-1) $('#demo').jstree('close_node',$("#"+the_id),false);
	  });

	}
  else
    {
	$(".main_ul").show();
	$(".second_ul").hide();
//	$('#demo').jstree('close_all',[],false);
	setTimeout(function(){
		$('#demo').jstree('show_cookie');
	to_open  =  mycookie[new_cookie_name+'save_opened'];
	$(".main_ul li[class*='jstree-open']").each(function()
	  {
	  the_id = $(this).attr('id');
	  if(to_open.indexOf(the_id)==-1) $('#demo').jstree('close_node',$("#"+the_id),false);
	  });
		
		
		},30);
    }
	

    myscroll = jscookie(n_id+'_scroll');
						
    setTimeout( function() { $('#demo').stop().scrollTop( myscroll ); myscroll=-1; }, 55);

	setTimeout(function(){ save_cookie=true; },100);

}

function jsPathOfNode(id)
{
					var idtext2 = '';
					nodes = $("#demo").jstree("get_path",$("#"+id),true);
					for(i=0; i<nodes.length; i=i+1)
						{
						idtext2 = idtext2  + $("#demo").jstree("get_text",$('#'+nodes[i]));
						if(i<nodes.length-1) idtext2 = idtext2 + ' → ';
						if(i==nodes.length-2)  idtext2 = idtext2 + "<br><h2>";
					    };
					return idtext2;
}

function jsShowText(id,text,need_h,path)
{
ph = jsPathOfNode(id);
if (path) ph = path;

if(need_h==1) mytext = '<div class="divider" contenteditable="false" id="'+id+'">'+ph+'</h2></div><div class="edit_text"><p>';
		  		 else mytext='';
		  		 if (text == '') { $('#bubu').html('&nbsp;'); text = "&nbsp;"; };
			     notetext = mytext + text + '</p></div>';	
			     return notetext;
}



function jsLoadNoteUndo(id)
{
//		savetext(1);
		var notetext = '';
		
		console.info('loadUndo',id);
	    
		$.ajaxSetup({async: false});
		var need_h=0;
	    if ($('.jstree-clicked').length>1) need_h=1; //Если кликнуто несколько дел, нужны заголовки
	    
		$('.jstree-clicked').each(function()
		  {
		  id = $(this).parent('li').attr('id');

		  lsn = localStorage.getItem( "note_"+id );
//		  console.info(lsn);
//		  lsn = false;
		  
		  if(!lsn) //если нужно загрузить из интернета
			 $('#bubu').load("do.php?notes="+id+"&undo_level="+undo_level,function(){
			    notetext = notetext + jsShowText( id , $('#bubu').html(), need_h );			    
				});
		  else //если уже есть такая заметка в буфере
		    {
		    notetext = notetext + jsShowText( id , lsn, need_h );
		    }
		  
		  });

		$.ajaxSetup({async: true});

		  $('#redactor_content').attr('notes',id);
		  $('#redactor_content').setCode(notetext);
		  

}


function jsLoadNote(id)
{
		undo_level=0;
		savetext(1);
		var notetext = '';
		
	    
		var need_h=0;
	    if ($('.jstree-clicked').length>1) 
	       { 
	       need_h=1; 
		   $.ajaxSetup({async: false});
	       } //Если кликнуто несколько дел, нужны заголовки 
	    
		$('.jstree-clicked').each(function()
		  {
		  id = $(this).parent('li').attr('id');

		  lsn = localStorage.getItem( "note_"+id );
//		  console.info(lsn);
//		  lsn = false;
		  
		  if(!lsn) //если нужно загрузить из интернета
		    {
				if(xhr_load_note) { xhr_search.abort(); alert('abort'); }
							
				lnk = "do.php?notes="+id;
				var xhr_load_note = $.ajax({
							            url: lnk,
							            success: function(data) {
											localStorage.setItem( "note_"+id ,data); //сохраняю внутри браузера
										    notetext = notetext + jsShowText( id , data, need_h );
								 			$('#redactor_content').attr('notes',id);
		  									$('#redactor_content').setCode(notetext);
									  		setTimeout(function(){
												$(".redactor_editor a").hover( function() { console.info(1); $(this).attr('contenteditable','false'); }, function() { $(this).attr('contenteditable','true');  });
									  		  	},2000);
									    }});
			}
		  else //если уже есть такая заметка в буфере
		    {
		    notetext = notetext + jsShowText( id , lsn, need_h );
		    }
		  
		  });

		$.ajaxSetup({async: true});

		  $('#redactor_content').attr('notes',id);
		  $('#redactor_content').setCode(notetext);

		  		setTimeout(function(){
					$(".redactor_editor a").hover( function() { console.info(1); $(this).attr('contenteditable','false'); }, function() { $(this).attr('contenteditable','true');  });
		  		  	},2000);
		  

}

function jsMakeTabWidth()
{
	  w = parseInt($("#cont").width());
	  count = parseInt($("#cont2 a").length);
	  w2 = parseInt($("#cont2 li").width());
	  
	  
	  w_tab = parseInt(w/(count)-38);
	  
	  if(w_tab<30) 
	  	{ 
	  	if (w_tab<20) 
	  		{ 
		  	w_tab = parseInt(w/(count)-12);
		var letters = parseInt(w_tab/4);
		$("#tabs a .ff").each( function() { $(this).html( $(this).parents('a').attr('title').substr(0,letters) ); } );
	  		$("#tabs").css('font-size','7px'); 
	  		$("#tabs a").css('padding','4px 4px'); 
	  		}
	  	else 
	  		{
		var letters = parseInt(w_tab/3);
		$("#tabs a .ff").each( function() { $(this).html( $(this).parents('a').attr('title').substr(0,letters) ); } );
	  		$("#tabs a").css('padding','4px 15px'); 
	  		$("#tabs").css('font-size','8px');
	  		}
		
	  		
	  	$("#cont2 img").hide(); 
	  	}
	  else 
	  		{ 
		  	w_tab = parseInt(w/(count)-47);
		  	var letters = parseInt(w_tab/5.2); //кол-во букв
		  	$("#tabs a .ff").each( function() { $(this).html( $(this).parents('a').attr('title').substr(0,letters) ); } );

	  		$("#cont2 img").show(); $("#tabs").css('font-size','10px'); 
	  		$("#tabs a").css('padding','4px 15px'); 
	  		}

	  
	  if(w_tab>90) w_tab=90;

	  $("#cont2 a").css('width',w_tab);
	  
		$("#cont2").show();
	  
	  return true;
	  
	  $("#tabs").hide();
	  var fontsize=10;
	  $("#tabs").css('font-size',fontsize+"px");
	  
	  while($("#tabs").height()>20)
	    {
	     //console.info(fontsize);
	     if (fontsize<=7) { $("#tabs a img").hide(); }
	     else $("#tabs a img").show();

	     $("#tabs").css('font-size',fontsize+"px");
	     fontsize=fontsize-1;
	    }

}

function jsRefreshTabs()
{

	jsLeafRefresh();
	current_tab = $("#cont2 li[id=current] a").attr('myid');
	if (!current_tab) { current_tab = jscookie("current_tab"); }
	font = $("#tabs").css('font-size');
	width = $("#cont2 a").css('width');
	padding = $("#cont2 a").css('padding');
	
	$('#cont2').load("do.php?mytabs="+current_tab,function()
	  {
	  $("#tabs").css('font-size',font);
	  $("#cont2 a").css('width',width);
	  $("#cont2 a").css('padding',padding);
	  onResize();
	  $('* #tabs').sortable({ axis: "x",stop : function(event,ui)
	     {
	     order = '';
	     $("#tabs li a").each(function(){
	     	order = order + $(this).attr("myid")+',';
	     	});

		 lnk = "do.php?mytabs_order="+encodeURIComponent(order);
		 $.getJSON(lnk,function(data) { jsTitle('Новый порядок закладок зафиксирован'); });
	     
	     } });
	  });
	
}




function jsMakeDeltaWidth()
{
			my_right = $('#right').width();
			my_width = $('#content1').width();
			var delta = my_width - old_width;
		if (old_width>0)
		    {
			neww = my_right + parseInt(delta/2);
			if(neww<480) neww = 480;
			$('#right').css('width',neww);
			$('#page').css('width',neww);
			$('#left').css('margin-right',neww);
			$.cookie('width',neww,{ expires: 300 });
			}
			old_width = my_width;
}

function onResize()
{
	clearTimeout(mt2);
	mt2 = setTimeout(function()
			{
			
			jsMakeTabWidth();
	  		  
			jsMakeDeltaWidth();			

		  	my_top_settings = $("#settings_do").height();

		   	$('#top').css("bottom",$("#bottom").height());


		if($.cookie('swap_calendar')!=1)
		   {
			var height = $("#left_bottom2").height() - $(".redactor_toolbar").height()-32;
			var height2 = $("#left_bottom2").height();
		   }
		else
			{
			var height = $("#top").height() - $("#main_redactor .redactor_toolbar").height()-32-23-my_top_settings;
			var height2 = $("#top").height()-my_top_settings;
//			alert(height);
			}

			if (!$("#main_redactor .redactor_box").hasClass("redactor_box_fullscreen"))			
					{
					$(".redactor_editor").height(height);
					$(".redactor_box").height(height2);
					}
			else
					{
					$(".redactor_editor").height(height-my_top_settings);
					$(".redactor_box").height(height2-my_top_settings);
					}
//		  	$("#top").css("top",my_top_settings);


			tree_height=parseFloat($("#left_top").height());
			toolbar_height=parseFloat($(".tree_toolbar").height());
			$("#demo").height(tree_height-toolbar_height);

			
//			alert($("#left_bottom2").height());
		if($.cookie('swap_calendar')!=1)
			calheight=parseFloat($("#top").height())-my_top_settings+10;
		else 
			calheight=parseFloat($("#left_bottom2").height());
			
			newheight=calheight-35;
			$('#calendar').fullCalendar('option','contentHeight', newheight);
			$('#calendar').fullCalendar( 'rerenderEvents' );

			jsSetTimeNow();

			},50);
			

}

function jsMakeDateSearch()
{
				$(".search_el").each(function(){
					 $(this).children(".r").remove();
					 $(this).children(".bell,.bell-no").remove();
					 id = $(this).attr("el_id");
					 date_tmp = $(this).attr("date1");
					 
					 if(date_tmp)
					   {
					 	date1 = jsMakeDate(date_tmp,$(this).attr("remind"));
				     	$(date1).prependTo($(this));//добавляю поля даты и времени
				       }
				     
				     });

}

function jsRefreshDate(node)
{
	jsLeafCount();

	if (node)	
	  {
		node="[id=node_"+node+"]";
	  }
	else node="";
		
				$("#demo li"+node).each(function(){
					 $(this).children(".r").remove();
					 $(this).children(".bell,.bell-no").remove();
					 id = $(this).attr("id");
					 date_tmp = $(this).attr("date1");
					 
					 if(date_tmp)
					   {
					 	date1 = jsMakeDate(date_tmp,$(this).attr("remind"));
				     	$(date1).prependTo($(this));//добавляю поля даты и времени
				       }
				     
				     });

}

function jsSetTimeNow()
{
		cur_view = calend.fullCalendar('getView').name;
		
		
		if ((cur_view=='agendaWeek') || (cur_view=='agendaDay'))
			$("* #time_now_to").each(function(){
				if ($(this).children('.fc-mynow').html()==null)
				   $('<div class="fc-mynow"></div>').prependTo(this);
				   
		if (cur_view=='agendaWeek')
		           {
		           if($('.fc-today').height()) myl = $('.fc-today').offset().left;
		           else { myl=0; $('.fc-mynow').remove(); }
		           
				   if($.cookie('swap_calendar')==1)
		           swap = 1;
		           else
		           swap = $('#left_top').width()+1;
		           
				   myleft=myl-$('.fc-agenda-axis').width()-3-swap-23+7;
				   if($('#top').hasClass('fullscreen')) myleft=myl-2;
				   if($('#left_bottom2').hasClass('fullscreen')) myleft=myl-swap-3;
				   
				   mywidth=$('.fc-today').width();
				   }
		if (cur_view=='agendaDay')
		           {
		           myleft=$('.fc-agenda-axis').width()+7;
				   mywidth='100%';
				   }
				   
				   $(this).children('.fc-mynow').css('top',0).css('width',mywidth).css('left',myleft);
				   
				   
				currentTime=new Date;
				tim=currentTime.getHours() + currentTime.getMinutes()/60;
				timenow=$(this).height()/24*(tim);
				$(this).children(".fc-mynow").css({"top": timenow});
				   
				   });

}

function showLeaf(leaf_id)
{
	  if (leaf_id==old_id_leaf) { old_id_leaf = 0; $("#leaf_close").click(); return false; }
	  $('#leaf_div #leaf_output').load("do.php?leaf="+leaf_id,function(){
			old_id_leaf = leaf_id;	  		
	  		$(".do_line").draggable({
				zIndex: 999,
				revert: false,      // will cause the event to go back to its
				helper:"clone",
				revertDuration: 500  //  original position after the drag
			});
				  		
			$("#leaf_output .rrr").each(function(){
				$(this).html( jsMakeDate2($(this).html(),'0000-00-00 00:00:00'));
			    });
	  		
	  		});
}

function showSettings(leaf_id)
{
	  $('#settings_div #leaf_output').load("do.php?settings="+leaf_id,function(){
	  		
	  		});
}

var myadd=0;
var dots=":";

function RestMin(restsec)
{
min = parseInt(restsec/60);

sec = parseInt(restsec-min*60);

	     if (sec<'10') my_nul = '0';
	     else my_nul = '';


answer = min + dots + my_nul + sec + " — осталось";

return answer;
}


function goPomidor()
{
      var now = new Date().getTime();
      finishtime = parseInt(endtime)+(-my_min*60*1000);
      resttime = (finishtime-now)/1000;

      if(!resttime) { clearTimeout(mypomidor); return false; }

	  if (resttime<0) { $("#pomidoro_icon i").removeClass("pomidor_now"); jscookie("pomidor_id","0"); return true; }


$("#pomidor").css("opacity","1");

var snd3 = new Audio("img/tick2.mp3"); // buffers automatically when created

snd3.play();

var snd = new Audio("img/bell.wav"); // buffers automatically when created

	  //Сохраняю параметры, чтобы при перезагрузки сайта таймер тикал дальше
	  if($(".pomidor_now").attr('id')) 
	    {
	    id = parseInt( $(".pomidor_now").attr('id').replace("p","") );
	    jscookie("pomidor_id",id);
	    }
	  else
	    {
	    jscookie("pomidor_endtime","0");
	    }
	  jscookie("pomidor_endtime",endtime);
	  jscookie("pomidor_my_min",my_min);
	  
	  


mypomidor =
   setInterval(function(){
      var now = new Date().getTime();
      finishtime = parseInt(endtime)+(-my_min*60*1000);
      resttime = (finishtime-now)/1000;
	  document.title=RestMin(resttime);
      
	  $("#pomidor_scale").css("margin-left",parseInt(-resttime*513/80/60));

	  if ((parseInt(resttime)==15)) snd3.play();

	  if (resttime<0) { 
	     document.title=old_title; 
	     $("#pomidor_scale").css("margin-left",0); 
	     my_min3 = -my_min;

		 my_min2 = my_min3 - parseInt(my_min3/10)*10;
		 
		 
	     if((my_min2==2) || (my_min2==3) || (my_min2==4)) { word_end = 'ы'; word_end2 = 'у'; }
	     else { word_end = ''; word_end2 = 'у'; }
	     if((my_min2==1)) { word_end = 'а'; word_end2 = 'ё'; }
	     
		 snd.play();
	     if($("#pomidoro_icon i").hasClass("pomidor_now")) {

		        id = parseInt( $(".pomidor_now").attr('id').replace("p","") );
		        if (id==8) id=0;
		        id = id+1;
		        text = $("#p"+id).attr("text");
		        
		        joke_id = parseInt(Math.random()*pomidor_text.length);
		        
		        if($("#p"+id).attr("time")!="-25") 
		           { 
		           joke = pomidor_text[joke_id]+".\n\n"; 
				   $('#bubu').load("do.php?add_pomidor",function()
		  	      		{  
		  	      		diarywindow.document.location.reload(); //обновляю дневник
		  	      		});
		           
		           }
		        else joke="";

		     if (confirm(joke +text+ "\n\nЗапустить таймер Pomodoro?")) 
		        {		        
			    $("#pomidoro_icon i").removeClass("pomidor_now");
		        $("#p"+id).addClass("pomidor_now").click();
		        
		        }
		     else
		        {
			    $("#pomidoro_icon i").removeClass("pomidor_now");			    
			    clearInterval(mypomidor); return; 
		        }
	       }
	     else
	       {
	       alert('Вы просили напомнить, когда пройд'+word_end2+'т '+(my_min3)+' минут'+word_end+'.'); 
		   clearInterval(mypomidor); return; 
		   }
	     }
   	  
      },1000)

}


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
var startX=0;

function jsMakeScroll()
{

//				$('#slot_scroll').jScrollPane();

}

var old_clicked;

function jsDoFirst()
{
//	jsShowDoSettings();
	
//	jsDoOnce();
		
//	setTimeout(function(){ $("#s1").click(); },200);
	
	$("#demo").show();
	
	$("#demo").scroll(function() 
	   {
	   clearTimeout(i_am_scrolling);
	   i_am_scrolling = setTimeout(function(){
	   		   jscookie(old_cookie_name+"_scroll",$('#demo').scrollTop());
			   console.info(1);
			  },2000);
	   } );
	
	
	if($.cookie('height')==null) { $.cookie('height',300,{ expires: 300 }); }
    if($.cookie('swap_calendar')==null) { $.cookie('swap_calendar',1,{ expires: 300 }); }
	
	$('*').delegate(".s_tab","click", function ()
	   {
	   mydiv = $(this).next(".s_content");
	   $(".s_content").not(mydiv).slideUp(300);
	   mydiv.slideToggle(300,function(){ onResize(); });
	   return false;
	   });
		

	$('*').delegate(".zoom_out,.zoom_in","click", function ()
	   {
	   console.info(111);
	   fontsize = parseInt( $("#demo").css("font-size") );
	   
	   if($(this).hasClass("zoom_out"))  
	     {
	     fontsize = fontsize-1;
	     }
	   else 
	     {
	     fontsize = fontsize+1;
	     }
	    
	   if(fontsize<5) fontsize=5;
	   if(fontsize>25) fontsize=25;
	    
	   $("#demo").css("font-size",fontsize);  
	   
	   return false;
	   });


	$('*').delegate(".search_el","click", function ()
	   {
					
				i_am_scroll=0;
				
				event.id = $(this).attr('el_id');
				event.path = $(this).attr('path');
				console.info(event.id);

				my_id = $("#tabs li[id=current] a").attr('myid');
				if(my_id!=1) ul = ".second_ul";
				else ul = ".main_ul";
				
				if(!$(ul+" #node_"+event.id).length) 
				   {
				   //сюда добавить кнопку "вернуться"
				   if(my_id!=1) { $("#tabs a[myid=1]").click(); }
				     path = event.path;
				     path = path.split(',');
				     
				     for(i=0; i<path.length; i=i+1)
				     	{
				     	toopen = path[i];
				     	$("#demo").jstree("open_node",$("#node_"+toopen),false);
				     	}
				   
				   }
				
				   $('#demo').jstree('deselect_all');
				   $('#demo').jstree('select_node',$("#node_"+event.id));

	    return false;
		});
	
	$('*').delegate("#mindmap","click", function ()
	   {
		id = $('.jstree-clicked').parent('li').attr('id').replace('node_','');
	    url="mm.php?mindmap="+id;
		window.open(url, '_blank');
		window.focus();
		return false;
	   });
	
	$('*').delegate("#undo_redactor","click", function ()
	   {
		undo_level = undo_level+1;
		jsLoadNoteUndo(undo_level);
		return false;
	   });

	$('*').delegate("#redo_redactor","click", function ()
	   {
		undo_level = undo_level-1;
		if(undo_level<0) undo_level=0;
		jsLoadNoteUndo(undo_level);
		return false;
	   });
	
	$('*').delegate(".shortlink_hover","hover", function ()
	   {
	   selected_id = '';
	   $('.jstree-clicked').each(function() { selected_id = selected_id + $(this).parents('li').attr('id').replace('node_','')+','; });
	   
	   if(old_clicked != selected_id) 
	     {
	     lnk = "do.php?getLink="+encodeURIComponent(selected_id);
		 $.getJSON(lnk,function(data)
					{
					$(".shortlink1").val('http://4tree.ru/'+data.shortlink);
					$(".shortlink2").val('http://4tree.ru/'+data.longlink);
					$(".statistic").html(data.statistic);
					
	   				if ($("#on_off_on").parents(".iPhoneCheckContainer").children(".iPhoneCheckLabelOff").children("span").css("margin-right") =='0px') isOn = true;
			  	    else isOn = false;
	   					
					
					if (data.is_on==1) { if(isOn) $("#on_off_on").click(); }
					else {  if(!isOn) $("#on_off_on").click(); }
					
					});

	     }
	   
	   old_clicked = selected_id
	   return false;
	   });


     vv = $('#on_off_on').iphoneStyle({ checkedLabel: 'включена&nbsp;', uncheckedLabel: 'выключена',         
          onChange: function(elem, value) 
          					{ 
          					s1 = encodeURIComponent($(".shortlink1").val());
          					s2 = encodeURIComponent($(".shortlink2").val());
          					if (value==false) 
          					  {
						      lnk = "do.php?onLink="+old_clicked+"&shortlink="+s1+"&longlink="+s2+"&is_on=0";
							  $.getJSON(lnk,function(data)
									{
		          					 $(".shortlink1,.shortlink2").addClass("linkdisabled");
									});
          					  }
          					else
          					  {
						      lnk = "do.php?onLink="+old_clicked+"&shortlink="+s1+"&longlink="+s2+"&is_on=1";
							  $.getJSON(lnk,function(data)
									{
		          					 $(".shortlink1,.shortlink2").removeClass("linkdisabled");
									});
          					  ///включить ссылку и добавить в базу
          					  }
							} });
							

	 $(".shortlink1,.shortlink2").click( function ()
	   {
	   $(this).select();
	   if ($("#on_off_on").parents(".iPhoneCheckContainer").children(".iPhoneCheckLabelOff").children("span").css("margin-right") =='0px') isOn = true;
	   else isOn = false;
	   
	      $(".shortlink1,.shortlink2").removeClass("linkdisabled");

	   if(isOn)  //включаю поле
	      {
	      $("#on_off_on").click();
	      }
	   return false;
	   });



	    $.ajaxSetup({cache:false});

//		$('#do_date1,#do_date2').datetimepicker();

	
	 setTimeout(function(){ jsMakeScroll(); },2000);

	 $('*').delegate("#pomidoro_icon i","click", function ()
	   {
	    myid=parseInt($(this).attr('id').replace('p',''));
	    
	    $("#pomidoro_icon i").removeClass("pomidor_now");
	    $(this).addClass("pomidor_now");
	    
	    
	    
	    var now = new Date().getTime();
	    endtime = now;
	    my_min = $(this).attr('time');
	    
	    new_x = parseInt(my_min*513/80);
	    $("#pomidor_scale").stop().animate({"margin-left":new_x-5},700);
	    $("#pomidor_scale").animate({"margin-left":new_x},100);
		clearInterval(mypomidor); 		
		goPomidor();
	    
	    
		return false;
	   });
	 $('*').delegate("#left_min,#right_min,#pomidor_timer","click", function ()
	   {
	    $("#pomidoro_icon i").removeClass("pomidor_now");
	    
	    if ($(this).attr('time') == 0) {
			 jscookie("pomidor_endtime","0");
			 jscookie("pomidor_my_min","0");
			 jscookie("pomidor_id","0");
		     if(old_title) document.title=old_title; 
		     $("#pomidor_scale").animate({"margin-left":0},500); 
	    	 clearInterval(mypomidor); return; 
	         }

	    var now = new Date().getTime();
	    endtime = now;
	    my_min = $(this).attr('time');
	    
	    
	    new_x = parseInt(my_min*513/80);
	    $("#pomidor_scale").stop().animate({"margin-left":new_x-5},700);
	    $("#pomidor_scale").animate({"margin-left":new_x},100);
		clearInterval(mypomidor); 		
		goPomidor();

	   return false;
	   });

  $('#pomidor_scale').mousedown( function(e)
     { 
 		      if(old_title) document.title = old_title;
			  $("#pomidor").css("opacity","1");
     		  clearInterval(mypomidor); 
     		  startX = e.pageX;
     		  startPomidor = parseFloat($("#pomidor_scale").css("margin-left"));
			  e.preventDefault();

		$(window).mousemove(function(e){
			  myX = e.pageX-startX+startPomidor;
			  my_min = parseInt(parseFloat(myX)*80/513);
			  if (-my_min>85) my_min = -85;
			  if (-my_min<0) my_min = 0;
			  new_x = parseInt(my_min*513/80);
			  $("#pomidor_scale").stop().animate({"margin-left":new_x},20);
			  
		    });

  $(window).mouseup( function()
     { 
		$(window).unbind("mousemove");
		$(window).unbind("mouseup");
        startPomidor = parseFloat($("#pomidor_scale").css("margin-left"));
	    var now = new Date().getTime();
	    endtime = now;
		
		clearInterval(mypomidor); 		
		if (startPomidor!=0) goPomidor();
     });

     });








    setTimeout(function(){ onResize(); jsRefreshTabs(); },2000);

	 $('*').delegate("*[hint]","mouseover", function ()
	   {
	   hint = $(this).attr('hint');
	   if (hint) jsTitle(hint,60000);
	   return false;
	   });

	 $('*').delegate("*[hint]","mouseout", function ()
	   {
	   jsTitle('',0);
	   return false;
	   });


$("#main_icons i[toshow='cont']").css("opacity","1");

//setTimeout(function(){ $("#main_icons i[toshow='settings_div']").click(); },200);

$("*").delegate(".do_line", "click", function(event){
		var n_id = $(this).attr('event');
		path = $(this).attr('path');
		
				i_am_scroll=0;

				my_id = $("* #tabs li[id=current] a").attr('myid');
				if(my_id!=1) ul = ".second_ul";
				else ul = ".main_ul";
				
				if(!$(ul+" #node_"+n_id).length) 
				   {
				   //сюда добавить кнопку "вернуться"
				   if(my_id!=1) { $("#tabs a[myid=1]").click(); }
				     path = path.split(',');
					$.ajaxSetup({async: false});
				     
				     for(i=0; i<path.length; i=i+1)
				     	{
				     	toopen = path[i];
				     	$("#demo").jstree("open_node",$("#node_"+toopen),false);
				     	}
					$.ajaxSetup({async: true});
				   
				   }
				
				setTimeout( function()
				   {
				   $('#demo').jstree('deselect_all');
				   $('#demo').jstree('select_node',$("#"+n_id));
				   },1000);
				
		
		
		
		
		return false;
		});



$("*").delegate("#leaf_left_col li", "click", function(event){

	leaf_id = $(this).attr('leaf');
	panel = $(this).parent('div').parent('div').attr('id');
	
	
	if (panel == 'leaf_div') showLeaf(leaf_id);
	if (panel == 'settings_div') showSettings(leaf_id);
	
	$('#'+panel+' #leaf_left_col li').removeClass('current');
	$(this).addClass('current');
	return false;
    });
    
$("*").delegate("#leaf_close", "click", function(event){
	$("#top").css({"bottom":"0"}); 
	$("#bottom").css({"height":"0"}); 
	onResize();
	return false;
    });

$("*").delegate("#main_icons i, .leaves_count i", "click", function(event){
	$("#main_icons i").css("opacity","0.4");
	$(this).css("opacity","1");
	toshow = $(this).attr('toshow');
	
	
	if(toshow=='leaf_div')
	  {
	  if( $(this).attr('leaf').length )
	  		{
	  		leaf = $(this).attr('leaf');
			$('#leaf_div #leaf_left_col li').removeClass('current');
			$('#leaf_div #leaf_left_col li[leaf='+leaf+']').addClass('current');

			  newh = $.cookie('rightheight');
			  if(newh==null) { newh=300; $.cookie('rightheight',300,{ expires: 300 })}
			  if (newh != '')
			    {
			      newh=parseFloat(newh);
			      if(newh<3) newh=300;
				}

			$("#top").show().css({"bottom":newh, "border-bottom":"1px solid lightgray"}); 
			$("#bottom").show().css({"height":newh}); 
			
	  		}
	  else
	  		leaf = $("#leaf_div #leaf_left_col li[class=current]").attr('leaf');
	  		
	  showLeaf( leaf );
	  }

	if(toshow=='settings_div')
	  {
	  showSettings( $("#settings_div #leaf_left_col li[class=current]").attr('leaf') );
	  }
	
	
	if(toshow!='leaf_div')
		$(".main_div").fadeOut(400);
		
		$("#"+toshow).fadeIn(400);
	
	return false;
	});


$("*").delegate("#to_home", "click", function(event){
	document.location="./4tree.php";
	return false;
	});

$("*").delegate("#print_tree", "click", function(event){
    PrintIt($("#demo").html());
	return false;
	});

$("*").delegate("#print_redactor", "click", function(event){
    PrintIt(myr.getCode());
	return false;
	});

$("*").delegate("#print_calendar", "click", function(event){
	
	$("#slot_scroll").height(1200);
	$("#fc-view").height(1200);
    PrintIt(calend.parent('div').html());
    
	return false;
	});


$("*").delegate("#full_screen_right", "click", function(event){
	if (!$("#top").hasClass('fullscreen')) { $('.icon-resize-full-1').attr('class','icon-resize-small'); $("#top").addClass('fullscreen'); onResize(); }
	else { $('.icon-resize-small').attr('class','icon-resize-full-1'); $("#top").removeClass('fullscreen'); onResize(); }
	return false;
});

$("*").delegate("#full_screen_left", "click", function(event){
	if (!$("#left").hasClass('fullscreen')) { $('.icon-resize-full-1').attr('class','icon-resize-small'); $("#left").addClass('fullscreen'); onResize(); }
	else { $('.icon-resize-small').attr('class','icon-resize-full-1'); $("#left").removeClass('fullscreen'); onResize(); }
	return false;
});

$("*").delegate("#full_screen_left2", "click", function(event){
	if (!$("#left_bottom2").hasClass('fullscreen')) { $('.icon-resize-full-1').attr('class','icon-resize-small'); $("#left_bottom2").addClass('fullscreen'); onResize(); }
	else { $('.icon-resize-small').attr('class','icon-resize-full-1'); $("#left_bottom2").removeClass('fullscreen'); onResize(); }
	return false;
});


//$(".side_panel_hover").hoverIntent(jsShowSidePanel,jsHideSidePanel2);


$("*").delegate(".side_panel", "click", function(event){
	if ($('#side_folder').css('display')=='none')
		{
		$('#side_arrow').hide();
		$('#side_folder').fadeIn(300);
		}
	else
		{
		$('#side_arrow').hide();
		$('#side_folder').fadeOut(500);
		}
	return false;
});

$("*").delegate(".side_panel img", "click", function(event){

		mytop = $(this).offset().top-11;
		oldmytop = $('#side_arrow').css("top");
		
		$('#side_arrow').css("top",mytop);

	if (($('#side_folder').css('display')=='none') || (mytop!=oldmytop))
	    {
		$('#side_arrow').show();
		$('#side_folder').fadeIn(300);
		}
	else
		{
		$('#side_arrow').hide();
		$('#side_folder').fadeOut(500);
		}
	
	return false;
});


$(".side_panel img").hoverIntent(function(){ if($('#side_folder').css('display')=='none') $(this).next('.name').fadeIn(100); },function(){ $(this).next('.name').fadeOut(500); },1);


function jsShowSidePanel (){

	if((!$("#top").hasClass('fullscreen')) && (!$("#left").hasClass('fullscreen')) && (!$("#left_bottom2").hasClass('fullscreen')))
		{
		   $("#left_panel").stop().animate({"left":"0"},500); 
		   $("#right_panel").stop().animate({"right":"0"},500); 
		}
}




$("*").delegate(".side_panel", "mouseleave", function(event){
	jsHideSidePanel();
	return false;
});


function jsHideSidePanel(){
	if ($('#side_folder').css('display')=='none')
	  {
	  $("#left_panel").stop().animate({"left":"-74"},700); 
	  $("#right_panel").stop().animate({"right":"-74"},700); 
	  }
}

function jsHideSidePanel2(){
}


$("*").delegate(".jstree-icon,label", "hover", function(event){
	if($('#left_bottom').height()!=1)
		{
		tip = $(this).parent('a').find('.tip:last');
		if(!tip.length)
			tip = $(this).find('.tip:last');
		tip.show();
		}
	return false;
	});


$("*").delegate(".jstree-icon,label", "mouseout", function(event){
		tip = $('* .tip');
		tip.hide();	  
	return false;
	});

$("*").delegate(".jstree-icon,label", "mousemove", function(e) {
//		console.info(tip);
	if($('#left_bottom').height()!=1)
		{
		tip = $(this).parent('a').find('.tip:last');
		if(!tip.length)
			tip = $(this).find('.tip:last');
		var mousex = e.pageX + 20;
		var mousey = e.pageY + 20;
		var tipWidth = tip.width();
		var tipHeight = tip.height();
		var tipVisX = $(window).width() - (mousex + tipWidth);
		var tipVisY = $(window).height() - (mousey + tipHeight);
		  
		if ( tipVisX < 20 ) {
			mousex = e.pageX - tipWidth - 20;
		} if ( tipVisY < 20 ) {
			mousey = e.pageY - tipHeight - 20;
		} 
		tip.css({  top: mousey, left: mousex });
		}
	});
	
	
		if($.cookie('swap_calendar')==1)
			{
			my_calendar = $('#calendar');
			my_redactor = $('#redactor_content');
			
			my_redactor.appendTo('#top');
			my_calendar.appendTo('#left_bottom2');
			
			$('#left_bottom_label').html('календарь');
			

			}

	$('*').undelegate("#demo", "click").delegate("#demo", "click", function(event) 
		{
		$("#demo").focus();
		return false;
		});

	$('*').undelegate("#swap_calendar", "click").delegate("#swap_calendar", "click", function(event) 
			{
			if($.cookie('swap_calendar')==1) $.cookie('swap_calendar',0,{ expires: 300 });
			else						
			$.cookie('swap_calendar',1,{ expires: 300 });	
			
			document.location.href="";					
			return false;
			});


	$('*').undelegate(".bell-no", "click").delegate(".bell-no", "click", function(event) 
			{
			id = $(this).parent('li').attr('id').replace('node_','');
			var bell = $(this);
		  	$('#bubu').load("do.php?set_reminder="+id,function()
		  	      {  
		  	      bell.removeClass('bell-no').addClass('bell');
		  	      });
		  	 return false;
		  	});

	$('*').undelegate(".bell", "click").delegate(".bell", "click", function(event) 
			{
			id = $(this).parent('li').attr('id').replace('node_','');
			var bell = $(this);
		  	$('#bubu').load("do.php?delete_reminder="+id,function()
		  	      {  
		  	      bell.removeClass('bell').addClass('bell-no');
		  	      });
		  	 return false;
		  	});



	//обновлять даты дерева каждые 5 минут
		setInterval(function()
		   {
				jsRefreshDate();
		   },5*60*1000);


	$('#search1').hide();
		
			if ($.cookie('hide_do')==1)
			    {
				show_checked="false";
				}
			else
				{
				show_checked="true";
			    }
			    
	$('*').undelegate("#search_empty", "click").delegate("#search_empty", "click", function(event) 
			{
			$("#textfilter").val('').focus();
			$("#search_panel").hide();
			$(this).fadeOut(200);
			return false;
			});
				    

	$(".search-ico").click(function()
		{
	    $('#search1').slideToggle(300);	    
	    $('.search-ico').toggleClass('active');
	    if ($('.search-ico').hasClass('active')) { $('#textfilter').focus(); if($('#textfilter').val()!='') $('#search_panel').show(); }
	    else { $("* #demo li a").removeClass('jstree-search'); $('#search_panel').hide(); }
		});

		 $('*').undelegate(".hide_checked", "click").delegate(".hide_checked", "click", function(event) 
			{
			$.cookie('hide_do',1,{ expires: 300 });
			show_checked="false";
			jsRefreshTree();
			return false;
			});
		 $('*').undelegate(".show_checked", "click").delegate(".show_checked", "click", function(event) 
			{
			$.cookie('hide_do',0,{ expires: 300 });
			show_checked="true";
			jsRefreshTree();
			return false;
			});

		 //Поиск
		 $('*').undelegate("#textfilter", "keyup").delegate("#textfilter", "keyup", function(event) 
			{
					clearTimeout(tttt);
					
					$("* #demo li a").removeClass('jstree-search');
					tttt = setTimeout(function()
					         {
							 
							//if needed, abort the request later..
							if(xhr_search) xhr_search.abort();
							
							lnk = "do.php?search_panel="+encodeURIComponent($('#textfilter').val());
							var xhr_search = $.ajax({
							            url: lnk,
							            success: function(data) {
											 jsMakeDateSearch();   
									         tt = '';
									         try {
											 tt = ' = '+eval($('#textfilter').val()); 
											 } catch (e) {
											   tt = '';
											 }
									    if (this.url.indexOf( encodeURIComponent($('#textfilter').val())+'&' )!=-1);
									    	{
									    	$("#search_panel").html(data);
									    	}
									    	$("#calc_answer").html(tt);
											 
							            }
							          });
							 							 
							    							 
					         if($('#textfilter').val()=='') $("#search_panel").hide();
					         else { $("#search_panel").show(); $("#search_empty").fadeIn(200); }
					         
					         }, 300);

				if (event.keyCode=='13')
					{
					clearTimeout(tttt);
					$("* #demo li a").removeClass('jstree-search');
					tttt = setTimeout(function()
					         {
					         $("#demo").jstree("search",$("#textfilter").val());
					         }, 10);
					
        		    //setTimeout(jsCollapse,200);
					}
				if (event.keyCode=='27') //При нажатии ESC после поиска нужно вернуться назад
					{
					$('#textfilter').val('');
				    $('#search1').slideUp('fast');
				    $("#search_panel").hide();
	   				$('.search-ico').removeClass('active');
					clearTimeout(tttt);
					}
			return false;
		
			});

	$('*').delegate("#cont2 a","mouseout",function(e)
	   {
		$('* #cont2 a').css('color','');
	   	clearTimeout(hover_tm);
		return false;
	   });
	   
	//При наведении на Tab - скроллить до дела закладки
	$('*').delegate("#cont2 a","mouseover",function(e)
	   {
	   	var n_id = $(this).attr('myid');
	   	
		old_id = $("* #cont2 li[id=current] a").attr('myid');
	   	

		$('* #cont2 a').css('color','');
	   	clearTimeout(hover_tm);


if(false)	   
	  if($("#node_"+n_id).attr('id'))
	   if((n_id!=old_id))
		hover_tm = setTimeout(function() 
		        {
				$('#demo').jstree('deselect_node');
				$('#demo').jstree('select_node',$("#node_"+n_id));
				$('* #cont2 a').css('color','');
				},1000);
				$(this).css('color','red');
		return false;
	   });

	///Клик по верхнему табу, фильтрует дерево
  	$('*').undelegate("#cont2 a", "click").delegate("#cont2 a", "click", function(e) {
			e.preventDefault();
			
			old_name = $("#cont2 li[id=current] a").attr('title');
			old_cookie_name = $("#cont2 li[id=current] a").attr('myid');
			n_id = $(this).attr('myid');
			var new_name = $(this).attr('title');

		if((n_id!=old_cookie_name)||(true))
		    {
			jscookie(old_cookie_name+"_scroll",$('#demo').scrollTop());
			new_cookie_name = n_id;
			jscookie("current_tab",n_id);
			$("#tabs li").attr("id",""); //Сброс ID
			$(this).parent().attr("id","current"); // Активируем закладку
			jsFocus(n_id);						
			}
			
			return false;
	});

		
		lnk = "do.php?getcookie";
		$.getJSON(lnk,function(data)
					{
					if(data) mycookie = data;
					jsRefreshTabs();
					showTree(1,'tab1'); //показываю дерево
					afterLoad();
						//Продолжаю помидор с того же места					
						endtime = jscookie("pomidor_endtime");
						my_min =  jscookie("pomidor_my_min");
						if(jscookie("pomidor_id"))
						   {
						   id = jscookie("pomidor_id");
						   $("#p"+id).addClass("pomidor_now");
						   }
						goPomidor();

					
					});
		
	$('.tree_toolbar a').click(function(e) 
		{
		e.preventDefault();
		switch($(this).attr('class'))
		   {
		   case "collapse":
				$("#demo").jstree("close_all");
				old_name = $("#cont2 li[id=current] a").attr('title');
				$.cookie(old_name+'select','');
				$.cookie(old_name+'tab1open','');
				$.cookie(old_name+'tab1scroll','');
				break;
		   case "expand":
				$("#demo").jstree("open_all");
				break;
		   case "add_default":
		   		$("#demo").jstree("create");
		   		break;
		   case "remove":
		   		if (confirm("Вы действительно хотите удалить дело?")) $("#demo").jstree("remove");
		   		break;
		   case "rename":
		   		$("#demo").jstree("rename");
		   		break;
		   case "refresh":
					jsRefreshTree();
					jsRefreshTabs();
					localStorage.clear();
			 		$('#calendar').fullCalendar( 'refetchEvents' ); 			 		
//			 		$("#tabs a[myid=1]").click();
//					tab_id = $("#cont2 li[id=current] a").attr('myid');
//			 		$("#demo").hide(); showTree(tab_id,'tab1');
//			 		setTimeout(function(){ $('#demo').jstree('refresh',-1); },700);
		   		break;
		   		
		   }
		});
	
	
// Code for the menu buttons
$(function () { 
	$("#mmenu input").click(function () {
		switch(this.id) {
			case "add_default":
			case "add_folder":
				$("#demo").jstree("create", null, "last", { "attr" : { "rel" : this.id.toString().replace("add_", "") } });
				break;
			case "search":
				$("#demo").jstree("search", document.getElementById("text").value);
				break;
			case "text": break;
			case "Expand":
				$("#demo").jstree("open_all");
				break;
			case "Collapse":
				$("#demo").jstree("close_all");
				break;
			default:
				$("#demo").jstree(this.id);
				break;
			
		}
	});
});
	
		
	
	$.datetimeEntry.setDefaults({spinnerImage: './img/spinnerDefault.png'});


/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};

 
 
function datetimeRange(input) { 
    return {minDatetime: (input.id == 'do_date2' ? 
        $('#date1').datetimeEntry('getDatetime') : null),  
        maxDatetime: (input.id == 'do_date1' ? 
        $('#do_date2').datetimeEntry('getDatetime') : null)}; 
}

    $('.datetime').each( function()
        { 
	x='#'+$(this).attr('id');
	$(x).datetimeEntry({beforeShow: datetimeRange,datetimeFormat: 'W N Y / H:M', 
                   altField: '#alt'+$(this).attr('id'), 
				   altFormat: 'Y-O-D H:M:S'});
        });
		
		
		setInterval(function()
		   {
		   	if($('#left_bottom').height()!=1)
				jsSetTimeNow();
			
		   },30000);

		currentTime=new Date;
		firstHour=currentTime.getHours() - 2;




////Большой календарь
		calend = $('#calendar').fullCalendar({
			editable:'true',
			firstHour: firstHour,
			timeFormat: 'H:mm',
			axisFormat: 'H:mm',
			contentHeight:361,
			weekends:true,
			defaultView:'agendaWeek',
			droppable:true,
			drop: function(date1,allday,ev,et)
			  { 
////////////////После того как элемент дерева брошен на календарь, присваиваем дату при помощи AJAX и обновляем календарь			  			
			  $.ajaxSetup({async: false});

			 if(ev.target.id) {
			 	 mynode = ev.target.id;

			    mydate = encodeURIComponent(date1.toMysqlFormat());
			    lnk="do.php?date_to_do="+$(this).attr('id')+"&date1="+mydate+"&allday="+allday;
			    
		 		$('#bubu').load(lnk, function () 
		 		  { 
		 		    new_date = $('#bubu').html();
		 		    $("#"+mynode).attr('date1',new_date);
			 		jsRefreshDate(mynode.replace('node_',''));
			 		$('#calendar').fullCalendar( 'refetchEvents' ); 
			 		jsLeafRefresh();

		 		  });




			     }
			 else
 			   et.data.obj.each(function()
			     { 
			    mynode = this.id;
			    mydate = encodeURIComponent(date1.toMysqlFormat());
			    lnk="do.php?date_to_do="+$(this).attr('id')+"&date1="+mydate+"&allday="+allday;
			    
		 		$('#bubu').load(lnk, function () 
		 		  { 
		 		    new_date = $('#bubu').html();
		 		    $("#"+mynode).attr('date1',new_date);
			 		jsRefreshDate(mynode.replace('node_',''));
			 		$('#calendar').fullCalendar( 'refetchEvents' ); 

		 		  });
			     });
			  
			    $.ajaxSetup({async: true});

			  },
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay,basicWeek,basicDay'
			},
			firstDay: 1,

		
			// US Holidays
			eventSources: [{
//					url:'https://www.google.com/calendar/feeds/eugene.leonar%40gmail.com/public/basic',
					editable:'true'
					},
					{
					url:'do.php?calendar',
					className: 'my_event'
					}],
			eventMouseover: function (event) 
			   { 			   			   
//				$('#demo').jstree('save_cookie');
//				showTree(1,'tab1');
			if(false)
				hover_tm = setTimeout(function()
				   {
					$("#demo").jstree("search", "#node_"+event.id);
				   },10000);

//				$('#demo').jstree('select_node',$("#node_"+event.id));
			   },					
			eventMouseout: function (event) 
			   { 
//				name = $("#tabs li[id=current] a").attr('title');
//				showTree($("#tabs li[id=current] a").attr('focus_node'),name);
				clearTimeout(hover_tm);
				if (!$('.search-ico').hasClass('active')) $("* #demo li a").removeClass('jstree-search');
			   },					
			eventClick: function(event) {
				//jsLoadNote(event.id);
				i_am_scroll=0;
				

				my_id = $("#tabs li[id=current] a").attr('myid');
				if(my_id!=1) ul = ".second_ul";
				else ul = ".main_ul";
				
				if(!$(ul+" #node_"+event.id).length) 
				   {
				   //сюда добавить кнопку "вернуться"
				   if(my_id!=1) { $("#tabs a[myid=1]").click(); }
				     path = event.path;
				     path = path.split(',');
//					$.ajaxSetup({async: false});
				     
				     for(i=0; i<path.length; i=i+1)
				     	{
				     	toopen = path[i];
				     	$("#demo").jstree("open_node",$("#node_"+toopen),false);
				     	}
//					$.ajaxSetup({async: true});
				   
				   }
				
				   $('#demo').jstree('deselect_all');
				   $('#demo').jstree('select_node',$("#node_"+event.id));
				
			},
			eventDrop: function(event, delta, minutedelta, allday) {
			  if (allday) 
			     {
			     lnk="do.php?movedo="+event.id+"&days="+delta+"&minutes="+minutedelta+"&allday=1";
			     }
			     else
			     {
			     lnk="do.php?movedo="+event.id+"&days="+delta+"&minutes="+minutedelta+"&allday=0";
			     }
			   
	 		$('#bubu').load(lnk, function ()
	 		    {
	    	   	var myid = event.id;

	 		    new_date = $('#bubu').html();
	 		    
	 		    $("#node_"+myid).attr('date1',new_date);
	 		    
	 		    jsRefreshDate(myid);
	 		    
	 		    $('* #demo').jstree('deselect_all');
	 		    $('* #demo').jstree('select_node',$("#node_"+myid));
	 		    
	 		    //$("#node_"+myid).css('color','red');
	    	   	//$('#demo').jstree('refresh',-1);
				//setTimeout(function() { $("#demo").jstree("search", "#node_"+myid); },500);
	    	   	
	 		    });

			  
			},
			
			loading: function(bool) {
				if (bool) {
					$('#loading').show();
				}else{
					$('#loading').hide();
					addRecurring(2012,9,10); // добавляем повторяющиеся события
					jsSetTimeNow();
					$('#time_now_to').scrollTop(400);
				}
			},
			selectable: true,
			selectHelper: true,
			select: function(start, end, allDay) {
			if( end-start == 900000 ) { 	calend.fullCalendar('unselect'); return true; }
				var title = prompt('Название события:');
				if (title) { 
				manager = encodeURIComponent($('#selectmanager').html()); 
				
			if(allDay==false)
				{	
				st = start.toString();
				en = end.toString();
				}
			else
			 	{
				st = start.toDateString();
				en = end.toDateString();
			 	}
				
				lnk="do.php?createdo="+encodeURIComponent(title)+"&start="+encodeURIComponent(st)+"&end="+encodeURIComponent(en)+"&allday="+allDay+"&manager="+manager;
	 			$('#bubu').load(lnk, function ()
	 		    	{
			 		$('#calendar').fullCalendar( 'refetchEvents' ); 
			 		$("#tabs a[myid=1]").click();
			 		setTimeout(function(){ $('#demo').jstree('refresh',-1); },700);
					jsRefreshTabs();
	 		    	});


				}
				calend.fullCalendar('unselect');
				
			}
			
			
		});
if(false)
setTimeout(function(){ $('#left_bottom_label').click(); $('#fc-button-agendaWeek').click(); $('#tabsminitop').click();
},2000);

//setTimeout(function(){ $('#calendar').fullCalendar('gotoDate','2012','4','12'); },12000);



///////////////////редакатор/////////////////////////////////////////////////////////////////////
    
  myr = $('#redactor_content').redactor({ imageUpload: './redactor/demo/scripts/image_upload.php', lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php', autoresize:false, 
  			buttonsAdd: ['|', 'button1'], 
            buttonsCustom: {
                button1: {
                    title: 'Спойлер (скрытый текст)', 
                    callback: function(obj, event, key) 
                      { 
                      console.info(obj,event,key);
					  myr.execCommand('insertHtml',"<p><div class='spoiler_header'><b>&nbsp;Скрытый текст<br></b></div><div class='spoiler' style='display: block; '><div>Скрытый<br>текст</div></div></p>&nbsp;");
                      }  
                }
            }
     });
  
  $('*').delegate(".spoiler_header","click", function ()
    {
    $(this).next('.spoiler').slideToggle('fast');
      	
    return false;
    });
    
    
    
    
  
  
	$('#tabsminitop').click(function()
		{
	   	   if($('#tabsminibottom').css("display")=='none')
	   	   	 {
		   		$('#tabsminibottom').show();
			  	onResize();			  
	   	   	 }
	   	   else
	   	   	 {
		   		$('#tabsminibottom').hide();
			  	onResize();			  
	   	     }

		});


	   	if($('#left_bottom').height()==1)
	   	  {

	   	   newh = $.cookie('height');
		   if(newh==null) { newh=300; $.cookie('height',300,{ expires: 300 }); }
		   
		   if (newh != '')
			    {
			      note_height=parseFloat(newh);
			    }
	   	   if((note_height<3) || (!note_height)) note_height=300;
	   	   
		   $('#left_top').animate({"bottom": note_height}, 300);
		   $('#left_bottom').animate({"height": note_height}, 300);
		   onResize();
		  }
		 else
		  {
		   $('#left_top').animate({"bottom": "1"}, 100);
		   $('#left_bottom').animate({"height": "1"}, 100);
		   onResize();
		  }


	$('#left_bottom_label').click(function()
	   { 
	   	if($('#left_bottom').height()==1)
	   	  {
	   	 
	   	   newh = $.cookie('height');
		   if(newh==null) { newh=300; $.cookie('height',300,{ expires: 300 }); }
		   if (newh != '')
			    {
			      note_height=parseFloat(newh);
			    }
	   	   if((note_height<3) || (!note_height)) note_height=300;

	   	 	   	   
		   $('#left_top').animate({"bottom": note_height}, 300);
		   $('#left_bottom').animate({"height": note_height}, 300, function() { onResize(); } );
		   
		  }
		 else
		  {
		   $('#left_top').animate({"bottom": "1"}, 100);
		   $('#left_bottom').animate({"height": "1"}, 100, function() { onResize(); } );
		  }
	   });


	$('#right_leaf_label').click(function()
	   { 
	   	if($('#bottom').height()==0)
	   	  {
	   	 
	   	   newh = $.cookie('rightheight');
		   if (newh != '')
			    {
			      note_height=parseFloat(newh);
			    }
	   	   if((note_height<3) || (!note_height)) note_height=300;

	   	 	   	   
		   $('#top').css({"bottom": note_height});
		   $('#bottom').css({"height": note_height});
		  }
		 else
		  {
		   $('#top').css({"bottom": "0"});
		   $('#bottom').css({"height": "0"});
		  }

		   onResize();

	   });
	   
	   
//  neww = $.cookie('width');
//  if (neww != '')
//    {
//      neww2=parseFloat(neww)+50;
//	  $('#right-col2').css('width',neww);
//	  $('#right-col').css('margin-right',neww2);
//	}

  neww = $.cookie('width');
  if (neww != '')
    {
      neww=parseFloat(neww);
	  $('#right').css('width',neww);
	  $('#page').css('width',neww);
	  $('#left').css('margin-right',neww);
	}

  $('#resize').mousedown( function(e)
     { 
			  e.preventDefault();

			  $('#left').addClass('noselectable');
			  $('#resize').width('100%');
			  $('#resize').css('z-index',10000);
			  $('#resize').css('opacity','0.1');

		$(window).mousemove(function(e){
		      
			  w = $(document).width();
			  neww = w-e.pageX-50;

			if(neww<480) neww = 480;
			
			  $('#right').css('width',neww);
			  $('#page').css('width',neww);
			  $('#left').css('margin-right',neww);
			  //onResize();	
		      $(window).resize();

		    });


     });

  $(window).mouseup( function()
     { 
		$(window).unbind("mousemove");
	    $('#resize').width('1px').css('z-index',5).css('opacity','1');
		$.cookie('width',$('#right').width(),{ expires: 300 });
	    $('#left').removeClass('noselectable');
//	    onResize();
//	    $(window).resize();
     });
	   
	
/////////////////////////////////////////

  var newh1 = $.cookie('height');
  if(newh1==null) { newh1=300; $.cookie('height',300,{ expires: 300 }); }
  
  if (newh1 != '')
    {
      newh1=parseFloat(newh1);
      if(newh1<3) newh1=300;
      setTimeout(function(){
			  $('#left_bottom').css('height',newh1);
			  $('#left_top').css('bottom',newh1);
			  },500);
	}
	   	   


  //Перемещение фильтра дел
  $('#right_leaf_label').mousedown( function(e)
     { 
			  e.preventDefault();

		$(window).mousemove(function(e){
		      				
			  h = $(document).height();
			  newh = h-e.pageY-50;
			  
			  $('#bottom').css('height',newh);
			  $('#top').css('bottom',newh);
			  onResize();	
		      $(window).resize();

		    });

  $(window).mouseup( function()
     { 
	    e.preventDefault();
		$(window).unbind("mousemove");
		$(window).unbind("mouseup");
		if ($('#bottom').height()>2) $.cookie('rightheight',$('#bottom').height(),{ expires: 300 });

     });


     });



  $('#left_bottom_label').mousedown( function(e)
     { 
			  e.preventDefault();

		$(window).mousemove(function(e){
		      				
			  h = $(document).height();
			  newh = h-e.pageY-50;
			  

			  $('#left_bottom').css('height',newh);
			  $('#left_top').css('bottom',newh);
			  onResize();	
		      $(window).resize();

		    });


		  $(window).mouseup( function()
		     { 
				$(window).unbind("mousemove");
				$(window).unbind("mouseup");
				if ($('#left_bottom').height()>1) $.cookie('height',$('#left_bottom').height(),{ expires: 300 });
		     });

     });



	
	   


  
}

Date.createFromMysql = function(mysql_string)
{ 
   if(typeof mysql_string === 'string')
   {
      var t = mysql_string.split(/[- :]/);

      //when t[3], t[4] and t[5] are missing they defaults to zero
      return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);          
   }

   return null;   
}


Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
  };

function jsMakeDate(mydate,remind)
{
  	var mylong="";
	var myclass = "shortdate";
	var mylong="",ddd;

	today = new Date;
	dd = Math.round((Date.createFromMysql(mydate).getTime()-today.getTime())/60/60/1000*10)/10;
	
	if (mydate=="0000-00-00 00:00:00") return '';

   if (dd>0) myclass='shortdate';
   else myclass='shortdatepast';

   ddd=dd;

if ((dd>24) || (dd<-24) || (mydate.search("00:00:00")!=-1)) 
   { 
    dd=Math.round(dd/24); 
    mylong="long";
    if (dd>=0) mydays="+ "+dd+" дн";
       else
    mydays=dd+" дн";
   }

else
   { 
    if (dd>=0) mydays="+ "+dd+" ч";
       else
    mydays=dd+" ч";
   }

	if (mydate.search("00:00:00")!=-1) 
	   { 
	   if (mydate.search(today.yyyymmdd())!=-1) { mydays="сегодня";
	   myclass="shortdatepast"; mylong=""; }
	   }

  if (false) { $class='shortdatedid'; $long=''; }

	if ((remind=='0000-00-00 00:00:00') || !remind)
		{
		bell_class="bell-no";
		title = "Нажмите, чтобы включить SMS уведомление за 3 минуты";
		}
	else
		{
		bell_class="bell";
		title = "Вы получите SMS уведомление за 3 минуты";
		}
	

return "<i class='icon-bell-1 "+bell_class+"'></i><span class='r "+myclass+mylong+"' title='"+mydate+"'>"+mydays+"</span>";
}

function jsMakeDate2(mydate,remind)
{
  	var mylong="";
	var myclass = "shortdate";
	var mylong="",ddd;

	today = new Date;
	dd = Math.round((Date.createFromMysql(mydate).getTime()-today.getTime())/60/60/1000*10)/10;
	
	if (mydate=="0000-00-00 00:00:00") return '';

   if (dd>0) myclass='shortdate';
   else myclass='shortdatepast';

   ddd=dd;

if ((dd>24) || (dd<-24) || (mydate.search("00:00:00")!=-1)) 
   { 
    dd=Math.round(dd/24); 
    mylong="long";
    if (dd>=0) mydays="+ "+dd+" дн";
       else
    mydays=dd+" дн";
   }

else
   { 
    if (dd>=0) mydays="+ "+dd+" ч";
       else
    mydays=dd+" ч";
   }

	if (mydate.search("00:00:00")!=-1) 
	   { 
	   if (mydate.search(today.yyyymmdd())!=-1) { mydays="сегодня";
	   myclass="shortdatepast"; mylong=""; }
	   }

  if (false) { $class='shortdatedid'; $long=''; }

	if ((remind=='0000-00-00 00:00:00') || !remind)
		{
		bell_class="bell-no";
		title = "Нажмите, чтобы включить SMS уведомление за 3 минуты";
		}
	else
		{
		bell_class="bell";
		title = "Вы получите SMS уведомление за 3 минуты";
		}
	

return "<span class='rrr "+myclass+mylong+"' title='"+mydate+"'>"+mydays+"</span>";
}



function jsSetCheckBox()
{
i_am_busy = true;
$('#demo li[did!="0000-00-00 00:00:00"]').each(function()
   {
   if( $(this).attr('did')!=undefined ) $("#demo").jstree("check_node",$(this));
   });
i_am_busy = false;
}

function showTree(showFirst,cookie_name) {

$("#demo").jstree("destroy");

			setTimeout(function(){
				if (cookie_name.replace('tab','node_')!='node_1')
					$("#demo").children('ul').children('li[id!='+cookie_name.replace('tab','node_')+']').remove();
					},1000);

//гружу всё дерево в переменную all_tree_data
lnk = "server.php?operation=get_children_all&show_checked="+show_checked+"&id=1";
$.get(lnk,function(data){ 

mytree = $("#demo")
	.bind("before.jstree", function (e, data) {
		$("#alog").append(data.func + "<br />");
	})
	.jstree({ 
		// List of active plugins
		"plugins" : [ 
			"themes","json_data","ui","crrm","cookies","dnd","search","types","hotkeys","checkbox","contextmenu" 
		],
		"themes" : {
				"theme" : "classic"
		},
		"cookies" : { 
				"save_opened" : cookie_name+"open",
				"save_selected" : cookie_name+"select",
				"auto_save" : true
		},
		// I usually configure the plugin that handles the data first
		// This example uses JSON as it is most common
		"json_data" : { 
			"data" : data,
			// This tree is ajax enabled - as this is most common, and maybe a bit more complex
			// All the options are almost the same as jQuery's AJAX (read the docs)
			"ajax" : {
				// the URL to fetch the data
				"url" : "server.php", //./server.php
				// the `data` function is executed in the instance's scope
				// the parameter is the node being loaded 
				// (may be -1, 0, or undefined when loading the root nodes)
				"data" : function (n) { 
					// the result is fed to the AJAX request `data` option
					return { 
						"operation" : "get_children", 
						"show_checked" : show_checked,
						"id" : n.attr ? n.attr("id").replace("node_","") : showFirst 
					}; 
				}
			}
		},
		// Configuring the search plugin
		"search" : {
			// As this has been a common question - async search
			// Same as above - the `ajax` config option is actually jQuery's AJAX object
			"ajax" : {
				"url" : "./server.php",
				// You get the search string as a parameter
				"data" : function (str) {
					return { 
						"operation" : "search", 
						"search_str" : str 
					}; 
				}
			}
		},
		// Using types - most of the time this is an overkill
		// read the docs carefully to decide whether you need types
		"types" : {
			// I set both options to -2, as I do not need depth and children count checking
			// Those two checks may slow jstree a lot, so use only when needed
			"max_depth" : -2,
			"max_children" : -2,
			// I want only `drive` nodes to be root nodes 
			// This will prevent moving or creating any other type as a root node
			"valid_children" : [ "drive" ],
			"types" : {
				// The default type
				"default" : {
					// I want this type to have no children (so only leaf nodes)
					// In my case - those are files
					"valid_children" : [ "default", "folder" ],
					// If we specify an icon for the default type it WILL OVERRIDE the theme icons
					"icon" : {
						"image" : "jstree/_demo/file.png"
					}
				},
				// The `folder` type
				"folder" : {
					// can have files and other folders inside of it, but NOT `drive` nodes
					"valid_children" : [ "default", "folder" ],
					"icon" : {
						"image" : "./jstree/_demo/folder.png"
					}
				},
				// The `drive` nodes 
				"drive" : {
					// can have files and folders inside, but NOT other `drive` nodes
					"valid_children" : [ "default", "folder" ],
					"icon" : {
						"image" : "./jstree/_demo/root.png"
					},
					// those prevent the functions with the same name to be used on `drive` nodes
					// internally the `before` event is used
					"start_drag" : false,
					"move_node" : false,
					"delete_node" : false,
					"remove" : false
				}
			}
		},
		// the core plugin - not many options here
		"core" : { 
			// just open those two nodes up
			// as this is an AJAX enabled tree, both will be downloaded from the server
			"initially_open" : false ,
			"animation":150,
			"load_open":true,
			"open_parents":false
		},
		"checkbox" : { "two_state":true }
	})
	.bind("create.jstree", function (e, data) {
		$.post(
			"./server.php", 
			{ 
				"operation" : "create_node", 
				"id" : data.rslt.parent.attr("id").replace("node_",""), 
				"position" : data.rslt.position,
				"title" : data.rslt.name,
				"type" : data.rslt.obj.attr("rel")
			}, 
			function (r) {
				jsRefreshTabs();
				if(r.status) {
					$(data.rslt.obj).attr("id", "node_" + r.id);
				}
				else {
					$.jstree.rollback(data.rlbk);
				}
			}
		);
	})
	.bind("remove.jstree", function (e, data) {
		data.rslt.obj.each(function () {
			$.ajax({
				async : false,
				type: 'POST',
				url: "./server.php",
				data : { 
					"operation" : "remove_node", 
					"id" : this.id.replace("node_","")
				}, 
				success : function (r) {
					jsRefreshTabs();
			 		$('* #calendar').fullCalendar( 'refetchEvents' ); 
					if(!r.status) {
						data.inst.refresh();
					}
				}
			});
		});
	})
	.bind("rename.jstree", function (e, data) {
		$.post(
			"./server.php", 
			{ 
				"operation" : "rename_node", 
				"id" : data.rslt.obj.attr("id").replace("node_",""),
				"title" : data.rslt.new_name
			}, 
			function (r) {
				jsRefreshTabs();
			 	$('* #calendar').fullCalendar( 'refetchEvents' ); 
			
				if(!r.status) {
					$.jstree.rollback(data.rlbk);
				}
			}
		);
	})
	.bind("check_node.jstree", function(event,data) {
		if (i_am_busy) return;
		id = data.rslt.obj.attr("id");

		lnk = "do.php?check_it="+id;
		clearTimeout(chekout_hide);
		$.getJSON(lnk,function(data)
					{
					jsTitle('Дело выполнено');
			 		$('* #calendar').fullCalendar( 'refetchEvents' ); 
					jsRefreshTabs();
					chekout_hide = setTimeout(function()
					   {
					   $(".jstree-checked").fadeOut(1000);
					   },5000);
					});

	    })
	.bind("uncheck_node.jstree", function(event,data) {
		id = data.rslt.obj.attr("id");
		
		clearTimeout(chekout_hide);

		lnk = "do.php?uncheck_it="+id;
		$.getJSON(lnk,function(data)
					{
					jsTitle('Выполнение снято');
			 		$('* #calendar').fullCalendar( 'refetchEvents' ); 
					jsRefreshTabs();

					});

	    })
	.bind("select_node.jstree", function(event,data) {
		
		$(".redactor_editor").blur();
		$("#demo").focus();	

//		id = data.rslt.obj.attr("id");
//		jsLoadNote(id);
		
clearTimeout(sel_tm);
sel_tm = setTimeout(function()  		//onSelectNode
      {
		id = data.rslt.obj.attr("id");

		jsShowDoSettings(id);
		jsLoadNote(id);

		current_tab = $("#cont2 li[id=current] a").attr('myid');

		jscookie(current_tab+"_scroll",$('#demo').scrollTop());
		
		gotodate = data.rslt.obj.attr('date1');
				
//		$.ajaxSetup({async: false});
		
		var slot=0;

		if ((gotodate!='0000-00-00 00:00:00') && (gotodate)) //прыгаем календарем на выбранную делом дату 
		  {
		  gotodate = sqlDate(gotodate);
		  d = gotodate.getDate();
		  m = gotodate.getMonth();
		  y = gotodate.getFullYear();

		  h = gotodate.getHours();
		  slot = parseInt((95/24)*h)-6;
		  
		  $('#calendar').fullCalendar('gotoDate',y,m,d);		  
		  }
		else  //если дата не указана, прыгаю на сегодняшнюю дату
		  {
		  gotodate = new Date();
		  d = gotodate.getDate();
		  m = gotodate.getMonth();
		  y = gotodate.getFullYear();

		  h = gotodate.getHours();
		  slot = parseInt((95/24)*h)-6;
		  
		  
		  $('#calendar').fullCalendar('gotoDate',y,m,d);		  
		  }
		
		$('* .fc-event-vert,.fc-event-hori').removeClass('event-selected');
		
		var iiid = id;
		setTimeout(function(){
		
			$('.fc-event-title[event='+iiid+']').parents('.fc-event-vert,.fc-event-hori').addClass('event-selected');
			},800);
				

	if((slot!=0) && (i_am_scroll == 1))
		{
		$('* #slot_scroll').each(function() 
		  { 
		  	slot = $(this).find('.fc-slot'+slot);
		  	if(slot.offset())
		  	  {
				sc2 = slot.offset().top;
				sc3 = $(this).offset().top;
				sc4 = $(this).scrollTop();
				var scr=sc4-(sc3-sc2);
		  
				$(this).stop().animate({ 'scrollTop': scr },800); 
			  }
		  });
		}
	else
		i_am_scroll = 1;
		
		
//		$.ajaxSetup({async: true});
	},300);
	    })
	.bind("after_open.jstree",function(e,data){
			clearTimeout(timeout);
			timeout = setTimeout(function(){
							
				$("#demo .r,.gray").remove();
				jsRefreshDate();
				jsSetCheckBox();
			if ($.cookie('hide_do')==1)
			    {
				$('#demo .jstree-checked').remove();
				}
				
				if (cookie_name.replace('tab','node_')!='node_1')
					$("#demo").children('ul').children('li[id!='+cookie_name.replace('tab','node_')+']').remove();
				},50);

	 	})
	.bind("loaded.jstree",function(e,data){
		//$("#demo").jstree("open_all");
		
		setTimeout( function() 
		   { 
		   $("#tabs a[myid="+ jscookie("current_tab") +"]").click();
		   },100 );
	 	})
	.bind("move_node.jstree", function (e, data) {
		data.rslt.o.each(function (i) {
			$.ajax({
				async : false,
				type: 'POST',
				url: "./server.php",
				data : { 
					"operation" : "move_node", 
					"id" : $(this).attr("id").replace("node_",""), 
					"ref" : data.rslt.cr === -1 ? 1 : data.rslt.np.attr("id").replace("node_",""), 
					"position" : data.rslt.cp + i,
					"title" : data.rslt.name,
					"copy" : data.rslt.cy ? 1 : 0
				},
				success : function (r) {
					if(!r.status) {
						$.jstree.rollback(data.rlbk);
					}
					else {
						$(data.rslt.oc).attr("id", "node_" + r.id);
						if(data.rslt.cy && $(data.rslt.oc).children("UL").length) {
							data.inst.refresh(data.inst._get_parent(data.rslt.oc));
						}
					}
					$("#analyze").click();
				}
			});
		});
	});



}); //оф $.get



}

function sqlDate(d1)
{
if(!d1) return null;

// Split timestamp into [ Y, M, D, h, m, s ]
var t = d1.split(/[- :]/);

// Apply each element to the Date function
var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);

if (d1=='0000-00-00 00:00:00') d = null;

return(d);
}



function savetext(dont)
{
if(note_saved==true) { return false; }
clearTimeout(my_autosave);

if($(".divider").attr('id'))
	{
	$(".divider").each(function(){ 
	   html = $(this).next('.edit_text').html();
	   text = html;		
	   var id_node = $(this).attr('id');
	   jsSendText(id_node,text,dont);
	   });  
	   
	return false;
	}

		var html = myr.getCode();
		text = html;		
		var id_node = $('#redactor_content').attr('notes');
		jsSendText(id_node,text,dont);

}

function jsSendText(id_node,text,dont)
{

		if($('#'+id_node).find('.tip').attr('class')) $('#'+id_node).find('.tip').html(text.substr(0,1000));
		else $('<div class="tip">'+text.substr(0,1000)+'</div>').appendTo( $('#'+id_node).children('a') );
		
	if(note_saved==false)
		localStorage.setItem( "note_"+id_node , text); //сохраняю внутри браузера
		
		
		text = encodeURIComponent(text);		

		dataString="savenote="+id_node+"&text="+text+"&date1="+$('#altdo_date1').val()+"&date2="+$('#altdo_date2').val();
        var $txt = $.ajax({type: "POST",url: "do.php", data: dataString, success: function(t) 
    	   {

    	   note_saved=true;
		if(t=='del')
		  {
    	   mynode = $('* #demo li[id='+$('#redactor_content').attr('notes')+'] > a');
    	   if (mynode.parent('li').hasClass('jstree-leaf')) mynode.children('.jstree-icon').css('background','');
		  }
		else
    	   if(t!='') 
    	     {
    	     mynode = $('* #demo li[id='+$('#redactor_content').attr('notes')+'] > a');
    	     if (mynode.parent('li').hasClass('jstree-leaf')) mynode.children('.jstree-icon').css('background','url('+t+') 50% 50% no-repeat');
    	     }
    	   if (dont!=1) 
    	     {
			 		$("#tabs a[myid=1]").click();
			 		setTimeout(function(){ $('#demo').jstree('refresh',-1); },700);
    	     $('#calendar').fullCalendar( 'refetchEvents' );
    	     }
    	   onResize();
    	   if (id_node) jsTitle('текст заметки сохранён');
    	  
    	   }});


}

function jsTitle(title,tim)
{
var mytim = tim;
if (tim == undefined) mytim = 2000;
setTimeout( function()
             {
			  if ( $('.title').html() != ('<b>'+title+'</b>') ) $('.title').css("opacity",'0').html('<b>'+title+'</b>').animate({"opacity": '0.7'}, 1000, function()
								{ 
								if(mytim<30000) setTimeout(function() { $('.title').animate({"opacity": '0'}, 300, function() { $('.title').html(''); }) },mytim);
								
								
								});
			 }, 200);

}




/**
* hoverIntent is similar to jQuery's built-in "hover" function except that
* instead of firing the onMouseOver event immediately, hoverIntent checks
* to see if the user's mouse has slowed down (beneath the sensitivity
* threshold) before firing the onMouseOver event.
* 
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* hoverIntent is currently available for use in all personal or commercial 
* projects under both MIT and GPL licenses. This means that you can choose 
* the license that best suits your project, and use it accordingly.
* 
* // basic usage (just like .hover) receives onMouseOver and onMouseOut functions
* $("ul li").hoverIntent( showNav , hideNav );
* 
* // advanced usage receives configuration object only
* $("ul li").hoverIntent({
*	sensitivity: 7, // number = sensitivity threshold (must be 1 or higher)
*	interval: 100,   // number = milliseconds of polling interval
*	over: showNav,  // function = onMouseOver callback (required)
*	timeout: 0,   // number = milliseconds delay before onMouseOut function call
*	out: hideNav    // function = onMouseOut callback (required)
* });
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($) {
	$.fn.hoverIntent = function(f,g) {
		// default configuration options
		var cfg = {
			sensitivity: 7,
			interval: 1300,
			timeout: 0
		};
		// override configuration options with user supplied object
		cfg = $.extend(cfg, g ? { over: f, out: g } : f );

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		var cX, cY, pX, pY;

		// A private function for getting mouse position
		var track = function(ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};

		// A private function for comparing current and previous mouse position
		var compare = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			// compare mouse positions to see if they've crossed the threshold
			if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
				$(ob).unbind("mousemove",track);
				// set hoverIntent state to true (so mouseOut can be called)
				ob.hoverIntent_s = 1;
				return cfg.over.apply(ob,[ev]);
			} else {
				// set previous coordinates for next time
				pX = cX; pY = cY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
			}
		};

		// A private function for delaying the mouseOut function
		var delay = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			ob.hoverIntent_s = 0;
			return cfg.out.apply(ob,[ev]);
		};

		// A private function for handling mouse 'hovering'
		var handleHover = function(e) {
			// copy objects to be passed into t (required for event object to be passed in IE)
			var ev = jQuery.extend({},e);
			var ob = this;

			// cancel hoverIntent timer if it exists
			if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

			// if e.type == "mouseenter"
			if (e.type == "mouseenter") {
				// set "previous" X and Y position based on initial entry point
				pX = ev.pageX; pY = ev.pageY;
				// update "current" X and Y position based on mousemove
				$(ob).bind("mousemove",track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

			// else e.type == "mouseleave"
			} else {
				// unbind expensive mousemove event
				$(ob).unbind("mousemove",track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
			}
		};

		// bind the function to the two event listeners
		return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover);
	};
})(jQuery);

var pomidor_text = ['Отлично. Но нужно отвлечься',
					'Вы молодец. Сейчас прогуляйтесь и подумайте над следующим делом',
					'Так держать. Вам можно доверить самое ответственное дело',
					'Супер! Вам все завидуют',
					'Хорошо, но можно было сделать это проще',
					'Вот это да. Вы хорошо работаете',
					'Вы наш герой. Мы берём с вас пример',
					'Так вы далеко продвинитесь',
					'Извините, что отвлекаю, но вам лучше отдохнуть',
					'Неплохо. Теперь вам нужно сделать мини-зарядку',
					'Ещё одним делом-лягушкой меньше',
					'Так по одной котлетке, вы съедите целого слона',
					'Очень хорошо. Вы умеете сделать всё в лучшем виде',
					'Это было превосходно. Вы должны научить этому других',
					'Уже лучше. Теперь отдохните.',
					'Отличная работа. Мы знаем, что вы умеете быть в кураже',
					'Превосходная работа. Но вы увлеклись, отдохните',
					'У вас отлично получается. Продолжим после отдыха',
					'Я начинаю думать, что вы трудоголик. Разомнитесь',
					'Трудно, но вы справляетесь. Я в вас верю',
					'Вы, похоже, не знаете, что такое лень. Столько всего уже переделали',
					'Ваш мозг, как машина. Теперь отдохните, скоро научитесь держать темп',
					'Чувствуете, что вы совсем не устали. Вы упорны',
					'Гениально, но я думаю, вам нужно ещё раз подумать, что вы сделали',
					'Ваш труд восхищает. Время летит незаметно, но вы его обгоняете',
					'Я смотрю, вы получаете удовольствие от работы. Так держать',
					'25 минут пролетели незаметно, но вы много сделали',
					'Я в вас верю. Уж я то знаю',
					'Все бы так работали, не думая о своих нелепых комплексах',
					'Вы заслужили чашку чая, расслабьтесь',
					'Вы заслужили похвалу. Погладьте себя',
					'Побалуйте себя, вы отлично сегодня работаете',
					'Все лентяи вам завидуют',
					'Вы хорошо продвинулись',
					'Ваш мозг гениален',
					'Поработали наславу. Желаю приятного отдыха',
					'Отлично! Сходите умыть лицо, сбодритесь',
					'Превосходная работа. Сделайте зарядку.',
					'Хорошо поработали, только держите осанку',
					'Вы заслужили горячий кофе',
					'Ого! Вы так замечательно работаете',
					'Хорошо, но в следующий раз, постарайтесь не отвлекаться',
					'Хорошо, но вам необходимо прогуляться',
					'Хорошо, теперь подышите свежим воздухом',
					'Отлично. Лучший отдых, смена деятельности. Протрите, пожалуйста, монитор',
					'Хорошо, но ваши глаза уже устали. Отдохните',
					'Отдохнув, вы сможете работать быстрее. Прогуляйтесь',
					'Хорошая работа. Закройте глаза и помечтайте.',
					'Как всегда хорошо, но не сидите всё время за компьютером. Отдохните',
					'Очень рад, что вы были сконцентрированны',
					'Вот видите, пока вы делали это дело, мир остался на том же месте, а вы продвинулись',
					'Хорошо, но вам необходимо прогуляться',
					'Очень хорошо, только мне кажется у вас клавиатура требует протирки',
					'Отлично, теперь сходите похвалите кого нибудь',
					'Отличная работа! А вы давно звонили родителям? Порадуйте их',
					'Отличная работа! Теперь разомнитесь',
					'Ужасно! Вы обычно делаете всё гораздо лучше',
					'Вы замечательно потрудились, теперь посжимайте пальцы',
					'Очень хорошо, теперь сделайте повороты шеи несколько раз и отдохните',
					'Отлично, теперь встаньте со стула и прогуляйтесь',
					'Рады за вас, вы умеете работать',
					'Молодец! Вы заслужили отдых',
					'Супер! Теперь вам срочно нужно посмотреть на природу',
					'Извините, но вы могли бы сделать это лучше',
					'Великие люди тоже были увлечены',
					'Хорошо, сохраняйте кураж',
					'Молодец, вы можете собой гордиться',
					'Очень хорошо, теперь посмотрите в окно, там так красиво',
					'Вы отлично знаете своё дело. Отдохните, отвлекитесь от компьютера',
					'Вы отлично знаете своё дело, но старайтесь не отвлекаться',
					'Молодец! Не отвлекаясь, вы делаете всё быстрее',
					'Хмм… Вы отлично справляетесь',
					'Хмм… Вам просто необходим свежий воздух',
					'Вы время зря не теряете',
					'Вы далеко пойдёте',
					'Отлично, а сейчас отдохните и подумайте, что вас беспокоит',
					'Неплохо, теперь закройте глаза и вспомните самый счастливый момент своей жизни',
					'Отлично, теперь вспомните, что вы хотите больше всего в жизни',
					'Отвлекитесь, но знайте, вы отлично продвинулись',
					'У вас отличные задатки, только старайтесь концентрироваться лучше',
					'Я обожаю вас за то, что вы умеете работать',
					'Отлично! Вы знаете как делать трудные дела',
					'Молодец! Ещё одно дело не нужно теперь откладывать',
					'Вы не теряете время даром',
					'Превосходно, вы как марафонец',
					'Очаровательно, вы, похоже, получаете огромное удовольствие',
					'Вы замечательно работаете, по крайней мере, все так думают',
					'Ничего себе. Ваши завистники умрут от горя',
					'Мы вами восхищаемся. Вы многое успели',
					'Хорошо, но следующее дело делайте неспеша',
					'Хорошо, может, теперь чего-нибудь горяченького',
					'Вот это да. Вы можете свернуть горы',
					'Целых 25 минут концентрации. Вам можно доверять',
					'Вы восхищаете меня уже не первый раз',
					'Плохо. Вам нужно подумать, тем ли вы занимались',
					'Так держать, но не забывайте себя баловать',
					'Отлично, но вы заслужили право немного полениться',
					'Вы отлично сконцентрированны. Но отдых вам пригодится',
					'Хорошо, что вы не отвлекались'];
