function my_console(text,text2) //вывод лога в консоль
{
	if(!text2) text2 = "";
	$(".sync_console > ul").append("<li><font color='lightgray'>"+ (new Date).toLocaleTimeString() + "</font> — " + text+" <b>"+text2+"</b></li>");
	$(".sync_console").scrollTop(50000);
	
	if(text == "clean") { $(".sync_console ul").html(""); }
		
	
	
	
}

function jsSync()
{
	my_console("clean");

	sync_id = jsGetSyncId();
	my_console("Начинаю синхронизацию. Клиент:",sync_id);

	mytime = parseInt(localStorage.getItem("sync_time_server"));
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
	
	lnk = "do.php?sync_new="+sync_id+"&time="+lastsync_time_client+"&now_time="+jsNow()+"&only_save=1";
	my_console("Отправляю серверу запрос:",lnk);
	$.postJSON(lnk,changes,function(data,j,k){
		 if(j=="success")
		 	{
			 	$.each(data.saved,function(i,d) //эти данные сохранены на сервере, можно отметить lsync = now()
			 	    	{
			 	    	console.info(d.id,data.lsync,d.old_id);
			 	    	if(d.old_id) 
			 	    		{
			 	    		jsChangeNewId(d); //заменяет отрицательный id на положительный
			 	    		}

			 	    	$("li[myid='"+d.id+"'] .sync_it_i").addClass("hideit");
		 	    		jsFind(d.id).lsync = parseInt(data.lsync);
			 	    	});
			 }
		my_console("Получен ответ от сервера:",j);
		});

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



