function my_console(text,text2) //вывод лога в консоль
{
	if(!$(".sync_console:visible").length) return true;

	if(!text2) text2 = "";
	$(".sync_console > ul").append("<li><font color='lightgray'>"+ (new Date).toLocaleTimeString() + "</font> — " + text+" <b>"+text2+"</b></li>");
	$(".sync_console").scrollTop(50000);
	
	if(text == "clean") { $(".sync_console ul").html(""); }
		
	
	
	
}

function jsSync()
{
    preloader.trigger('show');
    $(".icon-cd").css("color","#517c5d");
	
	my_console("clean");

	sync_id = jsGetSyncId();
	my_console("Начинаю синхронизацию. Клиент:",sync_id);

	mytime = parseInt(localStorage.getItem("last_sync_time"));
	timedif = jsNow() - mytime;
	my_console("Синхронизировался последний раз:",sqldate(mytime) + " ("+ parseInt(timedif/1000) +" сек.назад)");
	
	lastsync_time_client = jsFindLastSync();
	my_console("Время последней синхронизации из дел:",sqldate(lastsync_time_client));

	//данные, которые буду отправлять на сервер
	data = my_all_data.filter(function(el) 
			{ 
			if(el) 
				return ( (el.parent_id<-1000) || (el.id<-1000) || (el.time>=el.lsync) || ((el.new!="") && (el.new)) ); } );
	
	title_txt = "<ul style='font-size:0.7em'>";
	$.each(data,function(i,d)
		{ 
		title_txt = title_txt + "<li><b>"+ d.id +" - " +d.title+ "</b> (изменились: "+ d.new +")</li>"; 
		});
		
	title_txt = title_txt + "</ul>";

	my_console("Отправляю на сервер <b>"+data.length+"</b> изменившихся элементов:", title_txt);
	
	changes = JSON.stringify( jsDry(data) ); //высушиваю данные и превращаю в JSON строку
	my_console("Высушил данные в JSON и добавил в консоль. Длина:" + changes.length + " байт");
	console.info(changes);

	myconfirms = JSON.parse(localStorage.getItem("need_to_confirm"));
	my_console("Подтверждаю успешное обновление прошлых данных:",localStorage.getItem("need_to_confirm"));

	confirm_ids = JSON.stringify( myconfirms ); //высушиваю данные и превращаю в JSON строку
	changes = 'changes='+encodeURIComponent(changes)+'&confirm='+encodeURIComponent(confirm_ids);
	//what_you_need = save,load,all
	lnk = "do.php?sync_new="+sync_id+"&time="+lastsync_time_client+"&now_time="+jsNow(true)+"&do=save";
	my_console("Отправляю серверу запрос:",lnk);
	$.postJSON(lnk,changes,function(data,j,k){
		 if(j=="success")
		 	{
		 	if(data.saved)
			 	$.each(data.saved,function(i,d) //эти данные сохранены на сервере, можно отметить lsync = now()
			 	    	{
			 	    	console.info(d.id,data.lsync,d.old_id);
			 	    	if(d.old_id) 
			 	    		{
			 	    		jsChangeNewId(d); //заменяет отрицательный id на положительный
			 	    		}

			 	    	$("li[myid='"+d.id+"'] .sync_it_i").addClass("hideit");
			 	    	myelement1=jsFind(d.id);
		 	    		myelement1.lsync = parseInt(data.lsync);
		 	    		myelement1.new = "";
		 	    		jsSaveData(d.id);
			 	    	});

			 	countit=0;
		 	if(data.server_changes)
			 	$.each(data.server_changes,function(i,d) //эти данные сохранены на сервере, можно отметить lsync = now()
			 	    	{
			 	    	console.info(d);
			 	    	jsSaveElement(d);
			 	    	jsRefreshRedactor(d);
			 	    	countit=1;
			 	    	my_console("Пришли новые данные с сервера: "+d.id);
			 	    	});
			 	
			 //удаление дела
		     if(data.need_del)
		       $.each(data.need_del,function(ii,dd)
		     	{
		     	console.info("need_del",dd);
		     	if(dd.command == 'del') 
		     		{
		     		my_console("По комманде сервера, удаляю №",dd.id);
		     		jsDelId(dd.id);
		     		}
		     	if(dd.command == 'sync_all') 
		     		{ 
		     	  	localStorage.clear();
		     		document.location.href="./index.php";
		     		}
		     	countit=1;
		     	});

	 	    	if(countit==1) 
	 	    	   {
	     	    	jsRefreshTree();
	 	    	   }
			 	    	   
			 	localStorage.setItem("last_sync_time",data.lsync); //сохраняю время успешной синхронизации
			 	localStorage.setItem("time_dif",data.time_dif); //сохраняю время успешной синхронизации
			 	    	
			 	  
			 }
		my_console("Получен ответ от сервера:",j);
        $(".icon-cd").css("color","#888");
        preloader.trigger('hide');

		});

}

function jsRefreshRedactor(d)
{
	divider = $(".divider_red[myid='"+d.id+"']");
	
	if(divider.length==0)	//если открыта одна заметка
	    {
	    	id_node = $('.redactor_editor').attr("myid");
	    	md5text = $('.redactor_editor').attr("md5");
	    	
	    	if( (id_node==d.id) && ( $.md5(d.text) != md5text )) //если с сервера прислали новый текст, то обновляю редактор. Нужно дописать, если открыто несколько заметок. bug. никогда не запускается.
	    	  {
	    	  old_scroll = $(".redactor_editor").scrollTop();
	    	  clearTimeout(scrolltimer);
	    	  jsRedactorOpen([d.id],"FROM SYNC EDITOR");		
	    	  $(".redactor_editor").scrollTop(old_scroll);
	    	  }
	    }
	else
	    {				//если открыто несколько заметок
	    	  old_scroll = $(".redactor_editor").scrollTop();
	    	  clearTimeout(scrolltimer);
	    	  if(myelement) divider.next(".edit_text").html(myelement.text);
	    	  $(".redactor_editor").scrollTop(old_scroll);
	    }
	

}


function jsSaveElement(d)
{
	if(!d) return false;
	
	if( (!jsFind(d.id)) && (d.id>0) )  //если такого id нет, то создаю (создан в другом месте)
		{
			new_line = my_all_data.length;
			my_all_data[new_line]=new Object(); 
			element = my_all_data[new_line];
			element.date1 = "";
			element.date2 = "";
			element.icon = "";
			element.id = d.id;
			element.img_class = "note-clean";
			element.parent_id = d.parent_id;
			element.position = d.position.toString();
			element.text = "";
			element.did = "";
			element.time = parseInt(d.changetime);
			element.lsync = parseInt(jsNow()); //зачем это? чтобы пересинхронизироваться?
			element.user_id = $.cookie("4tree_user_id"); //уверен? а вдруг это дело добавил другой юзер?
			element.remind = 0;
			element.new = "";
			element.s = 0;
			element.tab = 0;
			element.fav = 1;
			element.title = "Новая заметка (new)";
			jsSaveData(d.id);
			console.info("new-element",element);
		}
				
	myelement = jsFind(d.id);
	myelement.title = d.title;
	myelement.parent_id = d.parent_id;
	myelement.did = d.did;
	myelement.fav = d.fav;
	myelement.date1 = d.date1;
	myelement.date2 = d.date2;
	myelement.tab = d.tab;
	myelement.new = ""; //обнуляю new, чтобы скрыть иконку синхронизации
	myelement.position = d.position.toString();
	myelement.icon = d.node_icon;
	myelement.lsync = parseInt(d.lsync);
	myelement.user_id = d.user_id;
	myelement.remind = d.remind;
	myelement.s = d.s;
	myelement.text = d.text;

	jsSaveData(d.id,d.old_id,"dontsync"); //не надо, так как есть уже в jsFind
	

}

function jsChangeNewId(d) //заменяет отрицательный id на положительный
{
	jsFind(d.old_id).id = d.id;
	jsSaveData(d.id);

	$("#panel_"+d.old_id).attr("id","panel_"+d.id); //заменяю индексы видимых панелей
	$('.redactor_editor[myid='+d.old_id+']').attr("myid", d.id);
    $('.divider_red[myid="'+d.old_id+'"]').attr('myid',d.id);
    $(".makedone[myid="+d.old_id+"]").attr("myid",d.id); //заменяю индексы makedone
    $("li[myid='"+d.old_id+"']").attr("myid",d.id).find(".tcheckbox").attr("title",d.id);

    all_children = jsFindByParent(d.old_id);
    $.each(all_children,function(i,ddd)
     	{ 
     	ddd.parent_id=d.id; 
     	jsSaveData(ddd.id);
     	});		//заменяю всех отрицательных родителей на положительных
	
	
}



