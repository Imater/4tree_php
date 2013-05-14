//v1.01
var note_saved=false,myr,t1,t2,my_all_data,my_all_comments,my_all_share,my_all_frends,remember_old_panel="top_panel";
var main_x = 50; //ширина левой панели в процентах
var main_y = 250;//высота верхней панели в пикселях
var preloader,tree_font = 1,clicknow,add_menu;
var calctabs_timer,show_help_timer,tttt2;
var tree_history = [],history_time,ignorehashchange,tttt;
var max_date1 = new Object,my_time_id,lastclick=null,lastclickelement=null;
var mytimer = new Array;
var mymetaKey = false, diaryrewind=0,old_before_diary=0;
var autosave_timer,mypomidor,endtime,my_min,old_title,widthpanel,RestMin, show_hidden=false,show_childdate=true;
var is_rendering_now,last_input_click;
var timestamp=new Date().getTime(),start_sync_when_idle=false,there_was_message_about_change=false;
var hoverListener,is_changed,only_save=false,main_user_id;
var db;

var API_4TREE = function(global_table_name,need_log){  //singleton
	 if ( (typeof arguments.callee.instance=='undefined') || true)
	 {
	  arguments.callee.instance = new function()
		  {
		  var my_all_data,
		  	  sync_now = false, //true - если идёт синхронизация
		  	  sync_now_timer,
		      db, //объект соединения с базой
		      last_log_time=jsNow(), //время последнего вывода лога
		      log_i=1, //номер лога
		      this_db = this, //эта функция
		      MAX_VALUE = 1000000000000000; //максимальное кол-во в базе
		      LENGTH_OF_LONG_TEXT = 200, //длина, после которой текст считается длинным и переносится в другую базу
		      settings = {show_did:false}; //все параметры
		  
		  this.jsIsOnline = function() //проверка, есть ли интернет
		  	{ 
		  	if (navigator.onLine == false) { //если интернета нет
			   		jsTitle("Интернет соединение отстутствует. Работаем локально.", 10000); 
			   		return false;
		       } else {
		       		return true;
		       }
		    }
		  
		  this.log = function(x1,x2,x3,x4,x5) { //логирование любых 5 параметров в консоль
		    	var time_dif = jsNow()-last_log_time;
		    	last_log_time=jsNow();
		      if(need_log) { 
		      	console.info(log_i+". log("+time_dif+"ms): ",x1?x1:" ",x2?x2:" ",x3?x3:" ",x4?x4:" ",x5?x5:" "); 
		      	log_i++;
		      }
		  }

		  this.js_my_all_data = function(set_my_all_data) //установка главного массива снаружи
		  	{
		  	if(set_my_all_data) my_all_data = set_my_all_data;
		  	return my_all_data;
		  	}

		  this.js_InitDB = function() //инициализация базы данных
	  		{
		  	//схема структуры базы данных
		  	var author_store_schema = { //схема базы данных
	      	  name: global_table_name,  //для каждой таблицы своя схема
	      	  keyPath: 'id', // optional, 
	      	  autoIncrement: false // optional. 
	      	};
		  	
		  	var texts_store_schema = { //схема базы данных
	      	  name: global_table_name+"_texts",  //для каждой таблицы своя схема
	      	  keyPath: 'id', // optional, 
	      	  autoIncrement: false // optional. 
	      	};

		  	schema = {
		  	  stores: [author_store_schema,texts_store_schema]
		  	}; 

		  		  	
		  	db = new ydn.db.Storage('_all_tree', schema);
		  	
		  	this_db.log("(js_InitDB) База данных инициализирована");
		  	return db;
		  	} //js_InitDB
		  		  	
		  this.jsFind = function(id,fields,save_anyway) //поиск любого элемента или установка его значений
			{
			var record;
			//this_db.log("start_find: "+id);
//			var answer = my_all_data.filter(function(el,i) 
//				{ 
//				return el && el.parent_id && el.id==id;
//				} );
				
//			answer = answer[0];
			//this_db.log("finish_find: "+id);
			
			var answer = my_all_data[id];
			
			
  		    if(answer && fields) { //если нужно присваивать значения
  		       var is_changed = false;
  		       record = answer;
  		       //поле, где записаны все изменённые не синхронизированные поля:
  		       var changed_fields = record["new"]; 
  		       $.each(fields, function(namefield,newvalue) 
  		       	{ 		
  		       	if( (record[namefield]!=newvalue) || save_anyway) 
  		       		{
  		       		is_changed = true;
  		       		record[namefield] = newvalue;

  		       		if(namefield=="text") {
		 	  		    if(newvalue.length==0) 
		       		       record["tmp_txt_md5"] = "";
		       		    else
		       		       record["tmp_txt_md5"] = hex_md5(newvalue).substr(0,5); //md5 штамп текста, для сверки с сервером
  		       		}
  		       		
  		       		//console.info("need_save: ",namefield," = ",newvalue);
  		   	   	  if((changed_fields.indexOf(namefield+",")==-1) && (namefield.indexOf("tmp_")==-1))
  		   	   	  		{ 
  		   	   	  		changed_fields = changed_fields + namefield + ","; 
  		   	   	  		}
  		       		}
  		       	});
  		       	
  		       if(is_changed) {
  		         record["new"] = changed_fields;

  		         //если не меняли время вручную и это не временное поле
  		         if( (changed_fields.indexOf("new,")==-1) && (changed_fields.indexOf("time,")==-1) && (changed_fields.indexOf("tmp_")==-1) ) 
  		             {
  		             record.time = parseInt(jsNow(),10); //ставлю время изменения (для синхронизации)
  		             }
  		         else
  		             {
  		             record["new"] = "";
  		             }
  		         
  		         var after_save1 = function() {};
  		         var after_save2 = function() {};
  		         
  		         if( (typeof fields.did   != "undefined") || //если нужно будет пересчитать следующие действия
	  		         (typeof fields.title != "undefined") ||
	  		         (typeof fields.date1 != "undefined") ||
	  		         (typeof fields.date2 != "undefined") ||
	  		         (typeof fields.del   != "undefined") ||
	  		         (typeof fields.id    != "undefined") ) {
	  		         	after_save1 = function() { this_db.jsUpdateNextAction(); };
		  		 }

  		         if(typeof fields.parent_id != "undefined") { //если нужно пересчитать детей у родителей всего дерева
	  		         	after_save1 = function() { this_db.jsUpdateChildrenCnt(); };
		  		 }

  		         if( (typeof fields.did   != "undefined") || //если нужно будет пересчитать детей у родителя
	  		         (typeof fields.del   != "undefined") ||
	  		         (typeof fields.date1 != "undefined") ||
	  		         (typeof fields.date2 != "undefined") ||
	  		         (typeof fields.id    != "undefined") ) {
	  		         	after_save2 = function() { this_db.jsUpdateChildrenCnt( record.parent_id ); };
		  		 }

	  		         
  		         db.put(global_table_name,record).done(function(){ after_save1(); after_save2(); });
  		       } 

		  	}
			
			
			return answer;
			} //jsFind
			
		 //находит или меняет текст. Если текст длинный, закидывает в базу _texts
		 //api4tree.jsFindLongText(6796).done(function(text){console.log(text);})
		 this.jsFindLongText = function(id, newtext) 
		     {
		    	var d=$.Deferred();
		    	
		    	if(newtext) { //если текст изменился

					var element = this_db.jsFind(id);
					if(!element) { d.resolve(); return d.promise(); }

	 	  		    if(newtext.length==0) 
	       		       element["tmp_txt_md5"] = "";
	       		    else
	       		       element["tmp_txt_md5"] = hex_md5(newtext).substr(0,5); //md5 штамп текста, для сверки с сервером


					if(newtext.length>LENGTH_OF_LONG_TEXT) { //если текст длинный
						var short_text = strip_tags(newtext).substr(0,LENGTH_OF_LONG_TEXT/2);
						this_db.jsFind(id,{ text:short_text, tmp_text_is_long:1 },"save_anyway");

			    		db.put(global_table_name+"_texts",{id:id.toString(),text:newtext}).done(function(){
			    			this_db.log("Сохранил длинный текст", newtext.length);
				    		d.resolve(newtext);
			    		});
					} else { //если текст короткий
						this_db.jsFind(id, { text:newtext, tmp_text_is_long:0 });
			    		db.remove(global_table_name+"_texts",id).done(function(){this_db.log("Удалил длинный текст")});
		    		}
		    		
		    		
		    		
		    	} else {
			  		db.get(global_table_name+"_texts",id.toString()).done(function(record) {
			  		return d.resolve(record?record.text:"");
			  		});
			  	}
			  	return d.promise();
			} //jsFindLongText
		   	
		 this.jsFindByParent = function(parent_id) //поиск всех элементов родителя
		     {
			var answer = my_all_data.filter(function(el,i) 
				{ 
				if((settings.show_did==false) && (el.did!=0)) return false;
				return el && el.parent_id==parent_id;
				});
			return answer;
			}
		 
		 this.jsAddDo = function(parent_id,title,date1,date2) //добавление нового элемента в базу
		 	 {
		     	var new_line = my_all_data.length;
		     	my_all_data[new_line]=new Object(); 
		     	var element = my_all_data[new_line];
		     	
		     	var new_id = -parseInt(1000000+Math.random()*10000000);
		     	
		     	if(!date1) element.date1 = "";
		     	else element.date1 = date1;
		     
		     	if(!date2) element.date2 = "";
		     	else element.date2 = date2;
		     	
		     	element.id = new_id.toString();
		     	element.icon = "";
		     	element.img_class = "note-clean";
		     	element.parent_id = parent_id.toString();
		     	element.position = 0;
		     	element.text = "";
		     	element.did = "";
		     	element.del = 0;
		     	element.tab = 0;
		     	element.fav = 0;
		     	element.time = jsNow();
		     	element.lsync = jsNow()-1;
		     	element.user_id = main_user_id;
		     	element.remind = 0;
		     	element["new"] = "";
		     	element.s = 0;
		     	element.title = title;

	     		db.put(global_table_name,element).done(function(){ this_db.log("Новый элемент записан в базу: "+element.id); });

		 	 return element;
		 	 }
		     		  
		     
		 this.jsUpdateNextAction = function(id) //кэширует в базе tmp_next (id следующего по дате дела)
		     {
			 this_db.log("Start filter Date");
			 var answer = my_all_data.filter(function(el,i) 
			     { 
			     if(el.tmp_nextdate) {  //стираю временные поля установленные ранее
			 		this_db.jsFind(el.id,{tmp_nextdate:"",
		     							  tmp_next_id:"", 
		     							  tmp_next_title:""});
			     }
			     if((settings.show_did==false) && (el.did!=0)) return false;
			     return el && el.date1!="";
			     });
			 this_db.log("Найдено "+answer.length+" записей с датой");
			 
			 $.each(answer,function(i,el){ //обходим все элементы с датой
				 var id_parent = el.id;
				 var j=0;
				 while(j<1000) //не больше 1000 уровней вложенности, чтобы исключить бесконечность
				 	{
				 	old_id = id_parent;
				 	element = this_db.jsFind(id_parent);
				 	id_parent=element.parent_id;
				 	
				 	if( ((!element.tmp_nextdate) || (element.tmp_nextdate > el.date1)) && (el.id!=element.id)) {
//				 		element.tmp_nextdate = el.date1; //устанавливаю новые поля
//				 		element.tmp_next_id = el.id;
//				 		element.tmp_next_title = el.title;
				 		this_db.jsFind(element.id,{tmp_nextdate:el.date1,
				 								   tmp_next_id:el.id, 
				 								   tmp_next_title:el.title});
				 		}
				 	
				 	if((id_parent==1) || (!id_parent)) break;
				 	j++;
				 	}
			 });
			 this_db.log("finish jsUpdateNextAction");
			 } //jsUpdateNextAction
		     
		 this.jsUpdateChildrenCnt = function(id) //кэширует в базе tmp_childrens, для быстрой работы (кол-во детей)
		     {
			this_db.log("start jsUpdateChildrenTmpCnt: id="+id);
			if(!id) { //если нужно обработать все элементы базы
					var answer = my_all_data.filter(function(el,i) 
					    { 
					    el.tmp_childrens = this_db.jsFindByParent(el.id).length;
					    });
				} else { //если нужно посчитать детей только id родителя
					this_db.jsFind(id.toString(),{tmp_childrens:this_db.jsFindByParent(id).length});
				}
			this_db.log("finish jsUpdateChildrenTmpCnt");
			} //jsUpdateChildrenCnt
		   	
		 this.jsMyAllDataForPut = function() //делает массив для сохранения с упорядоченным индексом без пропусков
		 	 {
		 	 var temp_my_all_data=[];
		 	 $.each(my_all_data, function(i,el){
			 	 if(el) temp_my_all_data.push(el);
		 	 });
		 	 return temp_my_all_data;
		 	 }
		 	 
		 this.js_LoadAllDataFromServer = function() //загружаю данные с сервера в внутреннюю базу данных
		     {
		     	var d = new $.Deferred();
			    if(!this_db.jsIsOnline) return true; //есть ли интернет
	  			setTimeout(function(){ this_db.log("Тип базы данных: "+db.getType());},500 );
		  		this_db.log("Удаляю локальную DB");

		  		db.clear(global_table_name).done(function(){
			  		this_db.log("Удалил локальную DB. Читаю данные с сервера.");
				    var sync_id = jsGetSyncId();
				    var lnk = "do.php?get_all_data2="+jsNow()+"&sync_id="+sync_id; 
			  		$.getJSON(lnk,function(data){
			  		   this_db.log("Загрузил с сервера ",Object.size(data.all_data)," элементов");
			  		   
			  		   var long_texts=[]; //длинные тексты храню в отдельной базе данных
			  		   my_all_data = [];
			  		   var tmp_my_all_data= [];
			  		   
			  		   $.each(data.all_data, function(i, value) {
			  		   	   if(value) {
					  		   value["new"] = "";
			
					  		   if(value["text"].length==0) 
					  		   	  value["tmp_txt_md5"] = "";
					  		   else
					  		      value["tmp_txt_md5"] = $.md5(value["text"]).substr(0,5);
					  		      //hex_md5(value["text"]).substr(0,5); //md5 штамп текста, для сверки
					  		      //hex_md5 - замедляет загрузку (у Safari == 5 секунд)
					  		      	
					  		   if(value["text"].length>LENGTH_OF_LONG_TEXT) 
					  		   		{
					  		   		long_texts.push({id:value.id, text:value.text});
					  		   		value.text = strip_tags(value.text).substr(0,LENGTH_OF_LONG_TEXT/2);
					  		   		value.tmp_text_is_long = 1;
					  		   		}
					  		   else value.tmp_text_is_long = 0;
					  		   	
					  		   my_all_data[value.id] = value; 
					  		   tmp_my_all_data.push(value);
					  	   }
			  		   });
			  		   this_db.log("Создал массив. Сохраняю локально.");
	
//			  			var tmp_my_all_data = this_db.jsMyAllDataForPut();
			  			db.put(global_table_name, tmp_my_all_data).then( //сохраняю главный массив
			  			  function(ids) {
			  			    this_db.log(ids.length+' записей записано в лок.базу = '+this_db.SizeOfObject(my_all_data)+'b');
			  				  		    	
			  			  }, function(e) {
			  			    throw e;
			  			  });
	
			  			db.put(global_table_name+"_texts", long_texts).then( //сохраняю длинные тексты
			  			  function(ids) {
			  			    this_db.log(ids.length+' длинных текстов записано в лок.базу = '+this_db.SizeOfObject(long_texts)+'b');
			  				long_texts="";//очищаю память  
			  				d.resolve();
			  				$(this_db).triggerHandler({type:"SyncIsFinished",value:jsNow()});		    	
			  			  }, function(e) {
			  			    throw e;
			  			  });
			  			  
			  			});
		  			}); //clear(4tree_db)
//		  	this_db.jsUpdateNextAction();
//		  	this_db.jsUpdateChildrenCnt();
			return d.promise();
	  		} //js_loadAllDataFromServer
		     
		 this.js_LoadAllFromLocalDB = function() //загружаю в массив все данные из локальной DB
		     {
	  		var d=new $.Deferred();
	  				this_db.log("Начинаю загрузку данных из локальной DB");
		    		db.values(global_table_name,null,MAX_VALUE).done(function(records) {
		    			this_db.log("Загрузил из локальной DB: " + records.length + " записей");
		    			my_all_data = [];
		    			$.each(records,function(i,el){
			    			my_all_data[el.id] = el;
		    			});
//		    			my_all_data = records;
		    			d.resolve();
		    			});
	  		return d.promise();
	  		} //js_LoadAllFromLocalDB
		     
		 this.SizeOfObject = function( object )  //грубый подсчёт размера массива объектов
		     {
			 		var objectList = [];
			 		var recurse = function( value )
			 		{
			 		    var bytes = 0;
			 		
			 		    if ( typeof value === 'boolean' ) {
			 		        bytes = 4;
			 		    }
			 		    else if ( typeof value === 'string' ) {
			 		        bytes = value.length * 2;
			 		    }
			 		    else if ( typeof value === 'number' ) {
			 		        bytes = 8;
			 		    }
			 		    else if
			 		    (
			 		        typeof value === 'object'
			 		        && objectList.indexOf( value ) === -1
			 		    )
			 		    {
			 		        objectList[ objectList.length ] = value;
			 		
			 		        for( i in value ) {
			 		            bytes+= 8; // an assumed existence overhead
			 		            bytes+= recurse( value[i] )
			 		        }
			 		    }
			 		
			 		    return bytes;
			 		}
			 		return recurse( object );
			} //roughSizeOfObject
		     
		 //api4tree.js_Calculate_md5_from_local_DB().done(function(x){console.info(x)})
	     this.js_Calculate_md5_from_local_DB = function() //вычисляю md5 всех данных из локальной DB
         	{
         	var d=$.Deferred();
         	db.values(global_table_name,null,MAX_VALUE).done(function(records) {
         	   var longtext=[],len;
    	       for(var i=0; len = records.length, i<len; i=i+1 )
    	       	{
    	       	var el = records[i];
    	       	var alldata = (el.id?el.id:"") + (el.title?el.title:"") + (el.tmp_txt_md5?el.tmp_txt_md5:"") + 
    	       				  (el.date1?el.date1:"") + (el.date2?el.date2:"") + 
    	       				  (el.did?el.did:"");
    	       	//alldata = el.id+":"+(el.title?el.title:"")+", ";
    	       	
    	 		var mymd5 = hex_md5( alldata ).substr(0,5);

    	       	if(el.id==6796) console.info("1038",alldata,mymd5);
    	 		
    	       	longtext.push({ id:el.id, md5:mymd5 });
    	       	}
         	  d.resolve(longtext);
         	  });
         	return d.promise();
         	}
		     
	     this.js_Compare_md5_local_vs_server = function() //сверяю md5 сервера с локальной DB
	     	{
		    if(!this_db.jsIsOnline) { d.resolve(); return d.promise(); } //есть ли интернет
	     	var d=$.Deferred();
	     	var sync_id = jsGetSyncId();
	     	//передаю время, чтобы заполнить время последней синхронизации
	     	var lnk = "do.php?get_all_data2="+jsNow()+"&sync_id="+sync_id+"&only_md5=1"; 
	     
	     	$.getJSON(lnk,function(data){
	         	this_db.js_Calculate_md5_from_local_DB().done(function(md5)
	         		{ 
	         			var test_ok = "выполнил успешно.";
	     	    		$.each(md5, function(i,el)
	     		    		{ 
	     		    		if( (el.id>0) && (el.md5!=data.md5[el.id]) )
	     		    			{
	     			    		console.info("!!!!!MD5!!!!!Данные на сервере не совпадают"+
	     			    					 " с локальными:",el.id,el.md5, data.md5[el.id],api4tree.jsFind(el.id)); 
	     			    		
	     			    		trampampam = this_db.jsFind(el.id,{lsync:0}); //восстанавливаю целостность, забирая элемент с сервера
	     			    		//jsSync();
	     			    		test_ok = "ПРОВАЛИЛ!!!!!!!!! :( ИСПРАВЛЯЮ :).";
	     			    		}
	     		    		});
	     		    console.info("Сверку с сервером по md5 "+test_ok);
   	     	    	d.resolve(test_ok);
	         		});
	         	});
	         return d.promise();
	     	}
	     	
	     function jsDry(data) //убираем все данные, кроме изменённых, чтобы экономить трафик в POST
	     {
	         var answer1 = new Array();
	         $.each(data, function(i,node){
	         	var changed_fields = node['new'];
	         	var element = new Object;
	         	element.id = node.id;
	         	if((node.id<0) || (node["new"]=="") )  
	         		{
	         		element = this_db.jsFind(node.id);
	         		answer1.push(element);
	         		changed_fields = "";
	         		}
	         	else
	         	$.each(node, function(keyname, keyvalue)
	         		{
	         		if(changed_fields)
	         		  if(( changed_fields.indexOf(keyname+',') != -1 ) || keyname=="time" || keyname=="lsync1" )
	         			{
	         			element[keyname] = keyvalue;
	         			}
	         		});
	         	if(changed_fields) answer1.push(element);
	         	});
	         
	         return answer1;
	     }
	     	
	     function startSync(status) //отображает статусы начала и окончания синхронизации
	     	{
	     	if(status=="start") {
				preloader.trigger("show");
				$(".icon-cd").css("color","#517c5d");
				this_db.log("Начинаю синхронизацию.");
				sync_now = true;
				clearTimeout(sync_now_timer);
				sync_now_timer = setTimeout(function(){ sync_now = false; }, 60000); //если синхр.не прошла сама
			} else {
				preloader.trigger("hide");
				$(".icon-cd").css("color","#888");
				this_db.log("Синхронизация завершена.");
				sync_now = false;
				clearTimeout(sync_now_timer);
			}
			
	     	}
	     	
	     function jsGetSyncId() //уникальный код для браузера (нужен для синхронизации)
	     	{
	     	///////////////////////////////////////////////////////////////////////////////
	     	//Устанавливаю индентификационный код (емайл + текущее время + инфо о браузере)
	     	var sync_id = localStorage.getItem("sync_id"); 
	     	if(!sync_id) 
	     		{
	     		var time_id = $.cookie("4tree_email_md") + '-' + jsNow() + '-' + navigator.userAgent;
	     		sync_id = $.md5(time_id).substr(0,5)+"@"+sqldate( jsNow() )+"";
	     		localStorage.setItem("sync_id",sync_id);
	     		sync_id = localStorage.getItem("sync_id");
	     		}
	     	return sync_id;
	     	}
	     	
	     function jsFindLastSync()  //нахожу время последней синхронизации, ориентируюсь на поле .time и .lsync
	     	{
	     	var maxt = 0; 
	     	var mint = Number.MAX_VALUE; 
	     	
	     	if(my_all_data)
	     	{
	     	var m_len = my_all_data.length;
	     	for(i=0;i<m_len;i++) 
	     		{ 
	     		if(!my_all_data[i]) continue;
	     		var lsync = my_all_data[i].lsync; 
	     		var changetime = my_all_data[i].time; 
	     		if(lsync>maxt) maxt=lsync; 
	     		if(changetime>lsync) 
	     			if( mint>changetime ) mint=parseInt(changetime,10); 
	     		}
	     	}
	     	
	     	if(mint<maxt) return mint;
	     	else return maxt;
	     	}
	     	
	     function jsChangeNewId(from_server_data) //заменяет отрицательный id на положительный
	     	{
	     	    var all_children = this_db.jsFindByParent(from_server_data.old_id);
	     	    var old_id = from_server_data.old_id;
	     	    var new_id = from_server_data.id;
	     	    $.each(all_children,function(i,ddd) //заменяю всем детям отрицательный parent_id на новый
	     	     	{
	     	     	this_db.jsFind(ddd.id,{ parent_id: new_id, "new":"" }); //new - не даст пересинхронизацию
	     	     	});
	     	
	     		element = this_db.jsFind(old_id);
	     		if(element) {
		     		element.id=new_id;					//заменяю id, сохраняю в базе и удаляю старый id
		     		db.put(global_table_name,element).done(function(){ 
		    			db.remove(global_table_name,old_id.toString()).done(function(){this_db.log("Удалил элемент с -id: ",old_id)});
  		        	});
  		        }
	     		
	     		
	     		
	     	
	     		$("#panel_"+old_id).attr("id","panel_"+new_id); //заменяю индексы видимых панелей
	     		$('.redactor_editor[myid='+old_id+']').attr("myid", new_id);
	     	    $('.divider_red[myid="'+old_id+'"]').attr('myid',new_id);
	     	    $(".makedone[myid="+old_id+"]").attr("myid",new_id); //заменяю индексы makedone
	     	    $("#node_"+old_id).attr("id", "node_"+new_id).find(".tcheckbox").attr("title", new_id);
	     	    
	     		var id = parseInt(window.location.hash.replace("#",""),36); //меняем хэш в адресной строке
	     		if(id==old_id) 
	     			{
	     			$(window).unbind('hashchange');
	     			window.location.hash = new_id.toString(36); 
	     			$(window).bind('hashchange', jsSethash );
	     			}
	     		
	     	}
	     	
	     this.jsSync = function(save_only) { //синхронизация данных с сервером
			var d = new $.Deferred();
			if(sync_now) { 
				this_db.log("Синхронизация уже идёт. Отменяю новый вызов."); 
				return true; 
			} else {
				if(!this_db.jsIsOnline()) return true;
				startSync("start"); //показываю пользователю, что синхронизация началась	
			}
			var sync_id = jsGetSyncId();
			
			var local_data_changed = my_all_data.filter(function(el) { //данные, которые буду отправлять на сервер
				if(el) return ( (el.parent_id<-1000) || 
								(el.id<-1000) || 
								(el.time>=el.lsync) || 
								((el.new!="") && (el.new)) ); 
			});
			
			var local_data_changed_tmp = [];
			var dfdArray = []; //массив для объектов работы с асинхронными функциями
			
			$.each(local_data_changed,function(i,el){ //ищу длинные тексты, чтобы забрать из другой базы
				local_data_changed_tmp[el.id]=el;
				if(el.tmp_text_is_long==1) {
					dfdArray.push( this_db.jsFindLongText(el.id).done(function(longtext){
						this_db.log(el.id, longtext.length); 
						local_data_changed_tmp[el.id].text = longtext; //длинные тексты отправляю в массив
					}) );
				};
			});
			
			$.when.apply( null, dfdArray ).then( function(x){ //выполняю тогда, когда все длинные тексты считаны
				this_db.log("Отправляю на сервер "+Object.size(local_data_changed_tmp)+" элементов");
				
				//"высушиваю" данные и превращаю в JSON строку:
				var local_data_changed_json_dry = JSON.stringify( jsDry(local_data_changed) ); 	
				
				this_db.log("Высушил данные, отправляю на сервер:",	local_data_changed_json_dry);	
				
				var changes = 'changes='+encodeURIComponent(local_data_changed_json_dry)+'&confirm=';

				if(!save_only) var what_to_do = "save_and_load";
				else var what_to_do = "save_only";
				
				var lastsync_time_client = jsFindLastSync();
				
				var lnk = "do.php?sync_new="+sync_id+"&time="+lastsync_time_client+"&now_time="+jsNow(true)+"&what_you_need="+what_to_do;
				
				this_db.log(lnk);
				
				$.postJSON(lnk,changes,function(data,j,k){ //////////////A J A X/////////////////
				     if(j=="success") {
				     	this_db.log("Получен ответ от сервера: ",data);
				     	if(data.saved) { //данные, которые сервер успешно сохранил. Отмечаю им lsync = jsNow().
					     	$.each(data.saved,function(i,d) {
					     		if(d.old_id) { //если нужно присвоить выданный id вместо отрицательного
					     			jsChangeNewId(d);
					     		}
   				 	    	$("li[myid='"+d.id+"'] .sync_it_i").addClass("hideit"); //скрываю зелёный кружок
   				 	    	this_db.log("synced", this_db.jsFind(d.id,{"new":"",lsync: data.lsync},"save_anyway") );
					     	});
				     	}
				     } //if success
				startSync("finish");
				d.resolve();	
				}); //postJSON
				
				
			}); //$.when
						
			return d.promise();			
	     } //jsSync
		      		
		 this.js_InitDB(); //инициализирую соединение с базой
		  	
		 }
	 }
	 return arguments.callee.instance;
}


/////////////////////////////////////PANEL/////////////////////////////////////////
var API_4PANEL = function(global_panel_id,need_log) {
	 if ( (typeof arguments.callee.instance=='undefined') || true)
	 {
	  arguments.callee.instance = new function(){

		 this.log = function(x1,x2,x3,x4,x5) { //логирование любых 5 параметров в консоль
		 	var time_dif = jsNow()-last_log_time;
		    last_log_time=jsNow();
		    if(need_log) { 
		    	console.info(log_i+". log("+time_dif+"ms): ",x1?x1:" ",x2?x2:" ",x3?x3:" ",x4?x4:" ",x5?x5:" "); 
		      	log_i++;
		    }
		 } //log
		 
		 function jsFindPath = function(id){
		 	
		 	}
		 
		 function jsInfoFolder(data,parent_node){ //заполняет массив данными элемента
		 	var mytitle = data.title;
		 	if(parent_node==-1) //панель поиска
		 	  {
		 	  var ans = jsFindPath(data.id);
		 	  if(ans)
		 	    	var add_text = '<br><span class="search_path">'+jsTextPath( ans )+'</span>';
		 	  else var add_text = '';
		 	  length = $(".search_panel_result").width()*2.3;
		 	  var findtext = $('#textfilter').val();
		 	  var text = jsFindText(data.text,findtext,length);
		 	  
		 //	  mytitle = mytitle.replace(findtext,"<b>"+findtext+"</b>");
		 	  
		 	  var temp_data = jsFindByTreeId(data.id,-1);
		 	  if(temp_data.length>0) 
		 	  	{
		 	  	var findcomment = temp_data.filter(function(el){
		 	  		return el.text.toLowerCase().indexOf(findtext.toLowerCase())!=-1;
		 	  		});
		 	  	if(findcomment[0])
		 	  		{
		 	    			console.info("FIND_SAMPLE = ",findcomment[0]);
		 	    			if(text) var text_comment = '<br>';
		 	    			else var text_comment = "";
		 	    			text_comment = text_comment + '<div class="comment_foto"><img src="image.php?width=15&height=15&cropratio=1:1&image=/'+findcomment[0].foto+'" height="15px" width="15px" class="comment_foto_img"></div> <u>'+findcomment[0].name+'</u>: <i>'+strip_tags(findcomment[0].text)+'</i>';
		 	  		}
		 	  	}
		 	  else var text_comment = "";
		 	  
		 	  var search_sample = '<div class="search_sample">'+text+text_comment+'</div>';
		 	  }
		 	else { add_text = ''; search_sample = ''; }
		 
		 	if(parent_node==-2) //указание папки переноса дела
		 	  {
		 	  var where_to_add = $(".combo_list ul");
		 	  var ans = jsFindPath(data.id);
		 	  if(ans)
		 	    	var add_text = '<br><span class="search_path">'+jsTextPath( ans )+'</span>';
		 	  else var add_text = '';
		 	  }
		 
		 //////
		 	if( ((data.lsync - data.time) > 0) || (data["new"]=="position,"))
		 	    var hideit = " hideit";
		 	else
		 	    var hideit = "";
		 
		 	var needsync = "<div class='syncit'><i class='icon-arrows-cw sync_it_i"+hideit+"'></i></div>";
		 
		 //////
		 	if(data.did!="") var crossline = " do_did";
		 	else var crossline = "";
		 
		 //////
		 	if(data.remind==0) var remind = "";
		 	else var remind = "<i class='icon-bell-1' style='float:right;'></i>";
		 /////
		 	var add_class = jsMakeIconText(data.id,data.text).myclass;
		 /////
		 	if(data.icon=='') 
		 	  var img = "<div class='node_img "+add_class+"'>"+"</div>";
		 	else 
		 	  {
		 	  var icon = data.icon.replace("mini/","");
		 	  icon = "image.php?width=50&height=50&cropratio=1.1:1&image=/"+icon;
		 	  var img = "<div class='node_img node_box' style='background-image:url("+icon+")'>"+"</div>";
		 	  }

		 /////
		 	var datacount = Object.size( jsFindByParent(data.id,null,true) );
		 	
		 	if(datacount>0) 
		 	  { 
		 	  countdiv = "";
		 	  var isFolder="folder"; 
		 
		 	  var add_class = jsMakeIconText(data.id,data.text).myclass;
		 	  var textlength = jsMakeIconText(data.id,data.text).mylength; 
		 
		 	  if(textlength>0)
		 	    	var isFull = " full";
		 	  else
		 	    	var isFull = "";
		 	  var img = "<div class='folder_closed"+isFull+"'>"+"<div class='countdiv'>"+datacount+"</div>"+"</div>";
		 	  var triangle = 	 "<div class='icon-play-div'>"+
		 	  	  		 " 	<i class='icon-play'></i>"+
		 	  	  		 "</div>";
		 	  }
		 	else 
		 	  { 
		 	  var countdiv = ''; 
		 	  var isFolder = "";
		 	  if(data.parent_id==1) var display = "opacity:0;";
		 	  else var display = "opacity:0;";
		 	  var triangle = 	 "<div class='icon-play-div' style='"+display+"'>"+
		 	  	  		 " 	<i class='icon-play'></i>"+
		 	  	  		 "</div>";
		 	  }
		 	  
		 /////////////////////////////////////////////////
		 
		 	(my_all_frends)   
		 	  if(data.share) //нужно исправить, такой переменной нет!
		 	  	{
		 	  	if(data.user_id==data.share)
		 	    		frend_share = my_all_frends.filter(function(el){ return el.user_id == data.share; });
		 	    	else
		 	    		frend_share = my_all_frends.filter(function(el){ return el.user_id == data.user_id; });
		 
		 	  if(frend_share[0].user_id!=main_user_id)
		 	  	icon_share = "<div title='"+frend_share[0].fio+" ("+frend_share[0].email+")\nделится с вами СВОЕЙ веткой' class='share_img'><img src='"+frend_share[0].foto+"'></div>";
		 	  else
		 	  	{
		 	  	if(my_all_share)
		 	  	  var ddd =my_all_share.filter(function(el){ return (el.host_user==main_user_id && (el.tree_id==data.id)); });
		 	  	icons_share = "";
		 	  	$.each(ddd,function(j,myfrend){
		 	    		frend_share = my_all_frends.filter(function(el){ return el.user_id == myfrend.delegate_user; });
		 	    		icon_share = icon_share+"<div title='"+frend_share[0].fio	+" ("+frend_share[0].email+")\nможет редактировать ВАШУ ветку' class='share_img'><img src='"+frend_share[0].foto+"'></div>";
		 	  		});
		 	  	}
		 	  	
		 	  	}
		 
		 	var icon_share = "";
		 
		 	(my_all_frends)   
		 	  if(data.user_id != main_user_id ) 
		 	  	{
		 	    	frend_share = my_all_frends.filter(function(el){ return el.user_id == data.user_id; });
		 	    if(frend_share[0])
		 	  	icon_share = "<div title='"+frend_share[0]["fio"]+" ("+frend_share[0]["email"]+")\nделится с вами СВОЕЙ веткой' class='share_img'><img src='"+frend_share[0]["foto"]+"'></div>";
		 	  	}
		 	  
		 	var comment_count = jsFindByTreeId(data.id,-1).length;
		 	if (comment_count==0) comment_count="";
		 		    
		 return {comment_count:comment_count,
		 	     countdiv:countdiv, //кол-во элементов внутри папки
		 	     isFolder:isFolder, 
		 	     img: img, 
		 	     triangle:triangle, 
		 	     icon_share:icon_share, 
		 	     add_text:add_text, 
		 	     search_sample:search_sample, 
		 	     mytitle:mytitle, 
		 	     remind:remind, 
		 	     crossline:crossline, 
		 	     needsync:needsync};

		 } //jsInfoFolder
		 
		 
		 this.jsRenderOneElement = function(data, parent_node){
		 	var info = jsInfoFolder(data,parent_node);
		 	return info;
		 } //jsRenderOneElement
		 


	  } //arguments.callee.instance
	 } //if typeof
	 
	 return arguments.callee.instance;
}

///////////////////////////////////////////////////////////////////////////////////
var DB_INTERFACE = function(global_table_name){  //singleton
	 if (typeof arguments.callee.instance=='undefined')
	 {
	  arguments.callee.instance = new function()
		  {
		    var db = new ydn.db.Storage('4tree_db');    
	    	console.info("tree_db started"); 
		    
		    this.calculate_md5 = function() //проверяю целостность данных
		    	{
		    	var d=$.Deferred();
		    	db.values('tree',null,9999999999999999999).done(function(records) {
		    	  var longtext=[];
			      for(var i=0; len = records.length, i<len; i=i+1 )
			      	{
			      	el = records[i];
			      	var alldata = (el.id?el.id:"") + (el.title?el.title:"") + (el.text?el.text:"") + 
			      				  (el.date1?el.date1:"") + (el.date2?el.date2:"") + 
			      				  (el.did?el.did:"");
//			      	alldata = el.id+":"+(el.title?el.title:"")+", ";
				if(el.id==6679) console.info("Сверка md5:"+alldata);
					var mymd5 = hex_md5( alldata ).substr(0,5);
					
			      	longtext.push({ id:el.id, md5:mymd5 });
			      	}
		    	  d.resolve(longtext);
		    	  });
		    	return d.promise();
		    	}
		    
		    this.clear_all_data = function() //очищаю всю базу данных
		    	{
		    	var d=$.Deferred();
		    	if( JSON.stringify(db.getSchema().stores).indexOf('"tree"') != -1 ) //если таблицы tree нет
			    	db.clear().done(function(){ d.resolve(); });
			    else
			    	d.resolve();
		    	return d.promise();
		    	}

		    this.clear_tree_data = function() //Очищаю таблицу в базе данных "tree"
		    	{
		    	var d=$.Deferred();
		    	
		    	if( JSON.stringify(db.getSchema().stores).indexOf('"tree"') != -1 ) //если таблицы tree нет
		    		{
		    		db.clear("tree").done(function(){ d.resolve(); });
		    		}
		    	return d.promise();
		    	}
		    	
		    this.FindByParent = function(parent_id)
		    	{
		    	var d=$.Deferred();
		    	db.executeSql("SELECT * FROM tree WHERE 1273 = 1273").done(function(records){ d.resolve(records) });
		    	return d.promise();
		    	}
		    	
		    this.setItem = function(param_name, param_value)
		    	{
		    	var d=$.Deferred();
		    	if( typeof param_value == 'undefined' ) //считать параметр
		    		{
			    	var iter = ydn.db.KeyRange.only(param_name);
			    	db.values("tree_settings",iter).done(function(records) {
				    	var x = records[0].value;
				    	d.resolve(x); 
				    	});
		    		}
		    	else
		    		{
			    	db.put('tree_settings', {value:param_value}, param_name).
			    						done(function(){ d.resolve(param_value); }); 
		    		}
		    	return d.promise();
		    	}
		    	
		    this.compare_md5_local_and_server = function()
		    	{
		    	return true;
		    	var d=$.Deferred();
		    	var sync_id = jsGetSyncId();
		    	//передаю время, чтобы заполнить время последней синхронизации
				var lnk = "do.php?get_all_data2="+jsNow()+"&sync_id="+sync_id+"&only_md5=1"; 
	
				$.getJSON(lnk,function(data){
			    	tree_db.calculate_md5().done(function(md5)
			    		{ 
			    			var test_ok = "выполнил успешно.";
				    		$.each(md5, function(i,el)
					    		{ 
					    		if( (el.id>0) && (el.md5!=data.md5[el.id]) )
					    			{
						    		console.info("!!!!!MD5!!!!!Данные на сервере не совпадают"+
						    					 " с локальными:",el.id,el.md5, data.md5[el.id],jsFind(el.id)); 
						    		
						    		trampampam = jsFind(el.id,{lsync:0}); //восстанавливаю целостность, забирая элемент с сервера
						    		jsSync();
						    		test_ok = "ПРОВАЛИЛ!!!!!!!!! :( ИСПРАВЛЯЮ :).";
						    		}
					    		});
					    console.info("Сверку с сервером по md5 "+test_ok);
   				    	d.resolve(test_ok);
			    		});
			    	});
			    return d.promise();
		    	}
		    	
		    	
		    this.load_from_server = function()
		    	{
		    	var d=$.Deferred();
		    	var sync_id = jsGetSyncId();
		    	//передаю время, чтобы заполнить время последней синхронизации
				var lnk = "do.php?get_all_data2="+jsNow()+"&sync_id="+sync_id; 
				preloader.trigger('show');
	
				$.getJSON(lnk,function(data){
					if(!data.all_data) 
						{
						tree_db.clear_all_data();
						alert("Данные с сервера не доступны");
						}
					jsTitle('Данные загружены с сервера');
					if(data.time_dif) localStorage.setItem("time_dif",data.time_dif);
					localStorage.setItem("last_sync_time",jsNow());
					localStorage.setItem("sync_time_server",jsNow());
					localStorage.setItem("sync_id",sync_id);
					my_all_data = $.map(data.all_data, function (value, key) { return value; });
					my_all_comments = $.map(data.comments, function (value, key) { return value; });
					tree_db.save_data();
//					jsSaveDataComment();
					preloader.trigger('hide');
					console.info("my_all_data:",my_all_data);
					console.info("my_all_comments:",my_all_comments);
					});

		    	return d.promise();
		    	}

		    this.save_data = function(id) //сохраняю my_all_data в базу данных, 
		    	{ 
		    	var d=$.Deferred();
			    var my_length = my_all_data.length;
			    var elements = [], ids = [];
			    for(i=0;i<my_length;i=i+1)
			    	{
			    	var el=my_all_data[i];
			    	if(typeof id == 'undefined' || el.id==id) //если есть id, то сохраняю не всё
			    		{
				    	elements.push( el );
				    	ids.push( parseInt(el.id) );
				    	}
			    	}

			    if(typeof id == 'undefined')
				    {
				    tree_db.clear_tree_data().done( function()
				    	{ 
				    	db.put('tree', elements, ids).done(function(){ d.resolve(); }); 
				    	});
				    }
				else //если нужно сохранить один элемент
					{
				    	db.put('tree', elements, ids).done(function(){ d.resolve(); }); 
					}
			    
			    return d.promise();
		    	};
		    
		    //считаю кол-во элементов t=tree_db.count_lines().done(function(x){console.info("lines="+x)})
		    this.count_lines = function() 
		    	{
		    	var d=$.Deferred();
		    	db.count('tree').done(function(x) 
		    		{
		    		console.info(x);
				    d.resolve(x);
				    });
				return d.promise();
		    	};
		    
		    //загружаю все данные в my_all_data
		    this.load_data = function() 
		    	{
		    	var d=$.Deferred();
		    	db.values('tree',null,9999999999999999999).done(function(records) {
			      my_all_data = $.map(records, function (value, key) { return value; });
		    	  d.resolve(records);
		    	});
				return d.promise();
		    	};
		    
		  };
	 }
	 return arguments.callee.instance;
};


jQuery.fn.quickEach = (function() {
  var jq = jQuery([1]);
  return function(c) {
   var i = -1,
       el, len = this.length;
   try {
    while (++i < len && (el = jq[0] = this[i]) && c.call(jq, i, el) !== false);
   } catch (e) {
    delete jq[0];
    throw e;
   }
   delete jq[0];
   return this;
  };
 }());


function jsZipTree()
{
  var zip = new JSZip();
  
  $.each(my_all_data,function(i,el){
	  
	var d=new Date; 
	var today_date = d.jsDateTitleFull();  
	  
	var path = jsTextPath(jsPath(jsFind(el.id)));
	path = path.replace(" → ","/").replace(" → ","/").replace("→","/");
	path = strip_tags(path);

  	var text = el.text;
  	text = text.replace('data/','http://4tree.ru/data/');
  	text = text.replace('.upload/','http://4tree.ru/upload/');
  	text = text.replace('"upload/','"http://4tree.ru/upload/');
  	text = text.replace('"data/','"http://4tree.ru/data/');
  	
  	text = "<h2>"+el.title+"</h2>"+text;
  	
  	mytitle = el.title;
  	if(mytitle) 
  		{
  		mytitle = strip_tags( mytitle.replace("/","|").replace("→","/") );
  		}
  	
  	if(text.length>1)
  		{
  	  	zip.file("4tree-Архив ("+today_date+")/"+path+mytitle+".html", text);
  	  	}
  	})

  // data URI
  $('#zip-archive').attr("href", "data:application/zip;base64," + zip.generate() );
  // Blob
  var blobLink = document.getElementById('blob-archive');
  try {
    blobLink.download = "4tree_archive_"+sqldate(jsNow())+".zip";
    blobLink.href = window.URL.createObjectURL(zip.generate({type:"blob"}));
  } catch(e) {
    blobLink.innerHTML += " (not supported on this browser)";
  }
}

function jsTestDate() //тестирование парсера даты
{
var test = [
		"02.05.2012 12:30",
		"02 05 2012 12:30",
		"2 мая 16:00",
		"12 июня 2016 года",
		"12-05-2012",
		"через 3 дня в 8часов 30 минут",
		"через неделю в 8",
		"через неделю в 8:00",
		"через 2 недели",
		"через 2 недели 9:30",
		"через 30 минут",
		"через 30м",
		"через 2часа 30 минут",
		"через 2 часа",
		"через 3 месяца",
		"через 3 месяца 8:30",
		"через 2 года",
		"через год",
		"через год 9:30",
		"через 2 дня",
		"через 1000 дней",
		"через 1000 лет",
		"Завтра в 6",
		"сегодня",
		"послезавтра в 8",
		"следующий четверг в 8ч",
		"днём",
		"утром",
		"вчера 11:25",
		"позавчера 12:40",
		"3 дня назад",
		"вечером",
		"прошлый понедельник",
		"Мыть в 8:30",
		"Мыть в 8ч30м",
		"Мыть в 8часов 30минут",
		"Мыть в 9",
		"Мыть в 8ч 30м",
		"Завтра в 8:30",
		"в конце мая",
		"в мае"
		];

test = [
		"02.05.2012 12:30",
		"помыть машину в пятницу"
	   ];


$.each(test,function(i,el) 
 	{
 	console.info(i,jsParseDate(el)["title"],jsParseDate(el)["date"], "              "+el );
 	});

}

function jsParseDate(title) //парсер даты (позвонить послезавтра)
{
var answer = "";
var did = false;
var mytime = "";
var mydate = new Date();
var newdate = new Date();

var d = new Object;

d.myhours = 0;
d.myminutes = 0;
d.mydays = 0;
d.mymonth = 0;
d.myyears = 0;
d.myweek = 0;


var shablon = /(\d{1,2}.\d{1,2}.\d{4})/g; 
var matches = title.match(shablon);

if(matches)
  {
	shablon = /(\d{1,4})/g; 
	var matches2 = matches[0].match(shablon);
    newdate.setDate(matches2[0]);
    newdate.setMonth(matches2[1]-1);
    newdate.setFullYear(matches2[2]);
    answer = matches2[0] + "." + matches2[1] + "." + matches2[2];
    did = true;
  }

shablon = /(\d{1,2} янв)|(\d{1,2} фев)|(\d{1,2} мар)|(\d{1,2} апр)|(\d{1,2} мая)|(\d{1,2} май)|(\d{1,2} июн)|(\d{1,2} июл)|(\d{1,2} авг)|(\d{1,2} сен)|(\d{1,2} окт)|(\d{1,2} ноя)|(\d{1,2} дек)/g; 
matches = title.match(shablon);

if(matches)
  {
  	console.info(matches);
	shablon = /(\d{4})/g; 
	matches2 = title.match(shablon); //найти год

	shablon = /(янв)|(фев)|(мар)|(апр)|(мая)|(май)|(июн)|(июл)|(авг)|(сен)|(окт)|(ноя)|(дек)/g; 
	matches3 = title.match(shablon); //найти месяц

	shablon = /(\d{1,2})/g; 
	matches4 = matches[0].match(shablon); //найти дату

	if(matches3[0]=="янв") var mymonth = 1;
	if(matches3[0]=="фев") var mymonth = 2;
	if(matches3[0]=="мар") var mymonth = 3;
	if(matches3[0]=="апр") var mymonth = 4;
	if(matches3[0]=="мая") var mymonth = 5;
	if(matches3[0]=="май") var mymonth = 5;
	if(matches3[0]=="июн") var mymonth = 6;
	if(matches3[0]=="июл") var mymonth = 7;
	if(matches3[0]=="авг") var mymonth = 8;
	if(matches3[0]=="сен") var mymonth = 9;
	if(matches3[0]=="окт") var mymonth = 10;
	if(matches3[0]=="ноя") var mymonth = 11;
	if(matches3[0]=="дек") var mymonth = 12;
	
    newdate.setDate(matches4[0]);
    newdate.setMonth(mymonth-1);

    if(matches2) newdate.setFullYear(matches2[0]);
    
    answer = matches4[0] + " " + matches3[0];
    did = true;
  }


shablon = /(вчера)|(позавчера)|(сегодня)|(завтра)|(послезавтра)/g; 
matches = title.match(shablon);
if(matches)
  {
	if(matches[0]=="позавчера") var add_days = -2;
	if(matches[0]=="вчера") var add_days = -1;
	if(matches[0]=="сегодня") var add_days = 0;
	if(matches[0]=="завтра") var add_days = +1;
	if(matches[0]=="послезавтра") var add_days = +2;
	
	newdate.setDate( newdate.getDate() + add_days );
    answer=" + " + matches[0];
    did = true;
  }



shablon = /(\d{1,2}ч|\d{1,2} ч)|(в \d{1,2}:\d{1,2})|(в\d{1,2}:\d{1,2})|(\d{2} ми)|(\d{2}ми)|(\d{1,2} \d{2}м)|(в \d{1,2})|(в\d{1,2})|(\d{1,2}:\d{1,2})/g; 

//([^,]\d{1,2} \d{2}[^\s\d])|

matches = title.match(shablon);

if(matches)
	if(matches.length==1) mytime = matches;
	else mytime = matches.join(" ");
	

//console.info("GGGGGG=",title,answer);

matches2 = title.match(/\d{1,4}/g); //все двух-значные цифры

if(false)
 {
 if(matches2)
	if(matches2.length==1) answer = matches2;
	else answer = matches2.join(":");
 }

var plus;

shablon = /(дней|лет|нед|год|мес|день|дня|час|мин|\d{1,2}м|\d{1,2} м)/g;
matches = title.match(shablon);
if( ( (title.indexOf("назад")!=-1) || (title.indexOf("через")!=-1) ) && matches ) //если "через 2 часа 30 минут"
	{	
	if (title.indexOf("через")!=-1) plus = "+";
	else plus = "-";
	
		if(matches[0]=="час") //если указаны часы и минуты
			{
			if(matches2)
				{
				answer = plus;
				if(matches2[0]) { answer += matches2[0] + " час."; d.myhours=plus+matches2[0]; }
				if(matches2[1]) { answer += " "+matches2[1] + " мин."; d.myminutes=plus+matches2[0]; }
				mytime = ""; //это не время
				}
			}
		if(matches[0]=="мин" || (matches[0][matches[0].length-1]=="м" && (title.indexOf("мес")==-1 ))) //если указаны только минуты
			{
			if(matches2)
				{
				answer = plus;
				if(matches2[0]) { answer += " "+matches2[0] + " minute"; d.myminutes=plus+matches2[0]; }
				mytime = ""; //это не время
				}
			}
		if(matches[0]=="нед") //если указаны только недели
			{
			if(matches2)
				{
				answer = plus;
				if(matches2[0]) { answer += ""+matches2[0] + " нед."; d.myweek = plus+matches2[0]; };
				}
			if(title.indexOf("через нед")!=-1) { answer = "+ 1 нед."; d.myweek = plus+1 };
			}
		if(title.indexOf("месяц")!=-1) //если указаны только месяцы
			{
			if(matches2)
				{
				answer = plus;
				if(matches2[0]) { answer += ""+matches2[0] + " мес."; d.mymonth = plus+matches2[0]; };
				}
			if(title.indexOf("через мес")!=-1) { answer = "+ 1 мес."; d.mymonth = plus+1; };
			}
		if( (title.indexOf(" год")!=-1) || (title.indexOf(" лет")!=-1) ) //если указаны только месяцы
			{
			if(matches2)
				{
				answer = plus;
				if(matches2[0]) { answer += ""+matches2[0] + " год.";  d.myyears = plus+matches2[0]; };
				}
			if(title.indexOf("через год")!=-1) { answer = "+ 1 год.";  d.myyears = plus+1; };
			}

		if( (title.indexOf(" день")!=-1) || (title.indexOf(" дня")!=-1) || (title.indexOf(" дней")!=-1) ) //если указаны только месяцы
			{
			if(matches2)
				{
				answer = plus;
				if(matches2[0]) { answer += ""+matches2[0] + " дн."; d.mydays = plus+matches2[0]; };
				}
			if(title.indexOf("через год")!=-1) { answer = "+ 1 дн."; d.mydays = plus+1; };
			}
		
	}

if(mytime!="")
	{
	///анализ времени
	shablon = /(в \d{1,2})|(в\d{1,2})|(\d{1,2}:\d{1,2})/g; 
	matches = mytime.toString().match(shablon);
	
	if((matches))
		{
		need_analyse = mytime.toString().match(/(в \d{1,2} в \d{1,2})|(\d{1,2} \d{1,2}м)|(\d{1,2}ч\d{1,2}м)|(\d{1,2}ч \d{1,2}м)|(\d{1,2}:\d{1,2})/g);
		
		shablon1 = /(в \d{1,2}:\d{1,2})|(в\d{1,2}:\d{1,2})/g; 
		matches1 = mytime.toString().match(shablon1);
		if(matches1) need_analyse=false;
		
		
		if(!need_analyse)
		 	{
			mytime = mytime.toString().replace("в ","").replace("в","");
			if(!matches1) mytime += ":00";
			}
		else
			{
			matches3 = mytime.toString().match(/\d{1,4}/g); //все двух-значные цифры
			
			if(matches3)
				if(matches3.length==1) mytime = matches3;
				else mytime = matches3.join(":");
			}
		}

	}


if(mytime!="") var add = "[" + mytime+"]";
else var add="";

if( (mytime!="") )
	{
	
	if(mytime.toString().match(/\d{1,2}:\d{1,2}/g))
		{
		newtime = mytime.toString().split(":");
		mydate.setHours(parseInt(newtime[0]),10 );
		mydate.setMinutes(parseInt(newtime[1],10) );
		mydate.setSeconds(0);
		}
	else
		{
		mytime = "";
		}
	
	}



if(did) 
	{
	newdate.setHours( mydate.getHours() + parseInt(d.myhours,10) );
	newdate.setMinutes( mydate.getMinutes() + parseInt(d.myminutes,10) );
	newdate.setSeconds(0);
	mydate = newdate;
	}
else
	{
	mydate.setHours( mydate.getHours() + parseInt(d.myhours,10) );
	mydate.setMinutes( mydate.getMinutes() + parseInt(d.myminutes,10) );
	mydate.setSeconds(0);
	}



mydate.setDate( mydate.getDate() + parseInt(d.mydays,10) + parseInt(d.myweek*7,10));
mydate.setMonth( mydate.getMonth() + parseInt(d.mymonth,10) );
mydate.setYear( mydate.getFullYear() + parseInt(d.myyears,10) );

shablon = /(понед)|(вторн)|(сред)|(четв)|(пятн)|(субб)|(воскр)/g; 
matches = title.match(shablon);
if(matches)
	{
	week = 0;
	if(matches[0]=="понед") week = 1;
	if(matches[0]=="вторн") week = 2;
	if(matches[0]=="сред") week = 3;
	if(matches[0]=="четв") week = 4;
	if(matches[0]=="пятн") week = 5;
	if(matches[0]=="субб") week = 6;
	if(matches[0]=="воскр") week = 7;
	if(week != 0) 
		{
		mydate = nextWeekDay(mydate,week);
		answer = matches[0];
		}
	}



if((answer=="") && (mytime =="")) mydate = "";

return {title:answer+" "+add,date:mydate};
}


function nextWeekDay(date,day){ //поиск следующего дня недели
(day = (Math.abs(+day || 0) % 7) - date.getDay()) < 0 && (day += 7);
return day && date.setDate(date.getDate() + day), date;
};

function jsGetDateRangeOfWeek(weekNo){

sync_now = true;

		weekNo = weekNo - 1;
		var d1 = new Date();
		numOfdaysPastSinceLastMonday = eval(d1.getDay()- 1);
		d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
		var weekNoToday = d1.getWeek();
		var weeksInTheFuture = eval( weekNo - weekNoToday );

		var startDate = d1.setDate(d1.getDate() + eval( 7 * weeksInTheFuture ));
		
		d1.setDate(d1.getDate() + 6);		
		
		for(var ik=0; ik < 7; ik+=1)
			{
			cur_date = d1.setDate( d1.getDate() + 1 );
			console.info("d=", sqldate( cur_date ) );
			jsDiaryPath( cur_date , true );
			}
		
sync_now = false;
		
};


function open_in_new_tab(url )  //открывает ссылку в новом tab тестированно в chrome
{
  window.open(url, '_blank');
  window.focus();
}		




function jsFindRecur(date)  //поиск повторяющихся дел
{
var recur_dates = my_all_data.filter(function(el,i) 
	{ 
	if(!el) return false;
	if(el.date1) 
		if ((el.del!=1) && (el.date1!="")) 
			if(el.r)
				if(el.r!="") return true;
	});	
/* r = recur_type
//0 - внутри дня
//1 - ежедневные
//2 - понедельно
//3 - ежемесячно
//4 - ежегодно
n - каждые n дней
w - дни недели: 1,2,3,4,5,6,7. 0 - если все дни */

//  $sqlnews .= "( SELECT * FROM tree_recurring WHERE ((`day`=$day AND `month`=$month AND `year`=$year) OR (recur_mode = '2' AND WEEKDAY(CONCAT(`year`,'-',`month`,'-',`day`)) = WEEKDAY('$dd')) ) AND user_id=".$GLOBALS['user_id']." AND  DATEDIFF( CONCAT('$year','-','$month','-','$day') , CONCAT(`year`,'-',`month`,'-',`day`) )>0 )";

var week_dates = recur_dates.filter(function(el,i) 
	{ 
	if(el.date1.split(" ")[0]==date.split(" ")[0]) return true; //если это тот-же день

	if(el.r == 4) //каждый год в определенный день и месяц
		{
		el_date = Date.createFromMysql(el.date1);
		el_month = el_date.getMonth();
		el_day = el_date.getDate();
		
		sample_date = Date.createFromMysql(date);
		sample_month = sample_date.getMonth();
		sample_day = sample_date.getDate();
		
		if(el_month==sample_month)
		  if(el_day==sample_day)
			if(el.date1<=date) return true;
		}


	if(el.r == 3) //каждый месяц в определённый день
		{
		el_date = Date.createFromMysql(el.date1);
		el_month = el_date.getMonth();
		el_day = el_date.getDate();
		
		sample_date = Date.createFromMysql(date);
		sample_month = sample_date.getMonth();
		sample_day = sample_date.getDate();
		
		if(el_day==sample_day)
			if(el.date1<=date) return true;
		
		}
	
	if(el.r == 2) //еженедельно в определенные дни недели
	  	{
		el_week = Date.createFromMysql(el.date1).toString().substr(0,3);
		sample_week = Date.createFromMysql(date).toString().substr(0,3);
		week_num = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(sample_week)+1;

		if(el.w=="" || !el.w)
			{
			is_week = (sample_week == el_week);
			}
		else
			{
			is_week = !(el.w.split(",").indexOf(week_num.toString()) == -1);
			}
		
			console.info("week=",el.w,week_num,is_week,date);

		if(is_week) 
			if(el.date1<=date) return true;
	  	}
	});	

return week_dates;
}

function jsMakeShortRecur() //обработка формы выбора повторения дела
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
			var text = 'каждую неделю';
		else
			{
			var text = 'кажд. '+my_col+' нед.';
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
		$(".r_week:checked").quickEach(function(){
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


Date.prototype.getWeek = function () {  //определяет номер недели у любой даты (new Date()).getWeek() 
    // Create a copy of this date object  
    var target  = new Date(this.valueOf());  
  
  	console.info(target);
  
    // ISO week date weeks start on monday  
    // so correct the day number  
    var dayNr   = (this.getDay() + 6) % 7;  
  
    // ISO 8601 states that week 1 is the week  
    // with the first thursday of that year.  
    // Set the target date to the thursday in the target week  
    target.setDate(target.getDate() - dayNr + 3);  
  
    // Store the millisecond value of the target date  
    var firstThursday = target.valueOf();  
  
    // Set the target to the first thursday of the year  
    // First set the target to january first  
    target.setMonth(0, 1);  
    // Not a thursday? Correct the date to the next thursday  
    if (target.getDay() != 4) {  
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);  
    }  
  
    // The weeknumber is the number of weeks between the   
    // first thursday of the year and the thursday in the target week  
    return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000  
}  

    
Date.prototype.getDOY = function() {
var onejan = new Date(this.getFullYear(),0,1);
return Math.ceil((this - onejan + 1) / 86400000);
}


function jsDiaryPath(mydate,dontopen)  //определяет путь до дневника и переходит на эту дату jsDiaryPath(new Date())
{
var quartil = new Array(1,1,1,2,2,2,3,3,3,4,4,4);
var weekname = new Array('воскресение','понедельник','вторник','среда','четверг','пятница','суббота');
var monthname = new Array('январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь');
var weather = new Array('зима','зима','весна','весна','весна','лето','лето','лето','осень','осень','осень','зима');

var today = new Date(mydate);

var year = today.getFullYear();
var weathername_text = weather[today.getMonth()];
var monthname_text = monthname[today.getMonth()];
var month = today.getMonth()+1; if(month<10) month = "0"+month;
var quartilname_text = quartil[today.getMonth()];
var weekname_text = weekname[today.getDay()];
var weeknum = today.getWeek();
var day = today.getDate(); if(day<10) day = "0"+day;

      //when t[3], t[4] and t[5] are missing they defaults to zero
if(false)      return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);          


var path = ["_ДНЕВНИК",year+" год", quartilname_text + " квартал" , monthname_text +" ("+weathername_text+")", weeknum + " неделя", day +"."+ (month) + "."+year+" - "+weekname_text+" ("+today.getDOY()+")"];

var id = jsCreate_or_open(path);

if(!dontopen) jsOpenPath( id );
return path;

}


//path = ["_ДНЕВНИК",year+" год", quartilname_text + " квартал" , monthname_text +" ("+weathername_text+")", weeknum + " неделя", day +"."+ (today.getMonth()+1) + "."+year+" - "+weekname_text+" ("+today.getDOY()+")"];

var my_week_num = "";
function jsCreate_or_open(path) //открывает если есть или создаёт jsCreate_or_open(["Мужики","Блондины","Петя-блондин"])
{
	sync_now = true;
	var id=1;
	var p_len = path.length;
	for(var i=0;i<p_len;i++)
		{
		id = jsCreateDo(id,path[i]);
		if(path[i].indexOf(" неделя")!=-1) var my_week_num = id;
		console.info("path=",id,path[i]);
		}
	sync_now = false;
	//jsRefreshTree();
	
	return id;	
}


var allmynotes,allmydates;

function jsGetAllMyNotes() //заполняю массив allmynotes,allmydates всеми непустыми заметками из дневника (для календариков)
{
allmynotes = my_all_data.filter(function(el,i)  //все заметки длиннее 3 символов (без тегов)
	{ 
    if(!el) return false;
	if(el.title) 
		if ((el.del!=1) && (el.title.indexOf(" - ")!=-1) && (el.title[el.title.length-1]==")"))
			if((strip_tags(el.text).length>3)) return true;
	});	
allmydates = my_all_data.filter(function(el,i) //все дела с датами (нужно для календариков)
	{ 
    if(!el) return false;
	if(el.date1) 
		if ((el.del!=1) && (el.date1!="")) return true;
	});	
return allmynotes;
}


function jsDiaryFindDateNote(date)  //поиск всех заметок на эту дату (нужно для календариков)
{
if(!my_all_data || !allmynotes) return false;

var today = date;
var year = today.getFullYear();
var month = today.getMonth()+1; if(month<10) month = "0"+month;
var day = today.getDate(); if(day<10) day = "0"+day;

var finddate = day +"."+ (month) + "."+year+" - ";

var answer = allmynotes.filter(function(el,i) 
	{ 
	if(el.parent_id) return (el.title.indexOf(finddate)!=-1); 
	});	


if(answer.length!=0) 
	{ 
	var text = answer[0].text;
	text = text.replace("</p>"," ");
	text = text.replace("</div>"," ");
	text = text.replace("<br>"," ");
	text = text.replace("</li>"," ");
	var mytext = strip_tags(text); 
//	mytext = mytext.replace("@@@","___\r");
	return [true,mytext]; 
	}
	 
else return [false,""];

}

function jsDiaryFindDateDate(date)  //поиск всех событий назначенных на эту дату (нужен для календариков)
{
if(!my_all_data || !allmydates) return false;

var today = date;
var year = today.getFullYear();
var month = today.getMonth()+1; if(month<10) month = "0"+month;
var day = today.getDate(); if(day<10) day = "0"+day;

var finddate = year +"-"+ (month) + "-"+ day +" ";

var answer = allmydates.filter(function(el,i) 
	{ 
	if(el.parent_id) return (el.date1.indexOf(finddate)!=-1); 
	});	


if(answer.length!=0) 
	{ 
	var mytext = "";
	var a_len = answer.length;
	for(i=0;i<a_len;i=i+1)
		{
		mytext = mytext + "— "+answer[i].title;
		if(i!=answer.length-1) mytext = mytext+"\r";
		}
	return [true,mytext]; 
	}
	 
else return [false,""];

}


function jsCreateDo(whereadd,title) // ищу элемент по названию у указанного родителя, если не нахожу, создаю новый. Нужно для календаря, чтобы не создавать дату, если она уже есть. Поиск только по первым 13 символам jsCreateDo(4296,"Новое поле"); Проверить, сохраняется ли информация в localStorage
{
	var parent = whereadd; //номер родителя
	var newposition;
	
	var answer = my_all_data.filter(function(el,i) { if(el.parent_id) return ((el.parent_id==whereadd) && (el.del!=1)); } );	
	if(answer.length) newposition = answer.length;
	else newposition = 0;
	
	var answer = answer.filter(function(el,i) { if(el.title) return ( (strip_tags(el.title).indexOf(title.substr(0,13))!=-1) && (el.del!=1) ); } );	
		
	
	if(answer!="") return answer[0].id; //если элемент с таким именем уже найден возвращаю id и прерываюсь
	
	var new_id = -parseInt(1000000+Math.random()*10000000,10);
		
	var new_line = my_all_data.length;
	my_all_data[new_line]=new Object(); 
	var element = my_all_data[new_line];
	element.date1 = "";
	element.date2 = "";
	element.icon = "";
	element.id = new_id;
	element.img_class = "note-clean";
	element.parent_id = parseInt(whereadd);
	element.position = newposition.toString();
	element.text = "";
	element.did = "";
	element.del = 0;
	element.tab = 0;
	element.fav = 0;
	element["new"] = "title,";
	element.time = jsNow();
	element.lsync = jsNow()-1;
	element.user_id = main_user_id;
	element.s = 0;
	element.remind = 0;
	element.title = "";
	jsFind(new_id,{title:title});
	return new_id;

}


function jsMakeTabs() //создаю закладки из всех дел написанных большими буквами
{
	   var data = my_all_data.filter(function(el) //поиск всех дел написанных БОЛЬШИМИ буквами и не начинающиеся с цифры
		    { 
		    if(!el) return false;
		      if(el.did==0) 
		      	if(el.del==0) 
		      	  if(el.user_id==main_user_id)
		      		if(el.title) 
		      		  if(el.title.indexOf("[@]")==-1)
		      			if(el.parent_id>0) 
		      				{
		      				var shablon = /[a-z]|[а-я]+/; 
							var matches = el.title.match(shablon);

		      				shablon = /(^\d{1,100})/; 
							var matches2 = el.title.match(shablon);
							
		      				if( !matches && !matches2 ) 
		      					return ( el.title==el.title.toUpperCase() ); 
		      				}
		    } );

		function compare(a,b) {
		  if (parseFloat(a.tab) < parseFloat(b.tab))
		     return -1;
		  if (parseFloat(a.tab) > parseFloat(b.tab))
		    return 1;
		  return 0;
		}

		data = data.sort(compare); //сортирую табы по полю tab
		
	var alltabs="<ul>";
	var d_len = data.length;
	for(i=0; i<d_len; i=i+1)
		{
		if(data[i].title.length>10) title = data[i].title;
		else title = "";
		alltabs = alltabs + "<li title='"+title+"' myid='"+data[i].id+"'>"+jsShortText(data[i].title,20)+"</li>";
		}
	alltabs= alltabs+ "</ul>";
		
	$('#fav_tabs').html("").append(alltabs);	

	jsCalcTabs();  //раcсчитываю ширину табов и перекидываю лишние в всплывающий список
}


function jsShowBasket() //показать список избранных, пока не используется. Отбор по полю .fav
{
	   var data = my_all_data.filter(function(el) //поиск удовлетворяющих поисковой строке условий
		    { 
		    if(!(!el.fav)) 
		      return ( el.fav==1 ); 
		    } );

	   var cnt_check = data.length;
	   $(".basket_panel ul:first").html("");
	   jsShowTreeNode(-2,false,data);
	   
	   $(".basket_count").html( cnt_check );
	   if(cnt_check==0) $(".basket").addClass("basket_empty");
	   else $(".basket").removeClass("basket_empty");
}

function node_to_id(id)
{
if(id) return id.replace("node_", "");
}

function id_to_node(id)
{
if(id) return "node_"+id;
}


function jsPlaceMakedone(id) //размещаю makedone там, где галочка tcheckbox
{
	var tcheckbox = $("#mypanel #node_"+id).find(".tcheckbox");
	var left = tcheckbox.offset().left-23;
	var mytop = tcheckbox.offset().top+25;
	var wrap_width = $("#wrap").width();
	var make_done_width = $(".makedone").width();
//	$(".makedone").attr("isnew","false");

  var box_left=left;  
  
  if(left>wrap_width-70) 
  	   { 
  	   left = left - make_done_width+15; 
  	   box_left = wrap_width-80;
  	   }
  else 
  	   {
  	   }
  	   
  if(left<0) { left = 10; box_left=30; }
  
  if( (left+make_done_width )>wrap_width-50 ) left = wrap_width-make_done_width-50;
  $(".makedone").css({ left: left, top: mytop  }).show().attr("myid",id);
  $(".makedone_arrow").css({ left: box_left+20, top: mytop-9  }).show();
  $(".makedone_arrow2").css({ left: box_left+20, top: mytop-10  }).show();
  return left;
}

function jsMakeUnDidInside(id) //снимаю выполнение у всех детей - рекурсивная функция
{
	var mychildrens = jsFindByParent(id,true);
	
	if( mychildrens.length > 0 )
		{
		$.each(mychildrens,function(i,dd)
		   {
		   jsMakeUnDidInside(dd.id);
		   jsFind(dd.id,{did:""});
		   });
		}
}

function jsMakeDidInside(id) //ставлю выполнение у всех детей - рекурсивная функция
{
	var mychildrens = jsFindByParent(id);
	
	if( mychildrens.length > 0 )
		{
		$.each(mychildrens,function(i,dd)
		   {
		   jsMakeDidInside(dd.id);
		   var mydatenow = new Date();
		   jsFind(dd.id,{ did:mydatenow.toMysqlFormat() });
		   });
		}
	
}

var did_timeout;

function jsMakeDid(id) //выполняю одно дело
{
	   var mydatenow = new Date();
	   jsFind(id,{ did:mydatenow.toMysqlFormat(), fav:0 });
	   
	   jsMakeDidInside(id); //выполняю рекурсивно всех детей
	   var li = $("#mypanel #node_"+id);
	   li.find(".n_title").addClass("do_did");
	   clearTimeout(did_timeout);
	   if(!show_hidden) 
	   		{
	   		sync_now = true;
	   		did_timeout = setTimeout(function()
	   			{
				$(".do_did").parents("li").slideUp(500,function(){ jsRefreshTree(); sync_now = false; });	   			
	   			},15000);
	   		}
	   else jsRefreshTree();
	   $('#calendar').fullCalendar( 'refetchEvents' );
	   jsPlaceMakedone(id);
//	   jsShowBasket();
	   if(!show_hidden) 
	   		{
	   		jsTitle("Выполненные дела будут скрыты через 15 секунд",15000);
	   		}
}

function jsHighlightText()
{
		var searchstring = $('#textfilter').val();
		if(!(searchstring.length>3)) 
			{ 
			$(".highlight").contents().unwrap();
			return true; 
			}
		$(".highlight").contents().unwrap();
		$(".search_panel_result").highlight(searchstring,"highlight"); 
		$(".comment_text").highlight(searchstring,"highlight"); 
//		$(".redactor_").highlight(searchstring,"highlight"); 
		$("#mypanel .n_title").highlight(searchstring,"highlight"); 
}

function jsMakeUnDid(id) //снимаю выполнение
{
	   clearTimeout(did_timeout);
	   sync_now = false;
	   jsFind(id,{ did:"", fav:0 });
	   jsTitle("Отмена выполнения",5000);

	   jsMakeUnDidInside(id); //рекурсивно снимаю выполнение
	   setTimeout(function(){ jsRefreshTree(); 	$('#calendar').fullCalendar( 'refetchEvents' ); },200);
	   
//	   li = $("#mypanel li[myid='"+id+"']");
//	   if(!show_hidden) li.hide().slideDown(1000);
//	   jsShowBasket();
}


function jsFindLastSync()  //нахожу время последней синхронизации, ориентируюсь на поле .time и .lsync
{
var maxt = 0; var mint = parseInt(99999999999999999); 

if(my_all_data)
{
var m_len = my_all_data.length;
for(i=0;i<m_len;i++) 
	{ 
	if(!my_all_data[i]) continue;
	var lsync = my_all_data[i].lsync; 
	var changetime = my_all_data[i].time; 
	if(lsync>maxt) maxt=lsync; 
	if(changetime>lsync) 
		if( mint>changetime ) mint=parseInt(changetime,10); 
	}
}
if(my_all_comments)
{
var mc_len = my_all_comments.length;
for(i=0;i<mc_len;i++) 
	{ 
	var lsync = my_all_comments[i].lsync; 
	var changetime = my_all_comments[i].time; 
	if(lsync>maxt) maxt=lsync; 
	if(changetime>lsync) 
		if( mint>changetime ) mint=parseInt(changetime,10); 
	}
}

if(mint<maxt) return mint;
else return maxt;
}

function sqldate(UNIX_timestamp){ //показываю время в виде mysql. timeConverter( jsFindLastSync ) используются для отладки
 var a = new Date(UNIX_timestamp);
 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = a.getMonth()+1;
     if(month<10) month = "0"+month;
     var date = a.getDate();
     if(date<10) date = "0"+date;
     var hour = a.getHours();
     if(hour<10) hour = "0"+hour;
     var min = a.getMinutes();
     if(min<10) min = "0"+min;
     var sec = a.getSeconds();
     if(sec<10) sec = "0"+sec;
     var msec = a.getMilliseconds();
     if(msec<10) msec = "0"+msec;
     var time = year+"-"+month+'-'+date+' '+hour+':'+min+':'+sec;
     return time;
 }


function jsTitleClick(ntitle,from_n_title) //клик по Названию дела. ntitle = $(".ntitle"). Нужно для определения двойного клика.
{
	if (ntitle.attr("contenteditable")==true) return true;
	
	var nowtime = new Date();
	if(((nowtime-lastclick)<1000) && (lastclickelement == ntitle.html())) needtoedit = true;
	else 
		{
		needtoedit = false;
		if(!from_n_title) ntitle.parents("li:first").click(); //противный клик
		var id = ntitle.attr("myid");
		$(".panel li").removeClass("selected");
		jsSelectNode( id ,'tree');
		jsOpenNode( id ); //открываю панель
		}
	
	lastclickelement = ntitle.html();
	
	lastclick = new Date(); //запоминаю время последнего клика, чтобы переходить в режим редактирования только при двойном клике

	if( needtoedit )
		{
	  	ntitle.attr("contenteditable","true").attr("spellcheck","false").focus(); 
	  	ntitle.attr("old_title",ntitle.html());
	  	document.execCommand('selectAll',false,null);
	  	}
	else 
		{
	    document.execCommand('unselect');
		return true;
		}

}


function jsStartShare(id,need_to_off) //функция для кнопки поделиться. Делает запрос на сервер и заполняет форму в makedone.
{
	
 	is_rendering_now = true;
   	setTimeout(function(){ is_rendering_now = false; },300);
   	console.info("off",is_rendering_now);
   	

if (navigator.onLine == false) //если интернета нет
	{
	if($("#on_off_share").prop("checked")==true)
		{ 
		$("#on_off_share").prop("checked",false); $("#on_off_share").iphoneStyle("refresh");
		}
	jsTitle("Интернет отсутствует, кнопка поделиться не работает", 10000);
	return false;
	}

if(need_to_off==0 || need_to_off==1)
	{ //выключаю ссылку
	var lnk = "do.php?onLink="+id+"&is_on="+need_to_off+"&shortlink="+$("#makeshare").val().split("/")[1];
	
	$.getJSON(lnk,function(data){
			$("#makesharestat_count").hide();
			$("#makesharestat").html("").hide();
			if($("#on_off_share").prop("checked")==true)
				{ 
				$("#on_off_share").prop("checked",false); $("#on_off_share").iphoneStyle("refresh");
				$(".makesharediv").hide();
				}
		});
	return true;
	}

var lnk = "do.php?getLink="+id;
$.getJSON(lnk,function(data){
	console.info(data);
	$("#makesharestat_count span").text("0");
	$("#makeshare").val("4tree.ru/"+data.shortlink);
	if(data.is_on=="0")
		{
		$("#makesharestat_count").hide();
		$("#makesharestat").html("").hide();
		if($("#on_off_share").prop("checked")==true)
			{ 
			$("#on_off_share").prop("checked",false); $("#on_off_share").iphoneStyle("refresh");
			$(".makesharediv").hide();
			}
		
		}
	else
		{
		if($("#on_off_share").prop("checked")==false)
			{ 
			$("#on_off_share").prop("checked",true); $("#on_off_share").iphoneStyle("refresh");
			$(".makesharediv").show();
			}
		}

		$("makesharestat_count").html(data.stat_count);
		if(data.stat_count==0 || data.stat_count=="") 
				{
				$("#makesharestat_count").hide();
				$("#makesharestat").html("").hide();
				}
		else
				{
				$("#makesharestat_count span").html(data.stat_count);
				$("#makesharestat_count").show();
				$("#makesharestat").html(data.statistic);
				}

		
	});


}


function jsOpenRedactorRecursive(id)  //открываю в редакторе все подзаметки c зелёными подзаголовками
{
		    recursivedata=[];
		    recursivedata.push( jsFind(id) );
		    jsRecursive( id );
			var amount = parseInt(recursivedata.length,10);
	   		var need_open = [];
	   		
	   		
	   		$.each(recursivedata,function(i,el)
	   			{ 
	   			need_open.push(el.id);
	   			});
		    recursivedata=[]; //очищаю память
	   		jsRedactorOpen(need_open,"all_notes");
	   		jsTitle("Загрузил все заметки ("+amount+" шт.) в один редактор, можете редактировать");
		$(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(300);
		$.Menu.closeAll();
}

function jsSendMail(mytitle, mailto)
{
var mynote = myr.getCode();
mynote = 'changes='+encodeURIComponent(mynote);

var mailto_uri = encodeURIComponent(mailto);
var mytitle_uri = encodeURIComponent(mytitle);

var lnk = "do.php?send_mail_to="+mailto_uri+"&mytitle="+mytitle_uri;
$.postJSON(lnk,mynote,function(data,j,k){
	alert('Письмо "'+mytitle+'" для '+"\r"+mailto+"\rуспешно отправлено.");
	});


}


function jsCloneChat(user_id) //клонирую чат из template
{
		var new_chat = $(".chat_box[user_id='template']").clone().attr("user_id",user_id);
		user_el = jsFrendById(user_id);
		new_chat.find(".chat_user_name").html( user_el.fio );
		new_chat.find(".chat_user_img").html('<img src="image.php?width=33&height=33&cropratio=1:1&image=/'+user_el.foto+'">');
		$("body").append(new_chat);
		
		var cnt=0;
		$(".chat_box[user_id!=template]").quickEach(function(el){
			console.info( $(this).css("top") );
			if( $(this).css("top")=="auto" )
				{
				cnt = cnt+1;
				}
			});
		var new_right = 30+(new_chat.width()+10)*(cnt-1);
		if( (new_right+new_chat.width()+50)>$("body").width() ) 
			{
			var new_right = 50+(new_chat.width()+10)*(cnt-1-$("body").width()/(new_chat.width()+50) );
			new_chat.css("bottom",new_chat.height()+80);
			}
		new_chat.css("right", parseInt(new_right) ).show().draggable({appendTo: "body", handle: ".chat_header"});
		
		var chat_editor = new_chat.find(".chat_editor_input");
		  myr_comment = chat_editor.redactor({ imageUpload: './redactor/demo/scripts/image_upload.php?user='+main_user_id, lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php?user='+main_user_id, autoresize:true,  
  			buttons: ['bold' , 'italic' , 'deleted' , '|', 'orderedlist', '|' ,'image', 'video', 'file', 'link']
     });
	    myhtml="";
     	var chat_html = jsShowChatHistory( "chat_"+main_user_id+"_"+user_id );
     	new_chat.find(".chat_content").html(chat_html).scrollTop(99999999999);
     	


}

function jsParseWikiLinks(parent_id)
{
	var wiki = $(".wiki");
	if(wiki.length)
		{
		var wiki_founded;
		wiki.each(function(i,el){
			mytitle = strip_tags( $(el).html() );
			wiki_founded = jsFindWikiForParent(parent_id, mytitle);
			if(wiki_founded)
				{
				var mini_text = wiki_founded.text.replace(/<div>/g," ");
				mini_text = mini_text.replace(/<p>/g," ");
				mini_text = mini_text.replace(/&nbsp;/g," ");
				mini_text = jsShortText( strip_tags(mini_text),500);
				
				$(el).addClass("wiki_founded").attr("title", mini_text );
				}
			else
				{
				$(el).removeClass("wiki_founded");
				}
			});
		}
	
}

function jsFindWikiForParent(parent_id, mytitle)
{
	mytitle = mytitle.replace("&nbsp;", " ").trim();
	mytitle = strip_tags(mytitle.trim());

	var childrens = jsFindByParent(parent_id);
	var myfilter="[["+mytitle+"]]";
	var mynewdata = childrens.filter(function(el) //ищу в первую очередь среди детей
			{
			if(el.did!="") return false;
			if(el.del==1) return false;
			if(el.title) return el.title.toLowerCase().indexOf(myfilter.toLowerCase())!=-1;
			});
				
	if(!mynewdata.length)  //теперь ищу по всему дереву, где я создатель заметки
		{
		var mynewdata = my_all_data.filter(function(el) 
			{
			if(el.did!="") return false;
			if(el.del==1) return false;
			if(el.title) if(el.user_id==main_user_id) return el.title.toLowerCase().indexOf(myfilter.toLowerCase())!=-1;
			});
		}

	if(!mynewdata.length)  //теперь ищу по всему дереву, где не только я создатель заметки
		{
		var mynewdata = my_all_data.filter(function(el) 
			{
			if(el.did!="") return false;
			if(el.del==1) return false;
			if(el.title) return el.title.toLowerCase().indexOf(myfilter.toLowerCase())!=-1;
			});
		}
		
	if(mynewdata.length) 
		{
		return mynewdata[0];
		}		
}

function jsOpenWikiPage(parent_id,mytitle)
{
	var mynewdata = jsFindWikiForParent(parent_id, mytitle);
	
	if(!mynewdata) 
		{
		jsAddDo("right",parent_id,"[["+mytitle+"]]");
		}
	else
		{
		jsOpenPath(mynewdata.id);
		jsFixScroll(2);
		}
	$("#wiki_back_button").show().attr("myid",parent_id);
	myr.setFocus();
}


var scrolltimer;
var last_blur_sync_time = 0;
var mytimer6;
var QueryString;


function jsRegAllKey() //все общие delegate и регистрация кнопок. Нужно указать точнее родительские элементы.
{
//  		localStorage.setItem("mylastmail","eugene.leonar@gmail.com");
$("#test-div").draggable({appendTo: "body"});
$(".chat_box").draggable({appendTo: "body", handle: ".chat_header"});

jsRerememberPomidor();

$("body").delegate("#wiki_back_button","click",function()
	{ 
	var myid = $(this).attr("myid");
	$(this).hide();
	jsOpenPath(myid);
	return false;
	});
		

$(".redactor_").delegate(".wiki","click",function()
	{ 
	var mytitle = strip_tags( $(this).html() ); 
    var id = node_to_id( $(".selected").attr('id') );
    jsOpenWikiPage(id,mytitle);
	return false;
	});

if(typeof(test)!="undefined") window.after_ajax = function(){ window.after_ajax = null; jsTestIt2(); };

	$("body").delegate(".chat_box","click",function(e){
		$(".chat_box").css("z-index",50);
		$(this).css("z-index",51);
	  	});

	$("body").delegate(".chat_close","click",function(e){
		var chat_box = $(this).parents(".chat_box:first");
		chat_box.remove();		
		return false;
		});

	$("body").delegate(".chat_fullscreen","click",function(e){
		var chat_box = $(this).parents(".chat_box:first");
		if(!chat_box.hasClass("fullscreen")) chat_box.addClass("fullscreen");		
		else chat_box.removeClass("fullscreen");		
		return false;
		});


	$("body").delegate(".chat_header","click",function(e){
		var chat_box = $(this).parent(".chat_box");
		if(chat_box.height()<30) 
			{
			chat_box.height( $(".chat_box[user_id=template]").height() );
			chat_box.find(".chat_inner").show();
			}
		else 
			{
			chat_box.height( $(".chat_box[user_id=template]").find(".chat_header").height() );
			chat_box.find(".chat_inner").hide();
			}
		return false;
		});


	$("#right_panel").delegate("li","click",function(e){
		var user_id = $(this).attr("user_id");
		if($(".chat_box[user_id='"+user_id+"']").length) 
			{
			//развернуть чат
			return false;
			}
		jsCloneChat(user_id);
		return false;
		});

	$("body").delegate(".fav_icon","click",function(){
		var fav = $(this).find("i").attr("class");
		var id = $(".makedone").attr("myid");
	    var title = jsFind(id).title;
	    title = strip_tags(title).trim();
	    title = "<i class='"+fav+"'></i> "+title;
		if(id) if(fav) { jsFind(id, {title:title}); jsRefreshOneElement(id); }
		console.info("icon=",fav,id);
		return false;
		});

	$("body").delegate(".fav_color","click",function(){
		var fav = $(this).attr("fav");
		var id = $(".makedone").attr("myid");
		if(id) { jsFind(id, {fav:fav}); jsRefreshOneElement(id); }
		console.info(fav,id);
		return false;
		});

	$("#tree_news").delegate(".comment_box","click",function(){
		var comment_id = $(this).attr("id");
		if(comment_id) comment_id = comment_id.replace("comment_","");
		jsOpenPath( jsFindComment(comment_id).tree_id );
		return false;
		});

	$("#tree_comments").delegate(".comment_reply","click",function(){
		$(this).parents(".comment_box:first").append( $("#comment_enter") );
		onResize();
		$(".comment_enter_input").focus();
		return false;
		});
		
	$("#tree_comments").delegate(".comment_del","click",function(){
	    if (!confirm('Удалить комментарий?')) return false;
		$(".comment_edit_now").removeClass("comment_edit_now");
		$("#comment_enter_place").append( $("#comment_enter") );
		var comment_id = $(this).parents(".comment_box:first").attr("id");
		if(comment_id) comment_id = comment_id.replace("comment_","");
	    if(!comment_id) return false;
		jsDelComment( comment_id );
		jsShowAllComments(id);
		onResize();
		return false;
		});

	$("#tree_comments").delegate(".comment_edit","click",function(){
		$(this).parents(".comment_box:first").append( $("#comment_enter") );
		$(".comment_edit_now").removeClass("comment_edit_now");
		$(this).parents(".comment_box:first").addClass("comment_edit_now");
		var comment_id = $(this).parents(".comment_box:first").attr("id");
		if(comment_id) comment_id = comment_id.replace("comment_","");
	    if(!comment_id) return false;
	    var this_comment = jsFindComment(comment_id);
	    $(".comment_enter_input").setCode(this_comment.text);
		onResize();
		return false;
		});
		
	$('body').delegate(".chat_send_button","click",function(){ //добавляю сообщение в чат
		var to_user_id = $(this).parents(".chat_box:first").attr("user_id");
		var text = $(this).parents(".chat_box:first").find(".redactor_editor").getCode();
		jsAddComment("chat_"+main_user_id+"_"+to_user_id,-1,text);

		myhtml="";
     	var chat_html = jsShowChatHistory( "chat_"+main_user_id+"_"+to_user_id );
     	$(this).parents(".chat_box:first").find(".chat_content").html(chat_html);
     	$(this).parents(".chat_box:first").find(".chat_content").scrollTop(1234567890);

		return false;
		});

	$('#comment_enter').delegate(".comment_send_button","click",function(){
	    var id = node_to_id( $(".selected").attr('id') );
	    if( (!id) ) return false;
	    txt = $(".comment_enter_input").getCode();
	    if(txt=="")	
	    	{
	    	if($(".comment_enter_input").html()=="") return false;
	    	else txt = $(".comment_enter_input").getCode();
	    	}
	    
	    
	   	if($(".comment_edit_now").length) 
	   		{
		   		var comment_id = $(".comment_edit_now").attr("id");
		   		if(comment_id) comment_id = comment_id.replace("comment_","");
		   		console.info(comment_id,{text:txt});
		   		jsFindComment(comment_id,{text:txt});
	   		}
	   	else
	   		{
		   		var comment_id = $(this).parents(".comment_box:first").attr("id");
		   		if(comment_id) comment_id = comment_id.replace("comment_","");
		   		else comment_id = 0;
		   		jsAddComment( id , comment_id, txt );
		   	}
		$("#comment_enter_place").append( $("#comment_enter") );
		$(".comment_enter_input").setCode("");
		if(comment_id!=0) var old_scroll = $("#tree_comments_container").scrollTop();
		jsShowAllComments(id);
		if(comment_id==0) $("#tree_comments_container").scrollTop(999999999);
		else $("#tree_comments_container").scrollTop(old_scroll);
		$(".comment_enter_input").focus();
		return false;
		});

	$('.comment_box').delegate(".comment_like","click",function(){
	    var id = $(this).attr("id").replace("");
	    if(!id) return false;
		jsAddComment( id , 0, $(".comment_enter_input").html() );
		$(".comment_enter_input").html("");
		jsShowAllComments(id);
		return false;
		});



	$("body").delegate(".comment_enter_input","keydown",function(event){
//		console.info(event.keyCode, event);
		if( (event.keyCode == 13) && ( event.altKey || event.ctrlKey || event.metaKey ) )
			{
			event.preventDefault();
			$(".comment_send_button").click();
	   	 	}
		return true;
		});

//	setTimeout(function(){ $("#tab_news").click(); }, 1000);

	$('#fav_calendar').delegate("li","click",function(){
		$('#fav_calendar .active').removeClass("active");
		$(this).addClass("active");
		
		var tab_name = $(this).attr("id");
		
		if( tab_name == "tab_calendar" )
			{
			$("#calendar").show();
			onResize();
			}
		else
			{
			$("#calendar").hide();
			}

		if( tab_name == "tab_find" )
			{
			$(".search_panel_result").show();
			}
		else
			{
			$(".search_panel_result").hide();
			}

		if( tab_name == "tab_news" )
			{
			$("#tree_news").show();
			jsShowNews(0);
			}
		else
			{
			$("#tree_news").hide();
			}
		
		
		
		return false;
		});
	

	setTimeout(function(){ jsSync();  }, 1000);

	$('#left_panel').delegate("h1","click",function(){
		$(this).next("ul").slideToggle(200,function(){
			if($(this).is(":visible")) 
					$(this).prev("h1").find(".icon-right-dir").attr("class","icon-down-dir");
			else
					$(this).prev("h1").find(".icon-down-dir").attr("class","icon-right-dir");
			
			});
		return false;
		});		

	$('body').delegate("#left_panel_opener","click",function(){
		if($("#left_panel").css("width") != "0px")
			{
			$("#left_panel").animate({"width":"0"},200,function(){ $(this).hide(); });
			$("#main_window").animate({"left":"0"},200);
			$("#left_panel_opener").animate({"left":"0"},200);
			$("#search_panel").animate({"left":"16"},200, function(){ 
						$("#left_panel_opener .icon-left-open").attr("class","icon-right-open");
						onResize();
						});
			console.info("closed_left_panel");
			}
		else
			{
			$("#left_panel").css({"width":"0"}).show().animate({"width":"150"},300);
			$("#left_panel_opener").animate({"left":"150"},300);
			$("#main_window").animate({"left":"150"},300);
			$("#search_panel").animate({"left":"166"},300, 
				function(){ 
						$("#left_panel_opener .icon-right-open").attr("class","icon-left-open");
						onResize();
						});
			console.info("opened_left_panel");
			}
		return false;
		});

	$('body').delegate("#right_panel_opener","click",function(){
		var right_width = 50;
		if($("#right_panel").css("width") != "0px")
			{
			$("#right_panel").animate({"width":"0"},200,function(){ $(this).hide(); });
			$("#main_window").animate({"right":"0"},200);
			$("#right_panel_opener").animate({"right":"0"},200);
			localStorage.setItem("s_right_open",0);
/*			$("#search_panel").animate({"left":"16"},200, function(){ 
						$("#left_panel_opener .icon-left-open").attr("class","icon-right-open");
						onResize();
						});*/
			console.info("closed_left_panel");
			}
		else
			{
			$("#right_panel").css({"width":"0"}).show().animate({"width":right_width},300);
			$("#right_panel_opener").animate({"right":right_width},300);
			$("#main_window").animate({"right":right_width},300);
			localStorage.setItem("s_right_open",1);
/*			$("#search_panel").animate({"left":"166"},300, 
				function(){ 
						$("#left_panel_opener .icon-right-open").attr("class","icon-left-open");
						onResize();
						});*/
			console.info("opened_left_panel");
			}
		return false;
		});

	if(localStorage.getItem("s_right_open")==1) $("#right_panel_opener").click();

	$('body').delegate(".show_mindmap","click",function(){
		id = $(".makedone").attr("myid");
		href = "http://4tree.ru/mm.php?mindmap="+id;
		open_in_new_tab(href);
		return false;
		});

	$('body').delegate("#send_mail","click",function(){
  		mytitle = $("#title_enter").val();
  		mailto = $("#email_enter").val();
  		jsSendMail(mytitle, mailto);
		$(".all_screen_click").click();
		return false;
		});


	$('body').delegate("#email_enter","keyup",function(){
  		localStorage.setItem("mylastmail", $(this).val());
  		return false;
		});

	$('body').delegate(".send_by_mail","click",function(){
	  	$(".all_screen_click").remove();
  		$("#wrap").append("<div class='all_screen_click'></div>");

  		mytitle = $(".selected .n_title").html();
  		$("#title_enter").val(mytitle);

  		lastmail = localStorage.getItem("mylastmail");
  		$("#email_enter").val(lastmail);

  		$(".send_mail_form").slideDown(500);
		return false;
		});


	$('body').delegate("#add_combobox","click",function(){
		$(".combo_list").slideUp(300);
		return false;
		});

	$('.combo_list').delegate("li","click",function(){
		id = $(this).attr("myid");
		element = jsFind(id);
		if(element)
			{
			$(".combo_list").slideUp(300);
			title = jsShortText(element.title,15);
			
			$("#add_combobox_input").val( element.title );
			
 			 elel = $(".combo_last_list b[myid='"+id+"']");
 			 if(elel.length>0)
 			 	{
				$(".combo_last_list b:first").before(elel);
 			 	}
 			 else
 			 	{
				$(".combo_last_list b:first").before("<b myid='"+element.id+"'>"+title+"</b>");
 			 	}
			
			;
			}
		return false;
		});


	$('body').delegate("#add_combobox_input","keyup",function(){
		myfilter = $(this).val();
		
		clearTimeout(mytimer6);
		
	if(myfilter.length>3)
		mytimer6 = setTimeout(function(){
		var data = my_all_data.filter(function(el)
			{
			if(el.did!="") return false;
			if(el.del==1) return false;
			if(el.title) return el.title.toLowerCase().indexOf(myfilter.toLowerCase())!=-1;
			});
	   $(".combo_list ul").html("");
	   jsShowTreeNode(-2,true,data);
	   $(".combo_list").slideDown(300);
	   },200);

		
		return false;
		});

	//открываю всю неделю в редакторе
	$('body').delegate(".ui-datepicker-week-col","click", function () {
		year = $(this).parents(".ui-datepicker-group").find(".ui-datepicker-year").html();
		week = $(this).html();
		
		var dd = my_all_data.filter(function(el){ return el.title==year+" год"; });
		if(!dd) return false;
		
		recursivedata=[];
		jsRecursive(dd[0].id);
		
		var dd = recursivedata.filter(function(el){ return el.title==week+" неделя"; });
		if(!recursivedata) return false;

		recursivedata=[];

		if(!dd) return false;
		
		if(dd[0]) { id=dd[0].id; 
			jsOpenRedactorRecursive(id);
			}
				
		return false;
		});

	$('body').delegate(".divider_red","click", function () {
		id = $(this).attr("myid");
		jsOpenPath(id,"divider_click");
		return false;
		});

	$('body').delegate(".show_all_in_redactor","click", function () {
		id = $(".makedone").attr("myid");
		jsOpenRedactorRecursive(id);
		return false;
		});
		
	$(".redactor_box,#tree_comments_container").delegate("a","click",function()
		{ 
		href = ( $(this).attr("href") );
		console.info("href=",href);
		if(href.indexOf("javascript:")!=-1) return true;

		if(href.indexOf("4tree.ru/#")!=-1) 
			{
			a = href.substr(href.indexOf("#")+1,100);
			window.location.hash = a;
			}
		else
			open_in_new_tab(href);
		return false;
		});		
	
	
	$('body').delegate(".show_all_history_redactor","click", function () {
		id = $(".makedone").attr("myid");
		add = $.md5(id).substr(0,10);
		open_in_new_tab("web.php?note_history="+add+id);
		return false;
		});

	$('body').delegate("#recur_panel input,#recur_panel select, .recur_col","change", function () {
		if( $(this).hasClass("recur_col") ) 
			$(":radio[name=recur_end_radio][value=2]").prop("checked",true);

		if( $(this).hasClass("recur_date1") ) 
			$(":radio[name=recur_end_radio][value=3]").prop("checked",true);

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


	$('body').delegate(".recur_close,#recur_panel #s_close","click", function (d1,d2) {
		console.info(d1,d2);
		$("#all_screen").fadeOut('slow');
		return false;
		});

	$('body').delegate("#s_recur_check,#s_recur_change","click", function () {
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


//	setInterval(function() { jsRefreshDo(); },5000 );
    $.idleTimer(5*1000);

	$(document).bind("active.idleTimer", function(){
	});

	$(document).bind("idle.idleTimer", function(){
		if(start_sync_when_idle) { jsSync(only_save); only_save=false; }
	});
	
platform = window.navigator.platform; //что за устройство?
	
if(platform == "iPad")	
	{
		function checkResume()
		{
		    var current=new Date().getTime();
		    if(current-timestamp>5000)
		    {
		        var event=document.createEvent("Events");
		        event.initEvent("focus",true,true);
		        document.dispatchEvent(event);
		    }
		    timestamp=current;
		}
		window.setInterval(checkResume,500);	
		
		document.addEventListener("focus",function()
			{
		  	jsLocalSync();
		  	if(start_sync_when_idle) jsSync();
		  	
			},false);
	}
else
  {
	  $(window).focus(function(){
	  	jsLocalSync();

		if(there_was_message_about_change) { jsSync(); there_was_message_about_change = false; }
	
		if( (jsNow() - last_blur_sync_time) > 10000 ) //запускать синхронизацию не чаще 10 секунд
			{
			jsStartSync("soon","FOCUS");  	
			last_blur_sync_time = jsNow();
			}
	
	  	}).blur(function(){
	
		if( (jsNow() - last_blur_sync_time) > 10000 ) //запускать синхронизацию не чаще 10 секунд
			{
			jsStartSync("long","BLUR");  	
			last_blur_sync_time = jsNow();
			}
	
	  	});
    }

  $(".bottom_right>.redactor_box").scroll(function()
  		{
  		clearTimeout(scrolltimer);
  		
  		if(($(".divider_red").length==1) || $('.redactor_editor').attr("myid"))
    	  scrolltimer = setTimeout(function()
  			{
			id = $(".divider_red").attr('myid'); //если заметок несколько
			if(!id)
			id = $('.redactor_editor').attr("myid"); //если заметка одна
			
  			if(id)
  				{
	  			scroll = $(".bottom_right>.redactor_box").scrollTop();
	  			delta = scroll-jsFind(id).s;
	  			if( Math.abs(delta) > 100  ) jsFind(id, { s:scroll });
  				}
  			},500);
  		})



		
		
	$('#makesharestat_count').delegate("b","click", function ()
		{
		$('#makesharestat').slideToggle(200);
		return false;
		});
		
	 $('body').delegate(".red_new_window","click", function ()
	   {
	   id = node_to_id( $(".selected").attr('id') );
	   if(id<0)
	   	{
		 alert("Синхронизируюсь, попробуйте через 2 секунды…");
		 jsSync();
		 return false;
	   	}
	   open_in_new_tab(document.location.origin+document.location.pathname+"#edit/"+id);
	   return false;
	   });
		
		
	 $('body').delegate(".todayweek","click", function ()
	   {
	   lnk = "#edit_current_week";
	   open_in_new_tab(lnk);
	   return false;
	   });
		
	 $('body').delegate(".todaydate","click", function ()
	   {
	    if(old_before_diary==0)
	    	{
		    old_before_diary = 0;
		    //$(".selected").attr("myid");
			jsDiaryPath( jsNow()+diaryrewind*24*60*60*1000 );
			}
		else
			{
			jsOpenPath(old_before_diary);
			old_before_diary=0;
			}
		return false;
	   });
	   
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
	 $('#mypanel').delegate(".tcheckbox","mousedown", function (e)
	   {
	   	e.preventDefault();
	   	is_rendering_now = true;
//	   	setTimeout(function(){ is_rendering_now = false; },100);
	   	
	   id = node_to_id( $(this).parents("li").attr("id") );
	   	   
	   if(!$("#mypanel #node_"+id).hasClass("selected")) $("#mypanel #node_"+id).click();
	   		   
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
		
		
	   element = jsFind(id);

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
		
		console.info("click "+jsNow());
		return false;
	   });
		

	 $('body').delegate("#pomidoro_icon i","click", function ()
	   {
	    myid=parseInt($(this).attr('id').replace('pomidor',''),10); //номер кликнутой помидорки
	    
	    $("#pomidoro_icon i").removeClass("pomidor_now");
	    $(this).addClass("pomidor_now"); //отмечаю текущую помидорку зелёным
	    
	    var now = new Date().getTime();
	    endtime = now; //текущее время
	    my_min = $(this).attr('time'); //через сколько минут остановить таймер
	    
	    var new_x = parseInt(my_min*513/80,10);
	    $("#pomidor_scale").stop().animate({"margin-left":new_x-5},700);
	    $("#pomidor_scale").animate({"margin-left":new_x},100);
     	setTimeout(function(){ $("#pomidoro_icon").show(); },1200); //отображаю панель с помидорками
     	console.info("показываю иконки!");
		goPomidor();
		return false;
	   });
	 $('body').delegate("#left_min,#right_min,#pomidor_timer","click", function ()
	   {
	    $("#pomidoro_icon i").removeClass("pomidor_now");
	    
	    if ($(this).attr('time') == 0) {
			 localStorage.setItem("pomidor_endtime","0");
			 localStorage.setItem("pomidor_my_min","0");
			 localStorage.setItem("pomidor_id","0");
			 jsSetTitleBack();
		     $("#pomidor_scale").animate({"margin-left":0},500); 
	    	 clearInterval(mypomidor); return; 
	         }

	    var now = new Date().getTime();
	    endtime = now;
	    my_min = $(this).attr('time');
	    
	    
	    new_x = parseInt(my_min*513/80,10);
	    $("#pomidor_scale").stop().animate({"margin-left":new_x-5},700);
	    $("#pomidor_scale").animate({"margin-left":new_x},100);
		clearInterval(mypomidor); 		
		goPomidor();

	   return false;
	   });



  $('#pomidor_scale').mousedown( function(e)
     { 
			  jsSetTitleBack();
			  $("#pomidor").css("opacity","1");
     		  clearInterval(mypomidor); 
     		  startX = e.pageX;
     		  startPomidor = parseFloat($("#pomidor_scale").css("margin-left"));
			  e.preventDefault();

		$(window).mousemove(function(e){
			  myX = e.pageX-startX+startPomidor;
			  my_min = parseInt(parseFloat(myX)*80/513,10);
			  if (-my_min>85) my_min = -85;
			  if (-my_min<0) my_min = 0;
			  new_x = parseInt(my_min*513/80,10);
			  $("#pomidor_scale").stop().animate({"margin-left":new_x},20);
			  
		    });

  $(window).mouseup( function()
     { 
		$(window).unbind("mousemove");
		$(window).unbind("mouseup");
        startPomidor = parseFloat($("#pomidor_scale").css("margin-left"));
	    var now = new Date().getTime();
	    endtime = now;
		
//		clearInterval(mypomidor); 		
		goPomidor();
     });

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
			jsOpenPath(id);
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
		jsOpenPath( $(this).attr("myid") );
		setTimeout(function(){ jsHighlightText() },1000);
		return false;
		});

    //клик в табы под редактором
	$('#fav_red,#fav_red_mini').delegate("li","click", function () {
		
		id = $(this).attr("myid");
		if(id==-1) id = jsOpenDiary(); //если нужно открыть дневник
		
		jsOpenPath( id, 'fav_red' );
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
	$('#mypanel').delegate("li","click", function () {

		var nowtime = jsNow();
		var dif_between_click = nowtime - lastclick;
		lastclick = jsNow();
		
//		if($(this).find("#minicalendar").length) return true;
		$(".highlight").contents().unwrap();

//		console.info("liclick");
		var isTree = $("#top_panel").hasClass("panel_type1");

		if(isTree)
		  if( (dif_between_click)<150 ) 
			{
			console.info("nowtime-lastclick",dif_between_click);
			var id = node_to_id( $(this).attr("id") );
			$(".panel li").removeClass("selected");
			jsOpenNode( id ); //открываю панель
			jsSelectNode( id ,'tree');
			return false;
			}

		
		if( $(this).hasClass('tree-closed') ) 
			{
			id = node_to_id( $(this).attr("id") );
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
				id = node_to_id( $(this).attr("id") );
				jsOpenNode( id ); //открываю панель
				jsSelectNode( id ,'tree');
				$(this).removeClass("tree-closed").addClass("tree-open");
				}
			}

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
  $("#mypanel").delegate(".n_title","click", function () {
  	if( ($(".selected .n_title[contenteditable=true]").length > 0) ) { console.info(1); return true; }
  	jsTitleClick($(this),"from_panel");
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

	var last_message_sync_time = 0;

    function _manageEvent(eventMessage) {
      var chat = $("#chat");
      if (eventMessage != '') {
//        var values = $.parseJSON(eventMessage);
//        console.info("mymessage-type",eventMessage);
        if( eventMessage.type == "need_refresh_now" ) { jsSync(); setTimeout(function(){ alert("Пришло новое письмо!");},800); }
        if( eventMessage.type == "need_refresh_id" ) //сообщение о изменившихся данных от do.php
        	{ 
        	there_was_message_about_change = true;
        	var mysync_id = jsGetSyncId();
        	if(mysync_id!=eventMessage.sync_id) //не нужно обновлять, если сообщение пришло благодаря этому клиенту
        		{
	        		if( jsNow() - last_message_sync_time > 10000 )
	        			{
	        			 setTimeout(function()
	        			 	{ 
		        			last_message_sync_time = jsNow();
	        			 	if($("#mypanel .n_title[contenteditable=true]").length == 0) jsSync(); 
	        			 	},300); 
	        			 jsTitle("Ваши данные изменились на другом комьютере. Обновляю.",5000); 
	        			}
	        		console.info(eventMessage.sync_id,eventMessage.txt);
        		}
        	}
      }
    };

    function _statuschanged(state) {
      if (state == PushStream.OPEN) {
        $(".offline").hide();
        $(".online").show();
        $("#mode").html(pushstream.wrapper.type);
//        console.info("Связь с сервером",5000);
      } else {
        $(".offline").show();
        $(".online").hide();
        $("#mode").html("");
//        console.info("Связь с сервером прервана",5000);
      }
    };

    function _connect(channel) {
      if(!channel) return true;
      pushstream.removeAllChannels();
      try {
        pushstream.addChannel(channel);
        pushstream.connect();
      } catch(e) {alert(e)};

      $("#chat").val('');
    }

    PushStream.LOG_LEVEL = 'debug';
    var pushstream = new PushStream({
      host: "4do.me", //window.location.hostname
      port: window.location.port,
      modes: "websocket|longpolling|eventsource|stream" //websocket|eventsource|stream
    });

    pushstream.onmessage = _manageEvent;
    pushstream.onstatuschange = _statuschanged;


//////////////////////////////////DO FIRST///////////////////////////////////////
function jsDoFirst() //функция, которая выполняется при запуске
{
$(".makedone").hide();
api4tree = new API_4TREE("4tree_db", "need_log");

api4panel = new API_4PANEL($("#mypanel"), "need_log");

api4tree.js_LoadAllFromLocalDB().done(function(){ 
	api4tree.log("Таблица загружена!"); 
	jsDoAfterLoad();
	}); //загружаю таблицу из памяти
}

function jsDoAfterLoad()
{
//jsTestDate();
tree_db = new DB_INTERFACE("tree"); //стартую интерфейс работы с локальной базой браузера

db = new ydn.db.Storage('4tree_db');    
main_user_id = $.cookie("4tree_user_id");
_connect(main_user_id);


last_local_sync = jsNow()+5000;

		if( window.location.hash.indexOf("edit") !=-1 ) //если открыли заметку в новом окне
			{
		  	fullscreen_mode = true;
			}
		else
			{
		  	fullscreen_mode = false;
			}


	jsSetDiaryDate(0); //устанавливаю сегодняшнюю дату в дневнике в заголовке

	if($.cookie('sh')=="false") show_hidden=false;
	else show_hidden=true;

	if($.cookie('sd')=="false") show_childdate=false;
	else show_childdate=true;
	
	if(!show_hidden) 
		{ 
		setTimeout(function(){
			$(".show_hidden_do").html("Показать выполненные дела"); 
			},200);
		}

	if(!show_childdate) 
		{ 
		setTimeout(function(){
			$(".show_childdate_do").html("Показывать дату следующего действия у папки"); 
			},200);
		}
	

	
	preloader = $('#myloader').krutilka("show");

  myr = $('#redactor').redactor({ imageUpload: './redactor/demo/scripts/image_upload.php?user='+main_user_id, lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php?user='+main_user_id, autoresize:true, 
  			buttonsAdd: ['|', 'button1','checkbox'], 
            buttonsCustom: {
                button1: {
                    title: 'Спойлер (скрытый текст)', 
                    callback: function(obj, event, key) 
                      { 
//                      console.info(obj,event,key);
					  myr.execCommand('insertHtml',"<p><div class='spoiler_header'><b>&nbsp;Скрытый текст<br></b></div><div class='spoiler' style='display: block; '><div>Скрытый<br>текст</div></div></p>&nbsp;");
                      }
                        
                },
                checkbox: {
                    title: 'Галочка', 
                    callback: function(obj, event, key) 
                      { 
//                      console.info(obj,event,key);
					  myr.execCommand('insertHtml',"<input type='checkbox'>&nbsp;");
                      }  
                }
                
            }
     });
   $(".redactor_toolbar").insertBefore(".redactor_box");
   $(".comment_in").append( $("#tree_comments") );

  myr_comment = $('.comment_enter_input').redactor({ imageUpload: './redactor/demo/scripts/image_upload.php?user='+main_user_id, lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php?user='+main_user_id, autoresize:true,  
  			buttons: ['bold' , 'italic' , 'deleted' , '|', 'orderedlist', '|' ,'image', 'video', 'file', 'link']
     });

	
	  num=13; //кол-во дней в календаре

			
	$(window).bind('hashchange', jsSethash );

	
	
	var options = {minWidth: 420, arrowSrc: 'b_menu/demo/arrow_right.gif'};
	$('#main_menu').menu(options);

	var options = {minWidth: 320, arrowSrc: 'b_menu/demo/arrow_right.gif'};
	$('#makedone_menu').menu(options);

	var options = {minWidth: 320, arrowSrc: 'b_menu/demo/arrow_right.gif'};
	add_menu = $('#add_menu').menu(options);
		
	jsZoomTree(-2000); //размер шрифта в дереве
	
//	setTimeout(function(){ $("li[myid=599]").click(); },5000);
	
	$.ajaxSetup({cache:false}); // запрещаю пользоваться кэшем в ajax запросах

	main_x = parseFloat( $.cookie('main_x') ); //ширина левой панели в процентах
	main_y = parseFloat( $.cookie('main_y') );//высота верхней панели в пикселях
	
	if(!main_x) main_x = parseFloat(50);
	if(!main_y) main_y = parseFloat(250);
	
//	console.info(main_x,main_y);

  jsRegAllKey(); //регистрирую все клавиши выполняется 1,7 секунд (нужно проверить, почему долго)

  

  current_tab = 1;

  jsShowTreePanel(); //показываю панель с деревом
  	
	
  jsMakeLeftRightPanelResizable(); //включаю работу джойстика
	
		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		currentTime=new Date;
		firstHour=currentTime.getHours() - 2;

  jsShowCalendar(); //показываю календарь с текущим временем - 2 часа
		
  jsMakeTabs(1); //запускаю вкладки избранны TABS

  onResize();	//отлаживаю все размеры	
}
////////////////////////////////////////////////////////////
var my_array;
	
jQuery.extend({ //добавляю функцию postJSON (ради названия)
   postJSON: function( url, data, callback) {
      return jQuery.post(url, data, callback, "json");
   }
});



function jsSpeechComplete() //после голосового ввода быстрого добавления заметки
{
$("#add_do").keyup();
}

	
function jsNow(dont_need_dif) //определение текущего времени
{
time_dif = localStorage.getItem("time_dif");
if(!time_dif) time_dif = 0;
if(!dont_need_dif)
	now_time = ( parseInt( (new Date()).getTime() ) + parseInt(time_dif)  );
else
	now_time = ( parseInt( (new Date()).getTime() ) );


return now_time; 
}	

var sync_idle_timer1;
var idle_timer_on1 = false;
var sync_idle_timer2;
var idle_timer_on2 = false;

//jsStartSync("now") - ленивый запуск синхронизации
function jsStartSync(how_urgent,iamfrom) //how_urgent = now - если синхронизировать срочно, soon - в ближайшее время
{
 return true; 
 soon = 1*15*1000; //15 секунд если что-то изменилось
 long = 1*60*1000; //5 минут, если ничего не менялось, вдруг на сервере изменения

 last_sync_microseconds = jsNow() - localStorage.getItem('sync_time_server');

 if( ( (jsNow()-last_editor_click_time) < (soon) ) || ($("#mypanel .n_title[contenteditable=true]").length > 0) ) //если только что пользователь нажимал клавишу в редакторе, то не мешать ему 15 сек
 	{
 	console.info("wait 15 sec");
 	how_urgent = "soon";
 	last_sync_microseconds = 0;
 	idle_timer_on1=false;
	clearTimeout(sync_idle_timer2); //обнуляю таймер long
 	}
 
 if( (how_urgent!='long') && (last_sync_microseconds>=soon) ) how_urgent = 'now';
 if( (how_urgent=='long') && (last_sync_microseconds>=long) ) how_urgent = 'now';
 	
 if(how_urgent=='now') 
 	{
 	idle_timer_on1=false;
 	idle_timer_on2=false;
	clearTimeout(sync_idle_timer1);
	clearTimeout(sync_idle_timer2); //обнуляю таймер long
 	jsRefreshDo(); //запускаю синхронизацию (главная функция синхронизации)
  	console.info("##Синхронизировался До этого я это делал "+ last_sync_microseconds +" мc. назад ("+sqldate( parseInt( localStorage.getItem('sync_time_server') ) )+")",iamfrom,how_urgent);
//	localStorage.setItem("sync_time_server",jsNow()); //эта функция должна быть не тут, а внутри jsRefreshDo
 	}
 
 if(how_urgent=='soon') //если синхронизация нужна не очень срочно
 	if(idle_timer_on1==false) 
 		{
 		idle_timer_on1=true;
 		clearTimeout(sync_idle_timer1);
 		clearTimeout(sync_idle_timer2); //обнуляю таймер long
 		idle_timer_on2=false; 
 		sync_idle_timer1 = setTimeout( function() { idle_timer_on1=false; jsStartSync(); }, soon );
 		return true;
 		}

 if(how_urgent=='long') //если синхронизация нужна совсем не срочно
 	if(idle_timer_on2==false) 
 		{
 		idle_timer_on2=true;
 		clearTimeout(sync_idle_timer2);
 		sync_idle_timer2 = setTimeout( function() { idle_timer_on2=false; jsStartSync("long"); }, long );
 		return true;
 		}


}

function jsUnNew() //убираем список изменённых полей после синхронизации. Лучше убирать их по мере синхронизации! Перенести в jsRefreshDo!
{
	var data = my_all_data.filter(function(el,i) { if(el["new"]) return el["new"]!=""; } );
	$.each(data, function(i,node){
		node["new"]="";
		});
	
}

function jsDry(data) //убираем все данные, кроме изменённых, чтобы экономить трафик в POST
{
	var answer1 = new Array();
	
	$.each(data, function(i,node){
		var changed_fields = node['new'];
		var element = new Object;
		element.id = node.id;
		if((node.id<0) || (node["new"]=="") )  
			{
			element = jsFind(node.id);
			answer1.push(element);
			changed_fields = "";
			}
		else
		$.each(node, function(keyname, keyvalue)
			{
			if(changed_fields)
			  if(( changed_fields.indexOf(keyname+',') != -1 ) || keyname=="time" || keyname=="lsync1" )
				{
				element[keyname] = keyvalue;
				}
			});
		if(changed_fields) answer1.push(element);
		});
	
	return answer1;
}

function jsDryComments(data) //убираем все данные, кроме изменённых, чтобы экономить трафик в POST
{
	answer1 = new Array();
	
	$.each(data, function(i,node){
		changed_fields = node['new'];
		element = new Object;
		element.id = node.id;
		if((node.id<0) || (node["new"]=="") )  
			{
			element = jsFindComment(node.id);
			answer1.push(element);
			changed_fields = "";
			}
		else
		$.each(node, function(keyname, keyvalue)
			{
			if(changed_fields)
			  if(( changed_fields.indexOf(keyname+',') != -1 ) || keyname=="time" || keyname=="lsync1" )
				{
				element[keyname] = keyvalue;
				}
			});
		if(changed_fields) answer1.push(element);
		});
	
	return answer1;
}


function jsGetSyncId()
{
///////////////////////////////////////////////////////////////////////////////
//Устанавливаю индентификационный код (емайл + текущее время + инфо о браузере)
var sync_id = localStorage.getItem("sync_id"); 
if(!sync_id) 
	{
	var time_id = $.cookie("4tree_email_md") + '-' + jsNow() + '-' + navigator.userAgent;
	sync_id = $.md5(time_id).substr(0,5)+"@"+sqldate( jsNow() )+"";
	localStorage.setItem("sync_id",sync_id);
	sync_id = localStorage.getItem("sync_id");
	}
return sync_id;
}


var NeedToRefresh = false;
var sync_now=false;
var sync_now_timer,myrefreshtimer;
////////////////////////////////////////////////////////////////////////////////////	
//синхронизация - отправка изменений на сервер//////////////////////////////////////
function jsRefreshDo()
{
//jsSync();
return true;

clearTimeout(sync_idle_timer1);
clearTimeout(sync_idle_timer2); //обнуляю таймер long

mytime = localStorage.getItem("sync_time_server");

if( ( (jsNow() - mytime) < 3000  ) || ($("#mypanel .n_title[contenteditable=true]").length > 0) )
	{ 
//	jsStartSync("long","NEED TO REFRESH"); 
	return false; 
	}

//if(fullscreen_mode) return true;
if(sync_now) return false; //если синхронизация уже идёт
sync_now = true; //нужно перенести этот параметр в LocalStorage, чтобы другие окна тоже не синхронизировались одновременно
clearTimeout(sync_now_timer);
sync_now_timer = setTimeout(function(){ sync_now = false; },90000);

preloader.trigger('show');

if(!$.cookie("4tree_email_md")) return false; //если пользователь не зарегистрирован отмена синхронизации
//$.ajaxSetup({async: false});

sync_id = jsGetSyncId();

////////////////////////////////////////////////////////////////////////////////
//Что изменилось после последней синхронизации//////////////////////////////////
lastsync_time_client = jsFindLastSync();

var data = my_all_data.filter(function(el) { if(el) return ( (el.parent_id<-1000) || (el.id<-1000) || (el.time>el.lsync) || ((el["new"]!="") && (el["new"])) ); } );

console.info("@@@@@@@@_need_to_sync = ",data);

//data = jsDry(data);

if(data.length>1) jsTitle(data.length+" эл. синхронизирован(ны) с сервером",15000);
if(data.length==1) jsTitle("<i class='icon-install'>",5000);

changes = JSON.stringify( jsDry(data) ); //высушиваю данные и превращаю в JSON строку

myconfirms = JSON.parse(localStorage.getItem("need_to_confirm"));

confirm_ids = JSON.stringify( myconfirms ); //высушиваю данные и превращаю в JSON строку

console.info("localchanges",changes);
console.info("localconfirm",confirm_ids);


changes = 'changes='+encodeURIComponent(changes)+'&confirm='+encodeURIComponent(confirm_ids);

preloader.trigger('show');
$(".icon-cd").css("color","#517c5d");


		lnk = "do.php?sync="+sync_id+"&time="+lastsync_time_client+"&now_time="+jsNow();
		$.postJSON(lnk,changes,function(data,j,k){
		     var countit=0;
		     NeedToRefresh = false;
		     savetext(); //сохраняю всё, что успел набрать пользователь пока синхронизируемся
		     $.each(data.changes,function(i,d)
		     	{
		//		console.info("from_server=",d);
		     	jsSaveElementData(d); //вот тут рапорт о успешной синхронизации и сохранение элемента
		     	countit=1;
		     	});
		     
			 console.info("confirm_next_time=",data.need_to_confirm);
			 localStorage.setItem("need_to_confirm",JSON.stringify(data.need_to_confirm)); //запоминаю, что потом нужно будет подтвердить синхронизацию этих id
			 		     
		     if(data.need_del)
		       $.each(data.need_del,function(ii,dd)
		     	{
		     	console.info("need_del",dd);
		     	if(dd.command == 'del') jsDelId(dd.id);
		     	if(dd.command == 'sync_all') 
		     		{ 
		     	  	localStorage.clear();
		     		document.location.href="./index.php";
		     		}
		     	countit=1;
		     	});
		     			
		//	console.info("before_refresh",jsFind(4764));
		     if(countit==1) 
		     	{
		     	clearTimeout(myrefreshtimer);
		     	myrefreshtimer = setTimeout(function() { jsRefreshTree(); },300); //обновляю отображение, если с сервера пришли новые данные
		     	}
		     
		     	
		//	jsUnNew(); //убираем список изменённых полей после синхронизации (уже убрали в savedata)
		     
		     localStorage.setItem("sync_time_server",jsNow()); // пока не меняю время
		//	localStorage.setItem("sync_time_client",jsNow());
		     preloader.trigger('hide');
		     $(".icon-cd").css("color","#888");
			 clearTimeout(sync_now_timer);
			 sync_now = false;
		     
		     }).error(function()
		     	{ 
				clearTimeout(sync_now_timer);
				sync_now = false;
		     	jsTitle("сеть отсутствует",50000); 
		     	preloader.trigger('hide');
		     	$(".icon-cd").css("color","#888");
		     	});	

/*
lnk = "do.php?get_all_data2=1";
$.getJSON(lnk,function(data){
	my_all_data = $.map(data, function (value, key) { return value; });
	});	
*/
$.ajaxSetup({async: true});

/*
lnk = "mymail.php";
$.post(lnk,changes,function(data,j,k)
	{
	});
*/
	
preloader.trigger('hide');
	
}





var last_local_sync, last_inside_sync;

function jsLocalSync() //локальная синхронизация, нужна так как возможно открытие программы в нескольких окнах
{
return true;
if(jsNow() - last_inside_sync < 1000 )  //если синхронизация была только-что, спасаемся от зацикливания
	{ 
	console.info("#Локальная синхронизация была только-что, отменяю");
	last_local_sync = jsNow()+1500;
	return true; 
	}
last_inside_sync = jsNow();
var d_len = localStorage.getItem("d_length");
for(ij=0;ij<d_len;ij++)
	{
	element = JSON.parse( localStorage.getItem("d_"+ij) );
	if(element)
	  if(element.time>(last_local_sync+1)) 
		{
//		console.info("Сначала синхронизирую");
//		jsRefreshDo();

		my_all_data[ij] = element;
		console.info("Изменилось в другом окне: ",my_all_data[ij],ij);

			console.info("need_refresh",element.id);

			if( $(".divider_red[myid='"+element.id+"']").length == 0 )
			    {
				if( node_to_id( $("#mypanel .selected").attr("id") )==element.id ) 
					setTimeout(function(){ $("#mypanel .selected").click(); },1000);
				}
			else
				{
				$(".divider_red[myid='"+element.id+"']").next(".edit_text").html(element.text);
				}
		}
	}

last_local_sync = jsNow()+3000;

//setInterval(function() { jsLocalSync(); },5000 );
}


var timer_refresh;

function jsSaveElementData(d) //сохраняю элемент в LocalStorage
{

	if(!d) return false;
	if( (!jsFind(d.id)) && (d.id>0) && (d.old_id==0) )  //если такого id нет, то создаю (создан в другом месте)
		{
			new_line = my_all_data.length;
			my_all_data[new_line]=new Object(); element = my_all_data[new_line];
			element.date1 = "";
			element.date2 = "";
			element.icon = "";
			element.id = d.id;
			element.img_class = "note-clean";
			element.parent_id = parseInt(d.parent_id);
			element.position = d.position.toString();
			element.text = "";
			element.did = "";
			element.time = parseInt(d.changetime);
			element.lsync = parseInt(jsNow()); //зачем это? чтобы пересинхронизироваться?
			element.user_id = main_user_id; //уверен? а вдруг это дело добавил другой юзер?
			element.remind = 0;
			element["new"] = "";
			element.s = 0;
			element.tab = 0;
			element.fav = 1;
			element.title = "Новая заметка";
			jsSaveData(d.id);
			console.info("new-element",element);
		}

	if(d.old_id<0) //если это бывший новый элемент
		{ 
//		clearTimeout(timer_refresh);
//		timer_refresh = setTimeout(function() { jsRefreshTree(); },100);
		
		jsTitle("С сервера пришли новые дела",d,10000);
		
		NeedToRefresh = true;

		$("#panel_"+d.old_id).attr("id","panel_"+d.id); //заменяю индексы видимых панелей
   		$('.redactor_editor').attr("myid", d.id);
		if( $('.divider_red[myid="'+d.old_id+'"]').length == 1) $('.divider_red[myid="'+d.old_id+'"]').attr('myid',d.id);
		$(".makedone[myid="+d.old_id+"]").attr("myid",d.id); //заменяю индексы makedone
		$("#node_"+d.old_id).attr("id", id_to_node(d.id) );

		all_children = jsFindByParent(d.old_id);
		$.each(all_children,function(i,ddd)
		 	{ 
		 	ddd.parent_id=d.id; 
		 	});		//заменяю всех отрицательных родителей на положительных

		old_id_element = jsFind(d.old_id);
		if(!old_id_element) { console.info("отрицательный элемент "+d.old_id+" уже отсутствует"); return false; } //danger 
		if(all_children.length==0) d.parent_id = old_id_element.parent_id;
		console.info(d.old_id,{id:d.id}, d.changetime);
		jsFind(d.old_id,{id:d.id}); //меняю отрицательный id на новый
		jsFind(d.id, { time : parseInt(d.changetime) }); //чтобы сохранить
		
//		return true;
		}
		
	myelement = jsFind(d.id);
//	console.info("new2-element",element,d.id);

		
	myelement.title = d.title;
	myelement.parent_id = parseInt(d.parent_id);
	myelement.did = d.did;
	myelement.fav = d.fav;
	myelement.date1 = d.date1;
	myelement.date2 = d.date2;
	myelement.tab = d.tab;
	myelement["new"] = ""; //обнуляю new, чтобы скрыть иконку синхронизации
	myelement.position = d.position.toString();
	myelement.icon = d.node_icon;
	myelement.lsync = parseInt(d.lsync);
	myelement.user_id = d.user_id;
	myelement.remind = d.remind;

	console.info(parseInt(myelement.time) , parseInt(d.changetime), "=time");
    if( (parseInt(myelement.time) <= parseInt(d.changetime)) || (d.changetime==0) )
    	{
		myelement.text = d.text;
		console.info("textchange");
		}
	else 
		{
		myelement["new"] = "text,";
		myelement.lsync = 0;
		console.info("USER CHANGED TEXT");
//		myelement.lsync = jsNow()-200000;
		}

	if(d.changetime) myelement.time = d.changetime; //нужно, так как jsFind уже испортил это время
	myelement.s = d.s;
	


	divider = $(".divider_red[myid='"+d.id+"']");

		
		
	if(d.old_id<0) 
		{ 
		if($(".redactor_editor").attr("myid")==d.id)
			{
			txt = myr.getCode();
			if ( ($("#mypanel .n_title[contenteditable=true]").length > 0) || ($("#mypanel #minicalendar").length > 0) ) 
				console.info("cant open redactor");
			else
				{
				jsRedactorOpen([d.id],"new_element_edit");
				setTimeout(function(){ myr.setCode(txt); note_saved = false; savetext(); },200);
				}
			}
		}
	else
		{
		
			if(divider.length==0)	//если открыта одна заметка
				{
					var id_node = $('.redactor_editor').attr("myid");
					var md5text = $('.redactor_editor').attr("md5");
					
					if( (id_node==d.id) && ( $.md5(d.text) != md5text )) //если с сервера прислали новый текст, то обновляю редактор. Нужно дописать, если открыто несколько заметок. bug. никогда не запускается.
					  {
					  old_scroll = $(".bottom_right>.redactor_box").scrollTop();
					  clearTimeout(scrolltimer);
					  jsRedactorOpen([d.id],"FROM SYNC EDITOR");		
					  $(".bottom_right>.redactor_box").scrollTop(old_scroll);
					  }
				}
			else
				{				//если открыто несколько заметок
					  old_scroll = $(".bottom_right>.redactor_box").scrollTop();
					  clearTimeout(scrolltimer);
					  if(myelement) divider.next(".edit_text").html(myelement.text);
					  $(".bottom_right>.redactor_box").scrollTop(old_scroll);
				}
		
		
		}
//		console.info("saving=",d.id,d.old_id);
		jsSaveData(d.id,d.old_id,"dontsync"); //не надо, так как есть уже в jsFind
	
}


var del_timer;

function jsDelCom(id) //удаление из базы определённого id и удаление его же в LocalStorage
{
		sync_now = true;
		$.each(my_all_comments, function(i,el){
    		if(el) if(el.id == id) { my_all_comments.splice(i,1); }
    		});

    	clearTimeout(del_timer);
    	del_timer = setTimeout(function(){ jsSaveData(); },5000);
    	
		sync_now = false;
}

var del_timer;

function jsDelId(id) //удаление из базы определённого id и удаление его же в LocalStorage
{
		sync_now = true;
		var answer = false;
		$.each(my_all_data, function(i,el){
    		if(el) if(el.id == id) { answer=true; my_all_data.splice(i,1); }
    		});

    	clearTimeout(del_timer);
    	del_timer = setTimeout(function(){ jsSaveData(); },1000);
    	
		sync_now = false;
		return answer;
}

function jsDeleteInside(id) //рекурсивное удаление дочерних элементов
{
	mychildrens = jsFindByParent(id);
	
	if( mychildrens.length > 0 )
		{
		$.each(mychildrens,function(i,dd)
		   {
		   jsDeleteInside(dd.id);
		   jsFind(dd.id,{ del:1 });
		   });
		}
}

function jsDeleteDo(current)
{
	preloader.trigger('show');
	
	id = node_to_id( current.attr('id') );
	next = current.nextAll("li:first");
	jsFind(id,{ del:1 });
	nowid = id;
	
	jsDeleteInside(nowid);

	current.slideUp(300,function()
		{ 
		current.parent(".panel").nextAll(".panel:first").remove();
		current.next(".divider_li").remove(); current.remove(); next.click(); 
		jsTitle("Элемент перемещён в корзину",5000);
		preloader.trigger('hide');
		jsRefreshTree();
		});

}

var myhtml="";


function jsRefreshComments(tree_id)
{
	var old_scroll = $("#tree_comments_container").scrollTop();
	jsShowAllComments(tree_id);
	$("#tree_comments_container").scrollTop(old_scroll);
}

function jsDelComment(comment_id)
{
	if(jsFindByParentComments(comment_id).length>0) 
		{
		jsFindComment(comment_id,{text:"<font color='lightgray'>комментарий удалён</font>"});
		}
	else
		{
		jsFindComment(comment_id,{del:1});
		}
}

function jsShowAllComments(tree_id) //показываю все комментарии
{
	$("#comment_enter_place").append( $("#comment_enter") );
	element = jsFind(tree_id);
	if(!element) return false;
	var comments_count = jsFindByTreeId(tree_id,-1).length;
	myhtml = '<h3><i class="icon-comment"></i> Комментарии ('+comments_count+')</h3>';
	jsShowComments(tree_id, 0);	
	if(comments_count==0) comments_count = "";
	$("#node_"+tree_id).find(".tcheckbox").html(comments_count);

	myhtml += "";
	$("#tree_comments_container").html(myhtml);
	onResize();
	if( $("#tree_news").is(":visible") ) jsShowNews(0);
	
}
function jsShowComments(tree_id, parent_id) //рекурсивно заполняет глобальную переменную myhtml сообщениями комментариев
{
	var source = $("#comment_template").html();
	template = Handlebars.compile(source);
	
	var chat = jsFindByTreeId(tree_id,parent_id);
	var html = "";
	$.each(chat, function(i,d)
		{
		var frend = jsFrendById(d.user_id);
		d.foto = frend.foto;
		d.name = frend.fio;
		d.tree_title = "";

		if(d.add_time=="0")  d.add_time_txt = "";
		else
			{
			var add_time = new Date( parseInt(d.add_time) );
			d.add_time_txt = add_time.jsDateTitleFull("need_short_format");
			}
		
		myhtml += template(d);
		
		if(jsFindByParentComments(d.id).length>0)
		  {
		  myhtml +="<ul>";
		  jsShowComments(tree_id, d.id);
		  myhtml +="</ul>";
		  }
		
		});
		
	
}

function jsShowChatHistory(tree_id) //возвращает комментарии являющиеся чатом (история) tree_id = "chat_11_12"
{
	var source = $("#chat_template").html();
	var parent_id = -1;
	template = Handlebars.compile(source);
	
	var chat = jsFindByTreeId(tree_id,parent_id);
	var html = "";
	$.each(chat, function(i,d)
		{
		var frend = jsFrendById(d.user_id);
		d.foto = frend.foto;
		d.name = frend.fio;
		d.tree_title = "";

		if(d.add_time=="0")  d.add_time_txt = "";
		else
			{
			var add_time = new Date( parseInt(d.add_time) );
			d.add_time_txt = add_time.jsDateTitleFull("need_short_format");
			}
		
		myhtml += template(d);
		
		if(jsFindByParentComments(d.id).length>0)
		  {
		  myhtml +="<ul>";
		  jsShowComments(tree_id, d.id);
		  myhtml +="</ul>";
		  }
		
		});
return myhtml;
}

function jsRefreshFrends()
{
	if(!my_all_frends) return false;
	var text = "";
	var m_len = my_all_frends.length;
	for(var i=0;i<m_len;i=i+1)
		{
		var el = my_all_frends[i];
		if(el.lastvisit!=0) { var lastvisit = "Последний визит:\n"+(new Date( parseInt(el.lastvisit) )).jsDateTitleFull(); }
		else lastvisit = "";
		
		var time_dif = parseInt( (jsNow()-el.lastvisit)/1000 );
		
		if( (time_dif)<20*60 ) var online_div = '<div class="contact_online contact_long" title="Online '+parseInt(time_dif/60)+' мин. назад"></div>';
		else var online_div = '';

		if( (time_dif)<3*60 ) var online_div = '<div class="contact_online" title="Online '+time_dif+' сек. назад"></div>';
		
		
		text += '<li user_id="'+el.user_id+'">'+
					online_div+
					'<img src="image.php?width=33&height=33&cropratio=1:1&image=/'+el.foto+'" title="'+el.fio
						+"\n"+el.email+"\n"+lastvisit+'">'+
					'<div class="contact_round">'+el.user_id+'</div>'+
				'</li>';
		}
	$(".right_contacts").html(text);


}


function jsFrendById(user_id)
{	
	if(!my_all_frends) return false;
	var answer = my_all_frends.filter(function(el,i) 
			{ 
			return el.user_id == user_id;
			});
	return answer[0];

}

function jsAddComment(tree_id,parent_id,text)
{
	var new_id = -parseInt(1000000+Math.random()*10000000);

	new_line = my_all_comments.length;
	my_all_comments[new_line]=new Object(); element = my_all_comments[new_line];

	element.id = new_id;
	element.parent_id = parseInt(parent_id);
	element.tree_id = tree_id;
	element.text = text;
	element.del = 0;
	element["new"] = "";
	element.time = jsNow();
	element.add_time = jsNow();
	element.lsync = jsNow()-1;
	element.user_id = main_user_id;
	
	jsSaveDataComment(new_id);

}

/* !Добавление нового дела */
function jsAddDo(arrow, myparent, mytitle, date1, date2)
{
 $.Menu.closeAll();

 localStorage.setItem('sync_time_server', jsNow()); 
 
 sender = $(".selected");
 if(!sender) return true;

 var isTree = $("#top_panel").hasClass("panel_type1");
 
 if(arrow == 'down')
 	{
	 	if(isTree) {
		 	panel = sender.parents("ul:first").attr("myid");
	 	} else {
		 	panel = sender.parents(".panel").attr('id').replace("panel_","");
		}
 	}
 if(arrow == 'right')
 	{
 	panel = node_to_id( sender.attr('id') );
 	
 		if(isTree) {
	  		if( $(".ul_childrens[myid="+panel+"]").length==0 )
  			$("#top_panel #node_"+panel).append("<ul class='ul_childrens' myid="+panel+"></ul>");
 			sender.find(".node_img").addClass('folder_closed').html("<div class='countdiv'>1</div>").removeClass("node_img");
 		} else {
 			sender.parents(".panel").nextAll(".panel").not("#panel_"+panel).remove();
 			sender.find(".node_img").addClass('folder_closed').html("<div class='countdiv'>1</div>").removeClass("node_img");
 			iii = $("#panel_"+panel+" li").length; 
 			if(iii==0) $("#mypanel").append("<div id='panel_"+panel+"' class='panel'><ul></ul></div>");
 		}
 	}

 if(arrow == "new")
 	{
	myparent = jsCreate_or_open(["_НОВОЕ"]);
 	panel = myparent;
 	}

	if( (panel==-3) || (panel.toString().indexOf("user_")!=-1) ) { alert("Не могу создать дело в этой папке"); return true; }

	$("#panel_"+panel).nextAll(".panel").remove();

 	if(mytitle) title = strip_tags( mytitle );
 	else
	 	title = "Новая заметка";
// console.info("add_to",panel);

	var new_id = -parseInt(1000000+Math.random()*10000000);
 
if(arrow != "new")	
	{
	 	if(isTree) {
		 	parent = sender.parents("ul:first").attr("myid");
	 	} else {
		 	parent = sender.parents(".panel").attr('id').replace("panel_","");
		}

	var count = sender.parents(".panel ul").children("li").length;
	newposition = parseInt($(".selected").next(".divider_li").attr("pos"));
	if(!newposition) newposition = count;
	}
else
	{
	count = 0;
	newposition = 0;
	}
	
	if(arrow=="right") { newposition = iii; sender.addClass("old_selected"); }
	
	new_line = my_all_data.length;
	my_all_data[new_line]=new Object(); element = my_all_data[new_line];
	if(!date1) element.date1 = "";
	else element.date1 = date1;

	if(!date2) element.date2 = "";
	else element.date2 = date2;
	
	element.icon = "";
	element.id = new_id;
	element.img_class = "note-clean";
	element.parent_id = parseInt(panel);
	element.position = newposition.toString();
	element.text = "";
	element.did = "";
	element.del = 0;
	element.tab = 0;
	element.fav = 0;
	element.time = jsNow();
	element.lsync = jsNow()-1;
	element.user_id = main_user_id;
	element.remind = 0;
	element.s = 0;
	element.title = title;
	
	if(arrow == "new") 
		{
		mynewdate = jsParseDate(title).date;
		if(mynewdate!="")
			{
			element.date1 = mynewdate.toMysqlFormat();
			if(title.toLowerCase().indexOf("смс")!=-1 || title.toLowerCase().indexOf("sms")!=-1 || title.toLowerCase().indexOf("напомни")!=-1 ) element.remind = 15;
			}
		}
	jsSaveData(new_id);
	jsRefreshTreeFast(new_id,arrow,date1);	
	if(isTree) jsAddToTree(new_id);
	$('#calendar').fullCalendar( 'refetchEvents' ); 	
		li = $("#mypanel #node_"+new_id);
		ntitle = li.find(".n_title");

		jsRedactorOpen([new_id],"adddo");		

		$("#mypanel li").removeClass("selected");
		li.addClass("selected");
		
		
 if(arrow != "new")
	  	ntitle.attr("contenteditable","true").attr("spellcheck","false").focus(); 
	  	ntitle.attr("old_title",ntitle.html());
 if(arrow != "new")
	  	document.execCommand('selectAll',false,null);
 else
 	{
 	jsOpenPath(new_id);
 	setTimeout(function() { myr.setFocus(); }, 500);
	jsStartSync("soon","NEW DO");
 	}

return new_id;
}


function jsGo(arrow)
{
		var isTree = $("#top_panel").hasClass("panel_type1");

if(arrow=='up')
	{
	lastclick = new Date();
	current = $("#mypanel .selected");
	if(current.length==0) current = $("#mypanel li:first").addClass("selected");
	prev = current.prev("div").prev("li:visible").find("ul").find("li:visible:last");
	
	if(prev.length==0)
	  {
	  prev = current.prev('div').prev('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first");
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:last").prev('div').prev('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:first").parents("li:visible:last").prev('div').prev('li');
	  }
	
	
	if(prev.length==1) 
		{
		current.removeClass("selected");
		prev.addClass("selected").click();
		}
	}

if(arrow=='down')
	{
	lastclick = new Date();
	current = $("#mypanel .selected");
	if(current.length==0) current = $("#mypanel li:first").addClass("selected");
	prev = current.find("li:visible:first");
	if(prev.length==0)
	  {
	  prev = current.next('div').next('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").next('div').next('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:first").next('div').next('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:first").parents("li:visible:first").next('div').next('li');
	  }
	
	if(prev.length==1) 
		{
//		current.removeClass("selected");
		prev.addClass("selected").click();
		}
	}

if(arrow=='right')
	{
	current = $("#mypanel .selected");
	
	if(isTree)
		{
		if(current.hasClass("tree-open"))
			{
			}
		else
			{
			current.click();
			}
		}
	else
		{
		current.parents(".panel").nextAll(".panel:first").find("li:first").click();
		}
	}
if(arrow=="left")
	{
	current = $("#mypanel .selected");
	
	if(isTree)
		{
		if(current.hasClass("tree-open"))
			{
			current.click();
			}
		else
			{
			}
		}
	else
		{
		current.parents(".panel").prevAll(".panel:first").find("li.old_selected").click();
		}
	}


jsFixScroll(2,"only_selected_panel");
}


function jsZoomTree(zoom_step) //масштабируем шрифты
{
	current_size = tree_font;
	
	tree_font = parseFloat(current_size) + parseFloat(zoom_step);

	if(tree_font<0.4) tree_font = 0.4;
	if(tree_font>3) tree_font = 3;
	
	if(zoom_step == -1000) tree_font=1; //Alt + 0 - дефолтное значение
	if(zoom_step == -2000) //вспоминаю размер из кукиса
		{
		tree_font = $.cookie('main_tree_font');			
		if(tree_font == null) tree_font=1;
		}

	$("#mypanel").css("font-size",tree_font+'em');
	
	$.cookie('main_tree_font',tree_font,{ expires: 300 });			

}

function jsSaveTitle( sender, needsave )
{
	console.info(sender.html(),"?");
	if(needsave==1 && strip_tags(sender.html()) != "")
	  {
	  document.execCommand('unselect');
	  if ( sender.html() != sender.attr("old_title") ) //если текст изменился
	  		{
	  		sender.attr("old_title",sender.html());
	  		id = node_to_id( sender.parents("li").attr('id') );
	  		
		var fav = $("<div>"+sender.html()+"</div>").find("i").attr("class");
	    var title=sender.html();
	    title = strip_tags(title).trim().replace("<br>","");
	    if(fav) title = "<i class='"+fav+"'></i> "+title;

	  		
	  		jsFind(id,{ title : title });
	  		jsRefreshOneElement(id);
			jsSetTitleBack();
			jsMakeTabs();	
//			if(id<0) jsStartSync("soon","IF NEW ELEMENT");

			preloader.trigger('hide');
	  		
			}
	  }
	else
	  {
	  sender.html( sender.attr("old_title") ); //возвращаю текст обратно
	  jsTitle("Изменения отменены",5000);
	  document.execCommand('unselect');

	  }

	sender.removeAttr("contenteditable").scrollTop(0);
}


function jsMakeAnimatePanel(status)
{
var p1,p2;
	if(status==1) howlong = 0;
	if(status==2) howlong = 500;
	
	who_is_on_top = $(".place_of_top").children("div").attr("id");
	
if(howlong==0)
	if( who_is_on_top=='top_panel' )
		{
		  $("#p2").css("background", "#fefcca");
		  $("#p1").css("background", "#dddeec");
		}
	else
		{
		  $("#p1").css("background", "#fefcca");
		  $("#p2").css("background", "#dddeec");
		}

	if( remember_old_panel == who_is_on_top )
	  {
	  p1 = $("#p1");
	  p2 = $("#p2");
	  }
	else
	  {
	  p1 = $("#p2");
	  p2 = $("#p1");
	  }

	p1div = $(".place_of_top").children('div');
	
	p1.animate({"left":p1div.offset().left,"top":p1div.offset().top,"width":p1div.width()-2,"height":p1div.height()-2},howlong);

	if( who_is_on_top=='top_panel' )
		p1div = $(".bottom_left").children('div').children('div').next('div');
	else
		p1div = $(".bottom_left").children('div').children('div').next('div').next('div');
	
	
	p2.animate({"left":p1div.offset().left,"top":p1div.offset().top,"width":p1div.width()-2,"height":p1div.height()-2},howlong);

	p1div = $(".redactor_editor");
	$("#p3").animate({"left":p1div.offset().left,"top":p1div.offset().top,"width":p1div.width()+26,"height":p1div.height()+26},howlong);

	$("#p1,#p2,#p3").show();
	$("#content1").addClass("transparent");
	
if(howlong>0)	
	setTimeout( function() 
		{
		$("#content1").removeClass("transparent");
		$("#p1,#p2,#p3").fadeOut(400);
		},howlong);
		
	remember_old_panel = who_is_on_top; //запоминаю какая панель была вверху
		
	
}


function jsMakeView(view_type)
{
	$(".place_of_top").show();
	$(".place_of_top #calendar").show();
	$(".bottom_left,.bottom_right").show();
	if($("#below_footer .redactor_box").length==1) $(".redactor_box").appendTo($(".bottom_right"));
	
	jsMakeAnimatePanel(1);
	$("html").removeClass("v4");	

	setTimeout( function() { jsMakeAnimatePanel(2); },400);

	if($("#content1 .bottom_right").length==1)
		{
		$("#content1").removeClass("v2");
		$(".bottom_right").appendTo($("#bottom_panel"));
		}


  if(view_type=='v1')
    {
    	if( $(".place_of_top #calendar").length == 1 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$("#calendar").swapWith($("#top_panel"));
			jsShowCalendar();
			}
		$("#content1").attr("class","").addClass("v1");
		onResize();
    }
  if(view_type=='v3')
    {

    	if( $(".place_of_top #calendar").length == 0 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$("#calendar").swapWith($("#top_panel"));
			jsShowCalendar();
			}
		$("#content1").attr("class","").addClass("v3");
		onResize();
    }

  if(view_type=='v2')
    {
    	if( $(".place_of_top #calendar").length == 1 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$("#calendar").swapWith($("#top_panel"));
			jsShowCalendar();
			}
		$(".bottom_right").appendTo($("#content1"));
		$("#content1").attr("class","").addClass("v2");

		onResize();
    }

  if(view_type=='v4') //похож на v3
    {
    	if( $(".place_of_top #calendar").length == 0 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$("#calendar").swapWith($("#top_panel"));
			jsShowCalendar();
			}
		$(".redactor_box").appendTo($("#below_footer"));
		$("html").addClass("v4");
		$("#content1").attr("class","").addClass("v4");
		onResize();
    }



}



function jsFixScroll(type,only_selected_panel)
{
//	console.info("fix_scroll",type);
	
	if(only_selected_panel) var add_id = ".old_selected,"
	else var add_id = "";
	$("#mypanel .panel").quickEach(function()
		{ 
		if(type==2) var add = ",.selected";
		else var add = "";
		
		var selected = $(this).find(add_id+add);
		if(selected.length) 
		  	{
			//scrollto = selected.offset().top + $(this).scrollTop() - $(this).height()/2+30;
			
			var li_top = selected.offset().top;
			var li_height = selected.height();
			var panel_height = $(this).height();
			var panel_scroll = $(this).scrollTop();
			var scrollto = panel_scroll;
			
			if(li_top < 50)
			  {
			  scrollto = panel_scroll+li_top- 50;
			  }
			  
			if(li_top > panel_height-20)
			  {
			  if(li_height>50) var addheight = li_height-30;
			  else var addheight=0;
			  scrollto = li_top - panel_height + panel_scroll + 20 + addheight;
			  }
			$(this).scrollTop(scrollto);
			}
		});
}

function jsSethash()
{
			if(ignorehashchange) return false;
		
			check_hash_add_do();
			
	  		id = parseInt(window.location.hash.replace("#",""),36);
	  		
	  		if(("#"+id!=window.location.hash) && (id))
	  			{
				$(window).unbind('hashchange');
		  		jsOpenPath( id );
				$(window).bind('hashchange', jsSethash );
//	  			console.info(id,'from_hash');
	  			}
}

function jsSetTitleBack()
{
		mytitle = $("#mypanel .selected").find(".n_title").html();

if(mytitle)
		{
		document.title = "4tree.ru: "+jsShortText( strip_tags(mytitle) ,150 );
		}
else document.title = "4tree.ru";
}

function jsOpenNode(id,nohash,iamfrom) //открыть заметку с номером
{
	$("#wiki_back_button").hide();

	clearTimeout(show_help_timer);
	if(!nohash)
		{
		var num_id;
		if(!parseInt(id,10)) num_id=id;
		else num_id = parseInt(id,10);
		
		show_help_timer = setTimeout(function()
			{ 
			ignorehashchange = true; //делаю так, чтобы изменение хэша не привело к переходу на заметку
			setTimeout( function() { ignorehashchange=false; }, 100 );
			if(window.location.hash.indexOf("edit")==-1) if(num_id) window.location.hash = num_id.toString(36); 
			},5000);
		}
		
		var isTree = $("#top_panel").hasClass("panel_type1");
		
		myli = $("#top_panel #node_"+id);
		
		var mypanel = myli.parents(".panel");
		
		mypanel.nextAll(".panel").remove();
		    	
		$(".selected").addClass("old_selected").removeClass("selected");
		myli.parents(".panel").find(".old_selected").removeClass("old_selected")
		myli.addClass("selected");
		
		if(!isTree) 
			{
			$(".panel li").removeClass("tree-open").addClass("tree-closed");
			$(".selected,.old_selected").removeClass("tree-closed").addClass("tree-open");
			}

		
		title = $(".selected:last").find(".n_title").html();
		if (!title)	title = $(".old_selected:last").find(".n_title").html();
		
		var path = myli.attr('path');
		
		$(".header_text").html( title );
			
		mytitle = myli.find(".n_title").html();

if(mytitle && !nohash)
		{
		d = new Date;
		k = d.toTimeString().split(':');
		mytime = k[0] + ':' + k[1];

		document.title = "4tree.ru: "+jsShortText( strip_tags(mytitle), 150 );
		shorttitle = jsShortText( mytitle , 30 );

		element = {id: id, title: shorttitle, path: path, time: mytime};
		clearTimeout(history_time);
		history_time = setTimeout(function(){
			tree_history.push(element); //добавляю открытие этого элемента в историю
			},500);
		}


		if( myli.find('.countdiv').length==1 ) //если это папка
    		{
    		jsShowTreeNode( id, isTree );
    		}
    	else
    		{
    		if( ($("#content1").hasClass("v1")) || ($("#content1").hasClass("v4")) ) 
    			{ 
    			$("#mypanel").append("<div class='panel' style='border-right: 1px solid transparent;'></div>"); 
    			pwidth = $.cookie('pwidth');
		  		if(!pwidth) pwidth = 300;
		  		$("#mypanel .panel:last").width(pwidth);
		  		jsPresize();

    			}
    		}
}


function jsOpenChildrens(id)
{
ul = $(".ul_childrens[myid="+id+"]");
if(ul.length)
  {
  ul.show();
  }
else
  {
  jsShowTreeNode(id,true); $(".ul_childrens[myid="+id+"]").show();
  }
}

function jsShortText(text, lng)
{
if(!text) return "";
if( text.length>(lng+3) )
	{
	f_l = parseInt(lng*0.7,10);
	f_r = lng-f_l;
	
	first = text.substr(0,f_l);
	last = text.substr(text.length-f_r,text.length);
	return first+'…'+last;
	}
else
	return text;

}

function jsOpenPath( id, iamfrom )
{
		var path1 = jsFindPath( id );
		console.info("path1",path1);
		if(path1.length<1) return false;
				     var p_len = path1.length;
				     for(var ik=0; ik<p_len; ik=ik+1)
				     	{
				     	toopen = path1[ik];
				     	if(ik==path1.length-1) jsOpenNode(toopen);
				     	else jsOpenNode(toopen,'nohash');
				     	var findli = $('#top_panel #node_'+toopen);
						findli.removeClass("tree-closed").addClass("tree-open");
						findli.find('ul:first').show();
				     	}

		jsOpenNode(id, false,iamfrom);
		if(iamfrom!="divider_click") jsSelectNode( id , false,iamfrom);
		
		findli = $('#top_panel #node_'+id);
		findli.removeClass("tree-closed").addClass("tree-open");
		findli.find('ul:first').show();

		jsFixScroll(2); //делаю так, чтобы видно было все selected и old_selected

}

function jsmd5(check)
{
return $.md5( check.title+check.text+check.date1+check.date2 );
}

function jsCheckSum()
{
var m_len = my_all_data.length;
for(i=0;i<m_len;i++)
	{
	console.info( jsmd5(my_all_data[i]) );
	}
}

function jsSaveData(id_one,old_id,dontsync)
{
tree_db.save_data(id_one);
//last_local_sync = jsNow()+1000; //если менял данные, то отменяю локальную синхронизацию
start_sync_when_idle = true; //тестирую
if(id_one>0) only_save = true;
else only_save = false;

//console.info("SAVE DATA = ",id_one)

//if(!dontsync) jsStartSync("soon","SAVED DATA"); //запущу синхронизацию примерно через 15 секунд

//console.info("old_id",old_id);

var m_len = my_all_data.length;
for(var ik=0;ik<m_len;ik++)
	{
	if(id_one) 
	  {
	  if(my_all_data[ik].id == old_id)
	  	{
	  	localStorage.removeItem("d_"+ik);
	  	console.info("remove:","d_"+ik);
	  	}
	  if(my_all_data[ik].id == id_one) 
		{
		localStorage.setItem("d_"+ik,JSON.stringify(my_all_data[ik]));
		preloader.trigger('hide');
		localStorage.setItem("d_length",my_all_data.length);
//		console.info("savedata = ",ik,id_one);
		return false;
		}
	  }
	else
	  {
		   localStorage.setItem("d_"+ik,JSON.stringify(my_all_data[ik]));
	  }
	}
	
localStorage.setItem("d_length",my_all_data.length);


//сохраняю комментарии

}


function jsSaveDataComment(id_one,old_id,dontsync)
{
//last_local_sync = jsNow()+1000; //если менял данные, то отменяю локальную синхронизацию
start_sync_when_idle = false;
jsSync("save_only");
//if(!dontsync) jsStartSync("soon","SAVED DATA"); //запущу синхронизацию примерно через 15 секунд

//console.info("old_id",old_id);
var mc_len = my_all_comments.length;
for(var ik=0;ik<mc_len;ik++)
	{
	if(id_one) 
	  {
	  if(my_all_comments[ik].id == old_id)
	  	{
	  	localStorage.removeItem("c_"+ik);
	  	console.info("remove:","c_"+ik);
	  	}
	  if(my_all_comments[ik].id == id_one) 
		{
		localStorage.setItem("c_"+ik,JSON.stringify(my_all_comments[ik]));
		localStorage.setItem("c_length",my_all_comments.length);
//		console.info("savedata = ",ik,id_one);
		return false;
		}
	  }
	else
	  {
		   localStorage.setItem("c_"+ik,JSON.stringify(my_all_comments[ik]));
	  }
	}

localStorage.setItem("c_length",my_all_comments.length);

}



var db;

function jsSaveDataIDB(id_one,old_id)
{
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

	var request = indexedDB.open("4tree-1.0");
	request.onerror = function(evt) {
	  console.log("Database error code: " + evt.target.errorCode);
	};
	request.onsuccess = function(evt) {
	  db = request.result;
	  initDb();
	  console.info("db=",db);
	  
	var transaction = db.transaction("people", IDBTransaction.READ_WRITE);
	var objectStore = transaction.objectStore("people");                    
	var request = objectStore.add({ name: "СИДОР", email: my_all_data });
	request.onsuccess = function (evt) {
	    console.info("did!!!"+jsNow());
	};	  
	  
	};

var peopleData = [
    { name: "WEZEL", email: "john@company.com" },
    { name: "VALENTINE", email: "don@company.com" }
];
 
	function initDb() {
	    var request = indexedDB.open("PeopleDB", 1);  
	    request.onsuccess = function (evt) {
	        db = request.result;                                                            
	    };
	 
	    request.onerror = function (evt) {
	        console.log("IndexedDB error: " + evt.target.errorCode);
	    };
	 
	    request.onupgradeneeded = function (evt) {                   
	        var objectStore = evt.currentTarget.result.createObjectStore("people", 
	                                     { keyPath: "id", autoIncrement: true });
	 
	        objectStore.createIndex("name", "name", { unique: false });
	        objectStore.createIndex("email", "email", { unique: true });
	 
	        for (i in peopleData) {
	            objectStore.add(peopleData[i]);
	        }
	    };
	}


}

function jsLoadData(load_from_server)
{
	preloader.trigger('show');
	
//если сменился юзер на этом компьютере, то удаляю данные
//if( localStorage.getItem("sync_id") )
//if( (localStorage.getItem("sync_id").indexOf($.cookie("4tree_email_md"))!=0) ) localStorage.removeItem("d_length");

if ( (!localStorage.getItem("d_length")) || (load_from_server) ) 
	{
	$.ajaxSetup({async: false});
	 
	sync_id = jsGetSyncId();
	
	lnk = "do.php?get_all_data2="+jsNow()+"&sync_id="+sync_id; //передаю время, чтобы заполнить время последней синхронизации
	
	$.getJSON(lnk,function(data){
		if(!data.all_data) 
			{
			localStorage.clear();
//			document.location.href="./4tree.php";
			alert("Данных нет");
			}
		jsTitle('Данные загружены с сервера');
		localStorage.clear();
		if(data.time_dif) localStorage.setItem("time_dif",data.time_dif);
		localStorage.setItem("last_sync_time",jsNow());
		localStorage.setItem("sync_time_server",jsNow());
		localStorage.setItem("sync_id",sync_id);
		my_all_data = $.map(data.all_data, function (value, key) { return value; });
		jsSaveData();
		my_all_comments = $.map(data.comments, function (value, key) { return value; });
		jsSaveDataComment();
		preloader.trigger('hide');
		
		console.info("my_all_data:",my_all_data);
		console.info("my_all_comments:",my_all_comments);
		});
	
	$.ajaxSetup({async: true});
setTimeout(function (){ //jsShowBasket(); 
	jsFindByParent(-3);
	jsFindByParent("user_"+main_user_id);
	},100);
	return false;
	}

my_all_data = new Array;
var d_len = localStorage.getItem("d_length");
for(i=0;i<d_len;i++)
	{
	my_all_data[i] = JSON.parse( localStorage.getItem("d_"+i) );
	}

my_all_comments = new Array; //загружаю комментарии
var dc_len = localStorage.getItem("c_length");
for(i=0;i<dc_len;i++)
	{
	my_all_comments[i] = JSON.parse( localStorage.getItem("c_"+i) );
	}


preloader.trigger('hide');
jsTitle('Использую локальные данные');

check_hash_add_do();

setTimeout(function (){ //jsShowBasket(); 
	jsFindByParent(-3);
	jsFindByParent("user_"+main_user_id);
	},100);
	

return true;
}

function check_hash_add_do()
{

var add_do = window.location.hash;
if(add_do.indexOf("add_do:")!=-1)
	{
	var text_of_do = decodeURIComponent(add_do).replace("#add_do:","").replace("+"," ");
	setTimeout(function() { jsAddDo( "new", 599, text_of_do ); jsTitle("Добавил новое дело: "+text_of_do,10000); }, 500);
	}

}

var fullscreen_mode = false;

function jsShowTreePanel() //запускается единожды
{
	jsLoadData(); //загружаю массив или из localStorage или с сервера
	jsShowTreeNode(1,false);
	preloader.trigger('hide');
		
		
		if( window.location.hash.indexOf("edit") !=-1 )
			{
		  	$(".bottom_right").addClass("fullscreen");
		  	fullscreen_mode = true;


			if( window.location.hash.indexOf("edit_current_week") !=-1 )
				{
				week_num = (new Date()).getWeek();
				window.title="4tree: "+week_num+" неделя";
			    jsGetDateRangeOfWeek( week_num );
			    jsRefreshDo();
			    setTimeout(function(){ jsOpenRedactorRecursive(my_week_num); },2000);
			    return true;
			    }


			if( window.location.hash.indexOf("edit_all") ==-1 )
				{
			  	id = window.location.hash.replace("#edit/",""); ///перехожу на заметку указанную в hash
				}
			else
				{
				id = window.location.hash.replace("#edit_all/",""); ///перехожу на заметку указанную в hash + все внутренние
				jsOpenRedactorRecursive(id); //если полноэкранный режим и несколько заметок
				return true;
				}
			}
		else
			{
		  	id = parseInt(window.location.hash.replace("#",""),36); ///перехожу на заметку указанную в hash
		  	fullscreen_mode = false;
			}
		
		var isTree = $("#top_panel").hasClass("panel_type1");
		//перехожу на заметку в hash
		if(!isTree)
		  	if(!(!id))
		  		{
		  			jsOpenPath( id );
		  		}
	
		

}


function jsTextPath(path) //превращаю путь из индексов в путь из title
{
		var textpath = '';
		var title;
		
		var path1 = path;
				     var p_len = path1.length;
				     for(var i=0; i<p_len; i=i+1)
				     	{
				     	var toopen = path1[i];
				     	var an = jsFind(toopen);
				     	if(an) title = an.title;
				     	else title = '';
				     	if( title )
							textpath = textpath +jsFind(toopen).title + ' → ';
				     	}
		return textpath;

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




//tt = jsFind(4676,{title:"hello",text:"myfrend_text"});
//ar = new Object; ar["text"] = "hi2!"; jsFind(4697,ar);

var filtercache = new Array;

function jsFind(id,fields)
{
element = jsIsThereElement(id);
if(element) return element;

id=parseInt(id);

var my_id_for_cache;
if((!filtercache[id]) || (id<0) || (id.toString().indexOf("user")!=-1) || !my_all_data[ filtercache[id] ])
	{
//		console.info("SLOW",id);
		var answer = my_all_data.filter(function(el,i) 
			{ 
			if(el) if(el.parent_id) 
				{
				if( el.id==id ) 
					{
					my_id_for_cache = i;
					return true; 
					}
				}
			} );
		if(!answer) return false;
		if(my_id_for_cache) filtercache[id] = my_id_for_cache;
	}
else
	{
	var this_element = my_all_data[ filtercache[id] ];
	
		if(my_all_data[ filtercache[id] ].id != id)
			{
				var answer = my_all_data.filter(function(el,i) 
				    { 
				    if(el) if(el.parent_id) 
				    	{
				    	if( el.id==id ) 
				    		{
				    		my_id_for_cache = i;
				    		return true; 
				    		}
				    	}
				    } );
				if(!answer) return false;
				if(my_id_for_cache) filtercache[id] = my_id_for_cache;
			}


	if(this_element) 
		{
		var answer=[];
		answer[0] = my_all_data[ filtercache[id] ];
//		console.info("FAST",id);
		}
	}

if(answer.length>0 && fields) //если нужно присваивать значения
	{
	if(answer[0]["new"]) changed_fields = answer[0]["new"]; //беру список изменённых полей
	else changed_fields = "";
	
	is_changed=false;
	$.each(fields, function(namefield,newvalue) 
		{ 		
		if(answer[0][namefield] != newvalue) 
			{
			if( (namefield!="new") )
				{ 
				if(changed_fields.indexOf(namefield+",")==-1) changed_fields = changed_fields + namefield + ","; 
				}
			else changed_fields = "UPS"; //сохраняю список полей, которые были изменены, если есть new, то обнуляю
			is_changed=true; //фиксирую, что произошли изменения
			
			if( (namefield=="date1") || (namefield=="date2"))
			{
			old_date1 = answer[0]["date1"];
			if(old_date1!="")
				{
				if(answer[0]["date2"]=="")
					{
					mydate1 = Date.createFromMysql( old_date1 );
		    		mydate1.setMinutes( mydate1.getMinutes() + 60 );
		    		answer[0]["date2"] = mydate1.toMysqlFormat();
					}
				old_date2 = answer[0]["date2"];
				mydate1 = Date.createFromMysql( old_date1 );
				mydate2 = Date.createFromMysql( old_date2 );
				dif = mydate2 - mydate1;
				newdate = Date.createFromMysql( newvalue );
				newdate.setMinutes( newdate.getMinutes() + (dif/60/1000) );
				answer[0]["date2"] = newdate.toMysqlFormat();
				if(changed_fields.indexOf("date2,")==-1) changed_fields = changed_fields + "date2,";
				console.info("newdate2=",answer[0]["date2"],"dif-minutes = ",(dif/60/1000),changed_fields);
				if( answer[0]["date1"].indexOf("00:00:00")!=-1 ) 
					{
					console.info("dif=",dif);
					if(answer[0]["date2"]!="") 
						{
						var mysplit = answer[0]["date2"].split(" ");
						answer[0]["date2"]=mysplit[0]+" 00:00:00";
						}
					}
				}
			if(answer[0]["date2"]=="NaN-NaN-NaN NaN:NaN:NaN") answer[0]["date2"] = "";
			if(answer[0]["date1"]=="NaN-NaN-NaN NaN:NaN:NaN") answer[0]["date1"] = "";
			}
			
			answer[0][namefield] = newvalue; //присваиваю новое значение
			}


		} );
			

	answer[0]["new"] = changed_fields;
	if(is_changed) 
		{
		if( changed_fields.indexOf("time,")==-1 ) //если не меняли время вручную
			{
			if(answer[0]) answer[0].time = parseInt(jsNow(),10); //ставлю время изменения (для синхронизации)
		    var need_to_save_id=id;
		    }
		else
			{
			answer[0]["new"] = "";
			}
			
		    clearTimeout(mytimer[need_to_save_id]);
		    
		    mytimer[need_to_save_id] =
		    setTimeout(function() 
		    	{ 
		    	if( localStorage.getItem("d_length") ) jsSaveData(need_to_save_id); 
		    	else jsSaveData(1);
		    	if(changed_fields!="s," && changed_fields!="position," ) $("#node_"+id+" .sync_it_i:first").removeClass("hideit");
		    	},80); //сохряню этот элемент в localStorage через 80 миллисекунд

		}
	}

	
return answer[0];
}



function jsFindComment(id,fields)
{
		var answer = my_all_comments.filter(function(el,i) 
			{ 
			if(el)
				if( el.id==id ) 
					return true; 
			} );
		if(!answer) return false;

if(answer.length>0 && fields) //если нужно присваивать значения
	{
	if(answer[0]["new"]) changed_fields = answer[0]["new"]; //беру список изменённых полей
	else changed_fields = "";
	
	is_changed=false;
	$.each(fields, function(namefield,newvalue) 
		{ 		
		if(answer[0][namefield] != newvalue) 
			{
			if( (namefield!="new") )
				{ 
				if(changed_fields.indexOf(namefield+",")==-1) changed_fields = changed_fields + namefield + ","; 
				}
			else changed_fields = "UPS"; //сохраняю список полей, которые были изменены, если есть new, то обнуляю
			is_changed=true; //фиксирую, что произошли изменения
						
			answer[0][namefield] = newvalue; //присваиваю новое значение
			}

		} );

	answer[0]["new"] = changed_fields;
	if(is_changed) 
		{
		if( changed_fields.indexOf("time,")==-1 ) //если не меняли время вручную
			{
			if(answer[0]) answer[0].time = parseInt(jsNow(),10); //ставлю время изменения (для синхронизации)
		    var need_to_save_id=id;
		    }
		else
			{
			answer[0]["new"] = "";
			}
			
		    clearTimeout(mytimer[need_to_save_id]);
		    
		    mytimer[need_to_save_id] =
		    setTimeout(function() 
		    	{ 
		    	if( localStorage.getItem("c_length") ) jsSaveDataComment(need_to_save_id); 
		    	else jsSaveDataComment(1);
		    	},80); //сохряню этот элемент в localStorage через 80 миллисекунд

		}
	}

	
return answer[0];
}




//главная функция получения и изменения данных
// jsFind(12,1,"text","hello!");
function jsFindOLD(id,is_need_save,field,value)
{
var answer = my_all_data.filter(function(el,i) { if(el.parent_id) return el.id==id; } );

if(is_need_save)
	{
	if(is_need_save!=2)
		{
		if(answer[0]) answer[0].time = jsNow();
		$("#node_"+id+" .sync_it_i").removeClass("hideit");
		}
	else
		{
		}
		
	var need_to_save_id=id;
	
	clearTimeout(mytimer[need_to_save_id]);
	
	mytimer[need_to_save_id] =
	setTimeout(function() 
		{ 
		if( localStorage.getItem("d_length") ) jsSaveData(need_to_save_id); 
		else jsSaveData(1);
		$("#node_"+id+" .sync_it_i").removeClass("hideit");
		},80); //сохряню этот элемент в localStorage через 80 миллисекунд
	}

return answer[0];
}



function jsMakeDate(mydate)
{
	today = new Date;
	mylong = "";
	result = new Object();
	
	dd = Math.round((Date.createFromMysql(mydate).getTime()-today.getTime())/60/60/1000*10)/10;

	if(mydate.indexOf("00:00:00")!=-1 && (mydate.split(" ")[0] == today.toMysqlFormat().split(" ")[0] ))
		{
		   result.mydays = "0 дн";
		   result.myclass = "shortdate";
		   return result;
		}
	
	if (mydate=="") return '';

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
   
   result.mydays = mydays;
   result.myclass = myclass+mylong;
   
   return result;


}


function jsPrepareDate()
{
  $(".date1").quickEach( function()
      {  
      if($(this).attr("childdate")) 
      	{
      	cur_date = jsMakeDate($(this).attr("childdate"));
      	$(this).html(cur_date.mydays);
      	$(this).addClass(cur_date.myclass);
      	$(this).addClass("fromchildren");
      	$(this).show();
      	}
      else	
       if($(this).attr("title")) 
      	{
      	cur_date = jsMakeDate($(this).attr("title"));
      	$(this).html(cur_date.mydays);
      	$(this).addClass(cur_date.myclass);
      	$(this).show();
      	}
      	
      	
      });
}


if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}


function jsIsThereElement(id)
{
if(id==-5) //отборы
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -5;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-search'></i> Отборы";
		return element;
	}

if(id==-6) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -6;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Все заметки, которые недавно редактировались";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-clock-3'></i> 100 недавних изменений";
		return element;
	}

if(id==-7) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -7;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Все дела отсортированные по дате выполнения";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-calendar'></i> отсортированы по дате";
		return element;
	}

if(id==-8) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -8;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Все заметки, в которых вы нажали <b>поделиться</b> и у которых есть короткая ссылка";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-export-1'></i> вы поделились";
		return element;
	}

if(id==-9) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -9;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Отбор всех записей в названии которых есть символ [@]";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-mail'></i> электронная почта";
		return element;
	}

if(id==-10) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -10;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "всё что вы оборачиваете в двойные [[квадратные скобки]], становится wiki статьёй<br>При клике, создаётся новая запись с таким заголовком.";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "[[wiki]] определения";
		return element;
	}


if(id==-3)
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "img/contacts.png";
		element.id = -3;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-users'></i> Контакты";
		return element;
	}

if(id)
 if( (id.toString().indexOf("user_")!=-1) && (my_all_frends))
	{
				
				id = id.toString().replace("user_","");
				fio = my_all_frends.filter(function(el){ return el.user_id == id })[0].fio;
				
				if(id==main_user_id)
					{ this_is_you="&nbsp;&nbsp;<i title='Ветки которыми вы поделились' class='icon-export-2'></i>"; myorder = 1;  myicon="<i class='icon-heart'></i>"; }
				else
					{ this_is_you=""; myorder = 100; myicon="<i class='icon-vcard'></i>"; }
				
				element = new Object;
			   	element.date1 = "";
				element.date2 = "";
			   	element.icon = "";
			   	element.id = "user_"+id;
			   	element.share = id;
			   	element.img_class = "note-clean";
			   	element.parent_id = -3;
			   	element.position = myorder.toString();
			   	element.text = "";
			   	element.did = "";
			   	element.del = 0;
			   	element.tab = 0;
			   	element.fav = 0;
			   	element["new"] = "";
			   	element.time = 0;
				element.user_id = id;
			   	element.lsync = 1;
			   	element.s = 0;
			   	element.remind = 0;
			   	element.title = myicon+" "+fio+this_is_you;
			   	
			   	return element;
	}

}


/**
Подбирает элементы, подходящие под критерии
@constructor
@this {jsFindByTreeId}
@return Все объекты подходящие под условия
@param tree_id - id записи
@param parent_id - parent_id записи
@requires jsFind
**/
function jsFindByTreeId(tree_id,parent_id)
{
if(!tree_id) return false;	

var data = my_all_comments.filter(function(el) 
   {
   if(el.del == 1) return false;
   return ( (el.tree_id==tree_id) && ( (el.parent_id==parent_id) || (parent_id==-1) )); 
   });
   
return data;
}


function jsFindByParentComments(parent_id,need_did,need_add_line)
{
if(!parent_id) return false;	

var data = my_all_comments.filter(function(el) 
   {
   if(el.del == 1) return false;
   return ( (el.parent_id==parent_id) ); 
   });
   
return data;
}

var last_load_frends_time=0;

function jsFindByParent(parent_id,need_did,need_add_line)
{
// && parent_id!=1
if(!jsFind(parent_id) && parent_id!=1) return false;
if(parent_id==0) return false;
if(!parent_id) return false;	

var data = my_all_data.filter(function(el) 
   {
   if(!el) return false;
   if(!show_hidden && !need_did)
	   if(el.did != "") return false; 
     if(el.del == 1) return false;
   
   return ( (el.parent_id==parent_id) ); 
   });

function compare(a,b) {
  if (parseFloat(a.position) < parseFloat(b.position))
     return -1;
  if (parseFloat(a.position) > parseFloat(b.position))
    return 1;
}

data = data.sort(compare); //сортирую


if(need_add_line)
	{
	if(parent_id==-5)
		{
		element = jsFind(-6);
		data.push(element);
		element = jsFind(-7);
		data.push(element);
		element = jsFind(-8);
		data.push(element);
		element = jsFind(-9);
		data.push(element);
		element = jsFind(-10);
		data.push(element);
		}
		
	if(parent_id==-6)
		{
		function compare5(a,b) {
 		 aa = a.time;
 		 bb = b.time;
 		 
 		 if ((aa) < (bb))
 		    return 1;
 		 if ((aa) > (bb))
 		   return -1;
}		
		mydata = [];
		mydata1 = my_all_data.slice(0);
		mydata2 = mydata1.sort(compare5); //сортировка отключена

		jj=0;
		var mydata3 = mydata2.filter(function(el) 
		   {
		   if(!show_hidden && !need_did)
			   if(el.did != "") return false; 
		   if(el.del == 1) return false;
		   if(el.id == 1) return false;
		   if(el.parent_id == 1) return false;
		   jj++;
		   if(jj>100) return false;
		   return true; 
		   });

		return mydata3;
		
		}

	if(parent_id==-7)
		{
		function compare3(a,b) {
 		 aa = a.date1;
 		 bb = b.date1;
 		 
 		 if ((aa) < (bb))
 		    return -1;
 		 if ((aa) > (bb))
 		   return 1;
}		
		mydata = [];
		mydata = my_all_data.slice(0);
		mydata1 = mydata.sort(compare3); //сортировка отключена

		jj=0;
		var mydata2 = mydata1.filter(function(el) 
		   {
		   if(!show_hidden && !need_did)
			   if(el.did != "") return false; 
		   if(el.del == 1) return false;
		   if(el.date1 == "") return false;
		   if(el.id == 1) return false;
		   jj++;
		   if(jj>100) return false;
		   return true; 
		   });

		return mydata2;
		
		}


	if(parent_id==-8)
		{
		lnk = "do.php?shortlink_list=1";
	
		$.ajaxSetup({async: false});

		$.getJSON(lnk,function(data){
//			console.info(data);
			
			mydata2=[];
			$.each(data,function(i,d){
				mydata2.push(jsFind(d));
				});
			
			});

		$.ajaxSetup({async: true});

		return mydata2;
		
		}

	if(parent_id==-9)
		{
		function compare6(a,b) {
 		 aa = a.time;
 		 bb = b.time;
 		 
 		 if ((aa) < (bb))
 		    return 1;
 		 if ((aa) > (bb))
 		   return -1;
}		
		mydata = [];
		mydata = my_all_data.slice(0);
		mydata1 = mydata.sort(compare6); //сортировка отключена

		jj=0;
		var mydata2 = mydata1.filter(function(el) 
		   {
		   if(!show_hidden && !need_did)
			   if(el.did != "") return false; 
		   if(el.del == 1) return false;
		   if(el.title) { if(el.title.indexOf("[@]")==-1) return false; }
		   else return false;
		   jj++;
		   if(jj>100) return false;
		   return true; 
		   });

		return mydata2;
		
		}

	if(parent_id==-10)
		{
		function compare6(a,b) {
 		 aa = a.title;
 		 bb = b.title;
 		 
 		 if ((aa) < (bb))
 		    return -1;
 		 if ((aa) > (bb))
 		   return 1;
}		

		jj=0;
		var mydata2 = my_all_data.filter(function(el) 
		   {
		   if(!show_hidden && !need_did)
			   if(el.did != "") return false; 
		   if(el.del == 1) return false;
		   if(el.title) { if(el.title.indexOf("[[")==-1) return false; }
		   if(el.title) { if(el.title.indexOf("]]")==-1) return false; }
		   else return false;
		   jj++;
		   if(jj>100) return false;
		   return true; 
		   });
		   
		mydata = [];
		mydata = mydata2.slice(0);
		mydata2 = mydata.sort(compare6); //сортировка отключена
		   

		return mydata2;
		
		}


	
	if(parent_id==1)
		{
		element = jsFind(-3);
		data.push(element);
		element = jsFind(-5);
		data.push(element);
		}
	if(parent_id==-3)
		{
			if(my_all_frends)		
			    $.each(my_all_frends,function(i,d){
			    	element = jsFind( "user_"+d.user_id );
			       	data.push(element);
			   		});
		}

	}


	if( my_all_share )
	 for(i=0;i<my_all_share.length;i=i+1) 
	 	{
		if( (my_all_share[i].parent_id_user==parent_id) || (parent_id.toString().replace("user_","") == my_all_share[i].host_user ) )
			{
			if(my_all_share)
			    findshare = jsFind(my_all_share[i].tree_id);
			    
			if(findshare) 
				{
				findshare.share=my_all_share[i].host_user;
			
			    recursivedata=[];
			    myid = my_all_share[i].tree_id;
			    jsRecursive( myid );
			    $.each(recursivedata,function(iii,ddd){ ddd.share = findshare.share; });
			
			    if(data.indexOf(findshare)==-1)	data.push( findshare );
			    }
			
			}
		}

recursivedata=[];



return data;



}


//поиск пути элемента (все родители)
function jsPath(element)
{
	var path = new Array;
	var i = 0;
	while(element) 
		{
		var parent_id = element.parent_id;
		if(parent_id!=0) 
			{
			if(parent_id) path[i] = parent_id.toString();
			i=i+1;
			}
		var old_element = element;
		element = jsFind( parent_id );
		if(!element) 
			if(old_element.user_id) 
				if(old_element.user_id != main_user_id ) 
						{
						element = jsFind( "user_" + old_element.user_id );
						path[i] = "user_"+old_element.user_id;
						i=i+1;
						}
		}
	return path.reverse();
}

var elemtext='';
function jsFindPath(id)
{
var element = jsFind(id);
var path = jsPath(element);
return path;
}

function strip_tags( str ){	// Strip HTML and PHP tags from a string
	// 
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	if(!str) return "";
	answer = str.replace(/<\/?[^>]+>/gi, '');

	answer = answer.replace(/\n/gi, '');

	return answer;
}


function jsFindText(text,findtext,length)
{
var text = text.substr(0,5000);
text = text.replace("</p>"," \n");
text = text.replace("</div>"," ");
text = text.replace("<br>"," ");
text = text.replace("</li>"," ");
text = strip_tags(text);
var length = parseInt(length,10)/3;

var findstart = text.toLowerCase().indexOf(findtext.toLowerCase());

if(findstart==-1) return text.substr(0,length);


for(var i=findstart;i>0;i=i-1)
   {
   if( (text[i]=='.') || (text[i]=='!') || (text[i]=='?') || (text[i]==';') ) { i=i+2; break; }
   }

if(i<50) i=0;
answer = text.substr(i,length+(findstart-i));

//answer = answer.replace(findtext.toLowerCase(),"<b>"+findtext.toLowerCase()+"</b>");

if(i>0) answer = '…'+answer;
if(length+findstart<text.length) answer = answer+'…';

return answer;
}

var last_refresh;
/* !Быстрое обновление дерева  */
function jsRefreshTreeFast(myid,arrow,date1)
{
var all_data_changed = my_all_data.filter(function(el) 
   {
   return ( (el.time>last_refresh) ); 
   });
   
console.info("Изменилось с последнего раза:",all_data_changed,myid);

$.each(all_data_changed,function(i,data)
	{
	console.info("Нужно обновить на экране:",data.id);
	});

var element = jsFind(myid);
if(element)
	{
		id = node_to_id( $("li.selected").attr("id") );
//		console.info("I GOING TO ADD:",id,element.parent_id,element,arrow);
		if(arrow == "right" || date1) //если я добавляю к родителю
			{
				where_to_add = $("#panel_"+element.parent_id).find("ul");
				iii = $("#panel_"+element.parent_id+" li").length;
				where_to_add.find(".divider_li:last").remove();
				var divider = "<div class='divider_li' pos='"+(iii+0.2)+"' myid='"+element.parent_id+"'></div>";
				where_to_add.append( jsRenderOneElement(element,iii) + divider );
			}
		else
			{
				iii = element.position;
				var divider = "<div class='divider_li' pos='"+(element.position+0.2)+"' myid='"+element.parent_id+"'></div>";
				$( jsRenderOneElement(element,iii) + divider ).insertAfter( $("li.selected") );
			}
	}

last_refresh = jsNow();
}


var need_to_re_refresh;
//обновление дерева
function jsRefreshTree()
{
var myselected,myold_selected,old_scroll;
last_refresh = jsNow();

//если открыто редактирование дерева, то запрет на обновление и повтор через 5 секунд
if ( ($("#mypanel .n_title[contenteditable=true]").length > 0) || ($("#mypanel #minicalendar").length > 0) ) 
	{
	clearTimeout(myrefreshtimer);
	console.info("Пользователь редактирует, попробую обновить дерево через 3 секунды");
	myrefreshtimer = setTimeout(function(){ jsRefreshTree(); },3000);
	return false;
	}

var scrollleft = $("#mypanel").scrollLeft();

var isTree = $("#top_panel").hasClass("panel_type1");

if(isTree) {
	jsRefreshOneFolder(1);
} else {

		$(".panel").quickEach( function() 
			{ 
			if( $(this).attr('id') )
				{
				myselected = node_to_id( $(this).find(".selected").attr('id') ); 
				myold_selected = node_to_id( $(this).find(".old_selected").attr('id') ); 
				old_scroll = $(this).scrollTop();
				jsShowTreeNode( $(this).attr("id").replace("panel_","") ); 
				$(this).scrollTop(old_scroll);
				$("#node_"+myselected).addClass("selected").removeClass("tree-closed").addClass("tree-open"); 
				$("#node_"+myold_selected).addClass("old_selected").removeClass("tree-closed").addClass("tree-open"); 
				
				}
			});
  }
$('#calendar').fullCalendar( 'refetchEvents' ); 
$("#mypanel").stop().scrollLeft(scrollleft);
jsFixScroll(2);
}


function jsPresize() //удаляю и добавляю узкие полоски для регулировки ширины панелей
{
	$("#mypanel .panel").quickEach(function() 
		{ 
		if( $(this).next(".presize").length==0 )
			$("<div class='presize'></div>").insertAfter($(this)); 
		else
			{
			$(this).next(".presize").next(".presize").remove();
			$(this).next(".presize").next(".presize").remove();
			}
		});
}

function jsReorder(dropto)
{
	if((dropto<0) || (dropto.toString().indexOf("user")!=-1)) return true;

					$.each( jsFindByParent(dropto), function(i,dd) 
						{ 
						if(parseInt(dd.position,10) != (i+1) ) 
							{
							jsFind(dd.id,{position : (i+1)});
							}
						});
}

function jsShowTreeNode(parent_node,isTree,other_data)
{
	var where_to_add;
	if(other_data)
	  {	  
	  		if(parent_node!=-2)  	$(".search_panel_result ul").html('');
	  }
	else
	  {
	  jsReorder(parent_node);
	  var data = my_all_data[parent_node];
	  }

//	  var data = jsFindByParent(parent_node,null,true);
	  var data = api4tree.jsFindByParent(parent_node,null,true);
	
	console.info("jsShowTreeNode",parent_node,data)
	
	if(parent_node==0) var mydata = data;
	else var mydata = data;
	
	iii=0;

	if( (parent_node==-1) || (parent_node==-2) )
	      var mydata = other_data;

	  $.ajaxSetup({async: true});
	  
	if(mydata.length==0) 
		{
		$(".panel[myid='"+parent_node+"']").remove();
		return true;
		}

function compare2(a,b) {
  aa = a.date1;
  bb = b.date1;
  
  if(aa=="") aa = "3000-01-01 00:00:00";
  if(bb=="") aa = "3000-01-01 00:00:00";
  
  if ((aa) < (bb))
     return -1;
  if ((aa) > (bb))
    return 1;
}
//mydata = mydata.sort(compare2); //сортировка отключена


	$.each(mydata, function(i,data)
		{

//		  add_class=data.img_class;
		  if(!data)	return true;
		  var add_class = jsMakeIconText(data.id,data.text).myclass;
		  var textlength = jsMakeIconText(data.id,data.text).mylength; 
		  
		  progressbar = "<div class='textlength' style='width:"+ textlength +"em'></div>";
		  
		  
		  if(data.icon=='') 
		  	img = "<div class='node_img "+add_class+"'>"+"</div>";
		  else 
		  	{
		  	icon = data.icon.replace("mini/","");
		  	icon = "image.php?width=25&height=25&cropratio=1:1&image=/"+icon;
		  	img = "<div class='node_img node_box' style='background-image:url("+icon+")'>"+"</div>";
		  	}
		  	
		 if((parent_node!=-1) && (parent_node!=-2))//если мы находимся не в поиске и не в корзине
		  if(iii==0) 
		  	{
		  	if(isTree)  // если это дерево
		  		{
		  		if( $(".ul_childrens[myid="+parent_node+"]").length==0 )
		  			$("#top_panel #node_"+parent_node).append("<ul class='ul_childrens' myid="+parent_node+"></ul>");
		  		else
		  			{
		  			return false;
		  			}
		  		}
		  	else 
		  		{
		  		if ($("#panel_"+parent_node).length != 1) //если панель ещё не открыта
		  			{
		  			$("#mypanel").append("<div id='panel_"+parent_node+"' class='panel'><ul myid='"+parent_node+"'></ul></div>");
		  			pwidth = $.cookie('pwidth');
		  			if(!pwidth) pwidth = 300;
		  			$("#mypanel .panel:last").width(pwidth);
		  			}
		  		else //если панель уже открыта, нужно её очистить
		  		 	{
		  		 	$("#panel_"+parent_node+" ul").html('');
		  		 	}
		  		}
		  	}
		  
		  
		  
		  datacount = Object.size( jsFindByParent(data.id,null,true) );
		  
		  if(datacount>0) 
		  	{ 
		  	countdiv = "<div class='countdiv'>"+datacount+"</div>"; 
		  	countdiv = "";
		  	isFolder="folder"; 
		  	if(textlength>0)
			  	isFull = " full";
		  	else
			  	isFull = "";
		  	img = "<div class='folder_closed"+isFull+"'>"+"<div class='countdiv' title='"+textlength+"'>"+datacount+"</div>"+"</div>";
		  	triangle = 	 "<div class='icon-play-div'>"+
				  		 " 	<i class='icon-play'></i>"+
				  		 "</div>";
		  	}
		  else 
		    { 
		    countdiv = ''; isFolder = "";
		    if(parent_node==1) var display = "opacity:0;";
		    else var display = "opacity:0;";
		  	triangle = 	 "<div class='icon-play-div' style='"+display+"'>"+
				  		 " 	<i class='icon-play'></i>"+
				  		 "</div>";
		    }

		  if(isTree) var where_to_add = $("ul[myid="+parent_node+"]");
		  else var where_to_add = $("#panel_"+parent_node+" ul");
		  
		  mytitle = data.title;

		  if(parent_node==-1) //функция отображения результатов поиска//
		  	{
		  	var where_to_add = $(".search_panel_result ul");
		  	var ans = jsFindPath(data.id);
		  	if(ans)
			  	var add_text = '<br><span class="search_path">'+jsTextPath( ans )+'</span>';
			else var add_text = '';
		  	
		  	var length = $(".search_panel_result").width()*3;
		  	
		  	var findtext = $('#textfilter').val();
		  	
		  	var text = jsFindText(data.text,findtext,length);
		  	
		  	var temp_data = jsFindByTreeId(data.id,-1);
		  	if(temp_data.length>0) 
		  		{
		  		var findcomment = temp_data.filter(function(el){
		  			return el.text.toLowerCase().indexOf(findtext.toLowerCase())!=-1;
		  			});
		  		if(findcomment[0])
		  			{
			  			console.info("FIND_SAMPLE = ",findcomment[0]);
			  			text = text + "<br>" + findcomment[0].text + "(комментарий от "+findcomment[0].name+")";
		  			}
		  		}

		  	mytitle = mytitle.replace(findtext,"<b>"+findtext+"</b>");
		  	
		  	search_sample = '<div class="search_sample">'+text+'</div>';
		  	}
		  else { add_text = ''; search_sample = ''; }
		  

		  if(parent_node==-2)
		  	{
		  	var where_to_add = $(".combo_list ul");
		  	var ans = jsFindPath(data.id);
		  	if(ans)
			  	add_text = '<br><span class="search_path">'+jsTextPath( ans )+'</span>';
			else add_text = '';
		  	}


		  if(data.did!="") crossline = " do_did";
		  else crossline = "";
		   
		  if(data.fav==0) add_did="";
		  else add_did=" chdid";
		   
		  if(data.remind==0) remind = "";
		  else remind = "<i class='icon-bell-1' style='float:right;'></i>";

		  checkbox = "<div class='tcheckbox"+add_did+"' title='"+data.id+"'>"+progressbar+"</div>";
		  
		  childdate = jsShowMaxDate(data.id);

		  if( (data.lsync - data.time) > 0 )
			  hideit = " hideit";
		  else
			  hideit = "";

		  needsync = "<div class='syncit'><i class='icon-arrows-cw sync_it_i"+hideit+"'></i></div>";
		
		  		  
		  //старый вариант	
		  icon_share = "";		 
		  	
		  	  		 
		  myli = "<div class='divider_li' pos='"+(iii-0.2)+"' myid='"+parent_node+"'></div>"+
		  		 "<li id='node_"+data.id+"' class='tree-closed "+isFolder+"'>" +checkbox+icon_share+
		  		 "<div myid='"+childdate[1]+"' childdate='"+childdate[0]+"' title='"+data.date1+childdate[2]+"' class='date1'></div>"+remind+
		  		  triangle+
		  		  countdiv+img+needsync+
		  		 "<div class='n_title"+crossline+"' myid='"+data.id+"'>" + mytitle + add_text + search_sample + "</div>"+
		  		 "<div class='note_part'>"+"</div>"+
		  		 "</li>";
		  
//		  where_to_add.append(myli);
		  
		  
		  where_to_add.append( jsRenderOneElement(data,iii,parent_node) );
		  
		  iii=iii+1;
	  	});
//	myli = "<div class='divider_li' pos='"+iii+"' myid='"+parent_node+"'></div>";
// 	where_to_add.append(myli);
	  	
	  	
	  jsPrepareDate();
	  
	  if(parent_node==-1) return true;
	  	

	  if(isTree) 
	  	{
	  	}
	  else
	  	{
		thisWidth = $("#mypanel")[0].scrollWidth;	
		//	console.info(thisWidth);
	if(!$(".makedone").is(":visible"))
		if($('#mypanel').scrollLeft()!=thisWidth) $('#mypanel').stop().animate({"scrollLeft":thisWidth},700);
		}
	
	if(!isTree) 
		{
		jsPresize();
		}
	
	
	jsMakeDrop();
	
}

function jsAddToTree(id_node)
{
	if($("#node_"+id_node).length) return true; //если элемент уже есть, то добавлять не нужно

	var isTree = $("#top_panel").hasClass("panel_type1");
	console.info("ADD TO TREE = ",id_node);
	var element = jsFind(id_node);
	
	var render_node = jsRenderOneElement( jsFind(id_node) );
	
    if(isTree) {
    	where_to_add = $("ul[myid="+element.parent_id+"]");
    } else {
    	where_to_add = $("#panel_"+element.parent_id+" ul");
    }

	where_to_add.find(".divider_li:last").remove();
	var iii = element.position;
	var divider = "<div class='divider_li' pos='"+(iii+0.1)+"' myid='"+element.parent_id+"'></div>";
	
	var before_div = where_to_add.find(".divider_li[pos='"+iii+".1']");
	if(before_div.length)	$(render_node + divider).insertBefore(before_div);
	else where_to_add.append(render_node + divider);

}

function jsSnapShotMake()
{
	var snapshot={};
	var tree_open = $(".tree-open");
	
	snapshot.tree_open = []; //открытые папки
	var len = tree_open.length;
	for(var i=0;i<=len;i++)
	   {
	   if(tree_open[i]) snapshot.tree_open.push( $(tree_open[i]).attr("id") );
	   }

	snapshot.tree_selected = $(".selected").attr("id");	  //выбранные

	snapshot.tree_old_selected = []; //ранее выбранные папки
	var tree_old_selected = $(".old_selected");
	var len = tree_old_selected.length;
	for(var i=0;i<=len;i++)
	   {
	   if(tree_old_selected[i]) snapshot.tree_old_selected.push( $(tree_old_selected[i]).attr("id") );
	   }

	snapshot.tree_scroll = {};
	var tree_panel = $(".panel");
	var len = tree_panel.length;
	for(var i=0;i<=len;i++)
	   {
	   if(tree_panel[i]) snapshot.tree_scroll[$(tree_panel[i]).attr("id")] = ( $(tree_panel[i]).scrollTop() );
	   }
	  
	return snapshot;
	
}

function jsSnapShotApply(snapshot)
{
	$(".selected").removeClass(".selected");
	$(".old_selected").removeClass(".old_selected");
	$(".tree_open").removeClass("tree_open");

	$.each(snapshot.tree_open, function(i,el){
		$("#"+el).click();
	})
	
	$.each(snapshot.tree_old_selected, function(i,el){
		$("#"+el).addClass("old_selected");
	})

	$.each(snapshot.tree_scroll, function(i,el){
		$("."+i).scrollTop(el);
	})
	
	
}


function jsRefreshOneFolder(panel_id)
{
	elements = $("#mypanel li").clone();
	var len=elements.length;
	for(var i=0;i<len;i++)
		{
		var id = node_to_id( $(elements[i]).attr("id") );
		var changetime_from_base = jsFind(id).time;
		var changetime_from_screen = $(elements[i]).attr("time");
		
		if(changetime_from_base != changetime_from_screen) //если элемент на экране не совпадает с базой
			{
			var isFolderOpen = $(elements[i]).hasClass("tree-open");
			jsRefreshOneElement(id);
			if(isFolderOpen) $("#mypanel #node_"+id).addClass("tree-open");
			console.info("Обновляю один элемент - "+id);
			}
		
		}
	
}

function jsRefreshOneElement(myid)
{
   
   var el = $("#node_"+myid);
   var make_class="";
   if (el.hasClass("selected")) make_class = "selected";
   if (el.hasClass("old_selected")) make_class = "old_selected";
   el.prev(".divider_li").remove();
   var myul = el.find("ul:first").clone(); //сохраняю вложенный список
   el.replaceWith( jsRenderOneElement( jsFind(myid) ) );
   $(myul).appendTo("#node_"+myid); //вставляю вложенный список обратно
   if(make_class!="") 
   		{
	    $("#node_"+id).addClass(make_class);
   		}
   jsPrepareDate();
   jsMakeDrop();
}


/* !Обновление одного элемента */
function jsRenderOneElement(data,iii,parent_node)
{
		  childdate = jsShowMaxDate(data.id);

		  info = jsInfoFolder(data,parent_node);
		  
		  myli = "<div class='divider_li' pos='"+(data.position-0.9)+"' myid='"+data.parent_id+"'></div>"; //разделитель
		  myli +=  "<li id='node_"+data.id+"' time='"+data.time+"' myid='"+data.id+"' class='tree-closed "+info.isFolder+"'>";
		  myli += "<div class='tcheckbox fav_color_"+data.fav+"' title='"+data.id+"'>"+info.comment_count+"</div>" + info.icon_share;
		  myli += "<div myid='"+childdate[1]+"' childdate='"+childdate[0]+"' title='"+data.date1+childdate[2]+
		  		  "' class='date1'></div>";
		  myli += info.remind + info.triangle + info.countdiv + info.img + info.needsync;
		  myli += "<div class='n_title"+info.crossline+"' myid='"+data.id+"'>";
		  myli += info.mytitle + info.add_text + info.search_sample; 
		  myli += "</div>";
		  myli += "";
		  myli += "<div class='note_part'></div></li>";

  return myli;
}

jQuery.fn.highlight = function (str, className) {
    var regex = new RegExp(str, "gi");
    return this.each(function () {
        this.innerHTML = this.innerHTML.replace(regex, function(matched) {
            return "<span class=\"" + className + "\">" + matched + "</span>";
        });
    });
};

function jsInfoFolder(data,parent_node) //заполняет массив данными элемента //DO:иконки share не показывает
{

		  var mytitle = data.title;
		  if(parent_node==-1) //панель поиска
		  	{
		  	var ans = jsFindPath(data.id);
		  	if(ans)
			  	var add_text = '<br><span class="search_path">'+jsTextPath( ans )+'</span>';
			else var add_text = '';
		  	length = $(".search_panel_result").width()*2.3;
		  	var findtext = $('#textfilter').val();
		  	var text = jsFindText(data.text,findtext,length);
		  	
//		  	mytitle = mytitle.replace(findtext,"<b>"+findtext+"</b>");
		  	
		  	var temp_data = jsFindByTreeId(data.id,-1);
		  	if(temp_data.length>0) 
		  		{
		  		var findcomment = temp_data.filter(function(el){
		  			return el.text.toLowerCase().indexOf(findtext.toLowerCase())!=-1;
		  			});
		  		if(findcomment[0])
		  			{
			  			console.info("FIND_SAMPLE = ",findcomment[0]);
			  			if(text) var text_comment = '<br>';
			  			else var text_comment = "";
			  			text_comment = text_comment + '<div class="comment_foto"><img src="image.php?width=15&height=15&cropratio=1:1&image=/'+findcomment[0].foto+'" height="15px" width="15px" class="comment_foto_img"></div> <u>'+findcomment[0].name+'</u>: <i>'+strip_tags(findcomment[0].text)+'</i>';
		  			}
		  		}
		  	else var text_comment = "";
		  	
		  	var search_sample = '<div class="search_sample">'+text+text_comment+'</div>';
		  	}
		  else { add_text = ''; search_sample = ''; }

		  if(parent_node==-2) //указание папки переноса дела
		  	{
		  	var where_to_add = $(".combo_list ul");
		  	var ans = jsFindPath(data.id);
		  	if(ans)
			  	var add_text = '<br><span class="search_path">'+jsTextPath( ans )+'</span>';
			else var add_text = '';
		  	}

////////////
		  if( ((data.lsync - data.time) > 0) || (data["new"]=="position,"))
			  var hideit = " hideit";
		  else
			  var hideit = "";

		  var needsync = "<div class='syncit'><i class='icon-arrows-cw sync_it_i"+hideit+"'></i></div>";

////////////
		  if(data.did!="") var crossline = " do_did";
		  else var crossline = "";

////////////
		  if(data.remind==0) var remind = "";
		  else var remind = "<i class='icon-bell-1' style='float:right;'></i>";
///////////
		  var add_class = jsMakeIconText(data.id,data.text).myclass;
///////////
		  if(data.icon=='') 
		  	var img = "<div class='node_img "+add_class+"'>"+"</div>";
		  else 
		  	{
		  	var icon = data.icon.replace("mini/","");
		  	icon = "image.php?width=50&height=50&cropratio=1.1:1&image=/"+icon;
		  	var img = "<div class='node_img node_box' style='background-image:url("+icon+")'>"+"</div>";
		  	}

///////////
		  var datacount = Object.size( jsFindByParent(data.id,null,true) );
		  
		  if(datacount>0) 
		  	{ 
		  	countdiv = "";
		  	var isFolder="folder"; 

		  	var add_class = jsMakeIconText(data.id,data.text).myclass;
		  	var textlength = jsMakeIconText(data.id,data.text).mylength; 

		  	if(textlength>0)
			  	var isFull = " full";
		  	else
			  	var isFull = "";
		  	var img = "<div class='folder_closed"+isFull+"'>"+"<div class='countdiv'>"+datacount+"</div>"+"</div>";
		  	var triangle = 	 "<div class='icon-play-div'>"+
				  		 " 	<i class='icon-play'></i>"+
				  		 "</div>";
		  	}
		  else 
		    { 
		    var countdiv = ''; 
		    var isFolder = "";
		    if(data.parent_id==1) var display = "opacity:0;";
		    else var display = "opacity:0;";
		  	var triangle = 	 "<div class='icon-play-div' style='"+display+"'>"+
				  		 " 	<i class='icon-play'></i>"+
				  		 "</div>";
		    }
		    
///////////////////////////////////////////////////////

		if(my_all_frends)   
		  	if(data.share) //нужно исправить, такой переменной нет!
		  		{
				if(data.user_id==data.share)
			  		frend_share = my_all_frends.filter(function(el){ return el.user_id == data.share; });
			  	else
			  		frend_share = my_all_frends.filter(function(el){ return el.user_id == data.user_id; });

			if(frend_share[0].user_id!=main_user_id)
		  		icon_share = "<div title='"+frend_share[0].fio+" ("+frend_share[0].email+")\nделится с вами СВОЕЙ веткой' class='share_img'><img src='"+frend_share[0].foto+"'></div>";
		  	else
		  		{
		  		if(my_all_share)
		  		  var ddd =my_all_share.filter(function(el){ return (el.host_user==main_user_id && (el.tree_id==data.id)); });
		  		icons_share = "";
		  		$.each(ddd,function(j,myfrend){
			  		frend_share = my_all_frends.filter(function(el){ return el.user_id == myfrend.delegate_user; });
			  		icon_share = icon_share+"<div title='"+frend_share[0].fio	+" ("+frend_share[0].email+")\nможет редактировать ВАШУ ветку' class='share_img'><img src='"+frend_share[0].foto+"'></div>";
		  			});
		  		}
		  		
		  		}

		var icon_share = "";

		if(my_all_frends)   
		  	if(data.user_id != main_user_id ) 
		  		{
			  	frend_share = my_all_frends.filter(function(el){ return el.user_id == data.user_id; });
			  if(frend_share[0])
		  		icon_share = "<div title='"+frend_share[0]["fio"]+" ("+frend_share[0]["email"]+")\nделится с вами СВОЕЙ веткой' class='share_img'><img src='"+frend_share[0]["foto"]+"'></div>";
		  		}
		    
		var comment_count = jsFindByTreeId(data.id,-1).length;
		if(comment_count==0) comment_count="";
		    
return {comment_count:comment_count,countdiv:countdiv, isFolder:isFolder, img: img, triangle:triangle, icon_share:icon_share, add_text:add_text, search_sample:search_sample, mytitle:mytitle, remind:remind, crossline:crossline, needsync:needsync};
}


function jsMakeDrop() //обеспечивает элементам drag&drop
{
//return true;
		$("body").unbind("mousemove");
		$("body").unbind("mouseup");
		
	$("#mypanel li").not("ui-draggable").draggable({
				zIndex: 999,
				revert: false,      // will cause the event to go back to its
				helper:"clone",
				appendTo: "#content1"
//				revertDuration: 500  //  original position after the drag
			});
			
	$( "#mypanel .n_title,.divider_li" ).not("ui-droppable").droppable({
			activeClass: "ui-can-recieve",
			hoverClass: "ui-can-hover",
			over: function (event, ui) {
				//$(this).click();
				},
            drop: function( event, ui ) {
            	console.info("drop-all",usedOverlays,ui,ui.draggable[0] );
            	
            	
            	if( (usedOverlays.length!=0) || ($(ui.draggable[0]).hasClass("fc-event")) ){ return true; } //если под делом есть другое дело, но мы над календарём
            	
            	if(event.target.attributes.pos) //если уронили на разделитель
            		{
	            	dropto_pos = event.target.attributes.pos.nodeValue;
	            	dropto_parent_id = event.target.attributes.myid.nodeValue;
	            	dropto = event.target.attributes.myid.nodeValue;
	            	draggable = ui.draggable[0].attributes.myid.nodeValue;

	            	console.info("drop=",dropto,dropto_pos,draggable);

	            	el = jsFind(dropto);
					if(el) jsReorder( el.parent_id );
					else return true;

					jsFind(draggable,{ position:dropto_pos, parent_id : dropto_parent_id });

					jsRefreshTree();
            		}
            	else //если уронили на другой элемент
            		{
            		if(!ui.draggable[0].attributes.myid) return true;
	            	dropto = event.target.attributes.myid.nodeValue;
	            	draggable = ui.draggable[0].attributes.myid.nodeValue;
	            	console.info("dropto=",jsFind(dropto),jsFind(draggable));
	            	
	          	if(jsFind(draggable).share)
	            	if( jsFind(dropto).share != jsFind(draggable).share ) 
	            		{ alert("Вы не можете переместить чужую заметку к себе — "+jsFind(draggable).share+"!="+jsFind(dropto).share); return true; }
	            	
	           		jsFind(draggable, {parent_id : dropto});
			    	jsRefreshTree();
			    	
	           		if(false)
					var $txt = $.ajax({type: "POST",url: "server.php", data: dataString, success: function(t) 
				       {
			    	    jsTitle("Объект перемещён",5000);
			           }});
		           	}
            	$(".fc-cell-overlay").remove();
   				$(".ui-draggable-dragging").remove();

        }});


}

var recursivedata = [];
function jsRecursive(id) //рекурсивно перебирает все элементы определённого родителя. Наполняет recursivedata.
{

var mychildrens = my_all_data.filter(function(el) 
   {
   if(!el) return false;
   if(el.del == 1) return false;
   return ( (el.parent_id==id) ); 
   });
	
function compare(a,b) {
  if (parseFloat(a.position) < parseFloat(b.position))
     return -1;
  if (parseFloat(a.position) > parseFloat(b.position))
    return 1;
}

mychildrens = mychildrens.sort(compare); //сортирую

	
	if( mychildrens.length > 0 )
		{
		$.each(mychildrens,function(i,dd)
		   {
		   if(dd.did==0) { recursivedata.push(dd);
		   jsRecursive(dd.id); }
		   });
		}
}

//Показывает максимальную дату, проходя рекурсивно по всем детям
//jsShowMaxDate(1,jsFindByParent(1))
function jsShowMaxDate(id)
{	
	if ( !show_childdate ) return ["",0,""];
	var parent = id;
	recursivedata=[]; 
	el_id = "";
	el_title = "";
	min_date="4000-12-20 01:01:01"; 
	jsRecursive( parent ); 
	$.each(recursivedata, function(i,d) 
		{ 
		if((d.date1!='') && (d.date1))
			{ 
			if(min_date>d.date1) { min_date=d.date1; el_id = d.id; el_title = d.title; }
			} 
		}); 
	
    recursivedata=[];

	
	if(min_date=="4000-12-20 01:01:01") return ["",0,""];
	else 
	return [min_date,el_id,el_title];

}

function onResize() //вызывается при каждом ресайзе страницы
{
	if($(".ui-resizable-resizing").length) return true;
	
			var w = $(document).width();
			var y = $(document).height();
			
			//если мышка подошла близко к краю, то скрываю одну панель
			if(main_x<15) 
				{
				if( !$("html").hasClass("v4") ) $(".bottom_left").hide();
				main_x = -1;
				
				if( $("#content1").hasClass("v2") ) $(".place_of_top").hide();
				
				}
			else
				{
				$(".bottom_left").show();
				if( $("#content1").hasClass("v2") ) $(".place_of_top").show();
				}

			if( main_x>85 ) 
				{
				$(".bottom_right").hide();
				$(".bottom_left").css('width','auto');
				$(".bottom_left").css('right','15px');
				main_x = 97.5;
				}
			else
				{
				$(".bottom_left").css('width','100%');
				$(".bottom_left").css('right','0px');
				$(".bottom_right").show();
				}
				
				
			if(main_y<50)
			  {
			  main_y=0;
			  $(".place_of_top").children("div").hide();
			  }
			else
			  {
			  $(".place_of_top").children("div").show();
			  }
			 
			  
			if(main_y>y-150)
			  {
			  main_y=y-90;
			  $(".bottom_left").hide();
			  if( !$("#content1").hasClass("v2") ) $(".bottom_right").hide();
			  }
			else
			  {
			if( (main_x>15) && (main_x<85) )
			  $(".bottom_left,.bottom_right").show();
			  }

			
			//ресайзим ширину главных панелей
			if(main_x!=97.5) $(".bottom_left").css("width",main_x+'%');
			$(".bottom_right").css("left",main_x+1+'%');
			
//			if(main_x==101)	$(".resize_me").css("margin-left","-25px");
//			else $(".resize_me").css("margin-left","18px");
			
			center = main_x;
			$(".resize_me").css("left",center+'%');
			$(".sos").css("left",center+0.5+'%');

			y = $(".resize_me").width();
			
//			left = -3*(19-y);
//			$(".resize_me i").css("left",left);

			if( $("#content1").hasClass("v2") ) 
			  {
			  $(".place_of_top").css("width",main_x+2.5+'%');
			  }
			else
			  $(".place_of_top").css("width",'auto');

			//ресайзим высоту главных панелей
			if( $("#content1").hasClass("v2") ) 
			  {
				$(".place_of_top").height(main_y-34);
			  }
			else
			  {
				$(".place_of_top").height(main_y);
			  }
			  
			if( $("html").hasClass("v4") ) 
			  {
			  $("#wrap").css("min-height",main_y+510); //510 - высота bottom
			  }
			  
			$("#bottom_panel").css('top',main_y);
			
			
			var newheight=$('#calendar').parent("div").height()-62;
			$('#calendar').fullCalendar('option','contentHeight', newheight); //высота календаря
			$(".search_panel_result").height(newheight);
			$("#tree_news").height(newheight);
			
//			$("#tree_comments").height(newheight);
			
			if( $("#comment_enter").parents(".comment_box").length ) 
				{
				var reply_height = 0;
				}
			else 
				{
				var reply_height = parseInt( $("#comment_enter").height(),10 );
				}
			
//			$("#tree_comments_container").height( newheight - reply_height );


			jsSetTimeNow(); //обновляю указатель текущего времени
			
			jsCalcTabs();

}

function jsCalcTabs() //устанавливает ширину табов у дневника и у избранных
{
clearTimeout(calctabs_timer);
calctabs_timer = setTimeout(function()
	{
	$(".favorit_tabs").quickEach(function()
		{
				var this_tabs = $(this);
				
				var panel_width = this_tabs.parent('div').outerWidth();
				
				var all_w = 0;
			
				this_tabs.find("li").show();
				this_tabs.next(".favorit_menu:first").find('ul').html('');
				this_tabs.next(".favorit_menu:first").hide();
				
				this_tabs.find("li").quickEach(function(){
					var current_w = $(this).outerWidth();
					all_w = all_w + current_w;
					
					if(all_w>panel_width-25) 
					  {
					  this_tabs.next(".favorit_menu:first").show();
					  ul = this_tabs.next(".favorit_menu:first").find('ul');
					  $(this).hide().clone().appendTo(ul).show();
					  }
					
					});
		});
		
	},50);

}


//дописывает ноль к цифре
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

//Перевожу дату new Date в mySQL формат
Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};

//собираю все события с датами для календаря
function jsGetEvents(start, end, callback) {
setTimeout(function()
	{
	 var caldata2=[];
	
	var caldata = my_all_data.filter(function(el) 
			{ 
		    if(!el) return false;
			if(el.date1!="" && el.del!=1 ) return true; 
			else return false;
			} );
			
	for(var date=start;date<end;date=new Date(date.getTime() + 1*24*60*60*1000))
		{
		var found_dates = jsFindRecur( date.toMysqlFormat() );
		if(found_dates.length>0) 
			{
			$.each(found_dates,function(i,d)
				{ 
				var mytime = d.date1.split(" ");
				var mydate = date.toMysqlFormat();
				mydate = mydate.split(" ");
				var mynewdate = mydate[0]+" "+mytime[1];
				caldata2.push( { id:d.id , date1: mynewdate } );
				});
			}
		}
//	console.info("caldata = ",caldata2);
	
	var answer1=[];
	var datenow = sqldate( jsNow() );
			
	$.each(caldata,function(i,d)
		{
		if(d.date1.indexOf("00:00:00")>-1) allday = true;
		else allday = false;
		
		if(d.did=="")
			var isdid = "";
		else
			var isdid = "did";
		
//		console.info(d);		
		if(d.date1<datenow) isdid = isdid+" pasted";
		
		answer1.push({title:d.title, start:d.date1, end:d.date2, allDay:allday, id:d.id,className: isdid });	
		});

	$.each(caldata2,function(i,d)
		{
		console.info("c2=",d.id,d.date1);
		
		var element = jsFind(d.id);
		
		if(d.date1.indexOf("00:00:00")>-1) var allday = true;
		else var allday = false;
		
		if(element.did=="")
			var isdid = "";
		else
			var isdid = "did";
		answer1.push({title:element.title, start:d.date1, allDay:allday, id:element.id,className: isdid });	
		});

//	console.info("answer",answer1);
//	caldata.push({title:"Привет", start:d.toString()});
//	jsFindRecur("2013-01-07");

	callback(answer1);
	},1);
} 

var caldata;

function jsShowCalendar() //отображаю календарь
{

		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

//Большой календарь ##calendar
	if(true)
		calend = $('#calendar').fullCalendar({
			editable:true,
			firstHour: firstHour,
			timeFormat: 'H:mm',
			axisFormat: 'H:mm',
			contentHeight:361,
			weekends:true,
			defaultView:'agendaWeek',
			droppable:true,
			eventResize: function(event,dayDelta,minuteDelta,revertFunc) {
        
        console.info(event.id,dayDelta,minuteDelta);

		var el = jsFind(event.id);
		
		if(el.date2<el.date1) 
			{
			var mydate1 = Date.createFromMysql( el.date1 );
			mydate1.setMinutes( mydate1.getMinutes() + 60 );
			el.date2 = mydate1.toMysqlFormat();
			console.info("Был глюк с датой", el.date2);
			}

		var mydate = Date.createFromMysql( el.date2 );
		
		mydate.setMinutes( mydate.getMinutes() + parseInt(minuteDelta,10) );
		mydate.setDate( mydate.getDate() + parseInt(dayDelta,10) );
		
		var mydate2 = mydate.toMysqlFormat();
		jsFind(event.id,{date2:mydate2});
		
		console.info("newdate = ",mydate,mydate2);
        

    		},
			drop: function(date1,allday,ev,et)
			  { 
////////////////После того как элемент дерева брошен на календарь, присваиваем дату при помощи AJAX и обновляем календарь			  			
			  $.ajaxSetup({async: false});
			 if(ev.target.attributes.myid) {
			 	 var mynode = ev.target.attributes.myid.nodeValue;
				
				var newdate = date1.toMysqlFormat();
				console.info("drop=",date1,allday,ev,et);
				jsFind(mynode,{ date1:newdate });
				jsRefreshTree();
				jsSaveData(mynode);

			     }
			 else
			 if(et.data)
 			   et.data.obj.each(function()
			     { 
			    var mynode = this.id;
			    var mydate = encodeURIComponent(date1.toMysqlFormat());
			    jsFind(mynode, { date1 : mydate });
			 	$('#calendar').fullCalendar( 'refetchEvents' ); 
			    jsRefreshTree();
			    
			    var lnk="do.php?date_to_do="+$(this).attr('id')+"&date1="+mydate+"&allday="+allday;
		 		$('#bubu').load(lnk, function () 
		 		  { 
		 		    var new_date = $('#bubu').html();
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
				right: 'month,agendaWeek,agendaDay'
			},
			firstDay: 1,

		
			eventSources: [{ events: function(start, end, callback){ jsGetEvents(start, end, callback); }, 
							 className: 'my_event' }],					
					
			eventMouseover: function (event) 
			   { 			   			   
			   },					
			eventMouseout: function (event) 
			   { 
			   },					
			eventClick: function(event) {
				console.info(event);
				jsOpenPath( event.id );
				//(,"calendar");
			},
			eventDrop: function(event, delta, minutedelta, allday) {
			   
			   var today = new Date( event.start );
			   
			   if(allday) 
			    	{
			    	today.setHours(0);
			    	today.setMinutes(0);
			    	today.setSeconds(0);
			    	}
			   
			   jsFind(event.id,{ date1 : today.toMysqlFormat() });
			   jsRefreshTree();
			   
			  
			},
			
			loading: function(bool) {
				if (bool) {
					$('#loading').show();
				}else{
					$('#loading').hide();
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
				var manager = encodeURIComponent($('#selectmanager').html()); 
				
			if(allDay==false)
				{	
				var st = start.toString();
				var en = end.toString();
				}
			else
			 	{
				var st = start.toDateString();
				var en = end.toDateString();
			 	}
				
				console.info(start.toMysqlFormat(),end.toMysqlFormat(), title);
				jsAddDo("new",33,title, start.toMysqlFormat(),end.toMysqlFormat() );

				};
				//calend.fullCalendar('unselect');
				
			}
			
			
		});
				


}


function jsSetTimeNow() //устанавливаю красную полоску - показывающую текущую дату
{
		var cur_view = calend.fullCalendar('getView').name;
		var myl,myleft,mywidth;
		
		
		if ((cur_view=='agendaWeek') || (cur_view=='agendaDay'))
			$("* #time_now_to").quickEach(function(){				
				if ($(this).children('.fc-mynow').html()==null)
				   $('<div class="fc-mynow"></div>').prependTo(this);
				   
		if (cur_view=='agendaWeek')
		           {
		           if($('.fc-today').height()) myl = $('.fc-today').offset().left;
		           else { myl=0; $('.fc-mynow').remove(); }
		           
		           
				   if($.cookie('swap_calendar')==0)
		           var swap = 1;
		           else
		           var swap = $('#left_top').width()+1;
		           
				   myleft=myl-$('.fc-agenda-axis').width()-swap+38;
				   				   
				   if($('#top').hasClass('fullscreen')) myleft=myl-2;
				   if($('#left_bottom2').hasClass('fullscreen')) myleft=myl-swap-3;
				   				   
				   mywidth=$('.fc-today').width()+1; //ширина указателя текущего времени
				   
				   }
		if (cur_view=='agendaDay')
		           {
		           myleft=$('.fc-agenda-axis').width()+7;
				   mywidth='100%';
				   }
				   
				   $(this).children('.fc-mynow').css('top',0).css('width',mywidth).css('left',myleft);
				   
				   
					var currentTime=new Date;
					var tim=currentTime.getHours() + currentTime.getMinutes()/60;
					var timenow=$(this).height()/24*(tim);
					$(this).children(".fc-mynow").css({"top": timenow});
				   
				   });

}



function jsMakeLeftRightPanelResizable() //настраиваю ресайзы и джойстик
{
  $('.resize_me,.sos').bind("touchstart", function(e)
     { 
			  e.preventDefault();
			  
			  if( e.pageY > ($(".sos").offset().top+21) ) may_vertical = false;
			  else may_vertical = true; //в каких направлениях ресайзить
			  

			  $('.bottom_left,.resize_me i').addClass('noselectable');


		$('body').bind("touchmove",function(e){
			  var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			  
			  e.pageX = touch.pageX;
			  e.pageY = touch.pageY;
			  
			  w = $(document).width();
			  neww = e.pageX-25;			  
			  if(may_vertical) //меняю только горизонтальный размер
				{
				newy = e.pageY-$("#header").height()-15;
				main_y = newy;//высота верхней панели в пикселях
				}
			   procent = parseInt( 100*(parseFloat(neww)/parseFloat(w)*100),10 )/100;
			   main_x = procent;
			   onResize();	
		       });


     });

  $("body").bind("touchend", function()
     { 
		$("body").unbind("touchmove");
	    $('.bottom_left,.resize_me i').removeClass('noselectable');

		$.cookie('main_x',main_x,{ expires: 300 });			
		$.cookie('main_y',main_y,{ expires: 300 });			

     });



if(true)
  $("*").on('mousedown.presize','.presize', function(e)
     { 
			  e.preventDefault();
			  widthpanel = $(this);
			  var oldleft = e.pageX-25;		
			  var oldwidth = widthpanel.prev(".panel").width();
			  $('.bottom_left,.resize_me i').addClass('noselectable');

		$("body").on("mousemove.presize",function(e){
			  neww = oldwidth - oldleft+e.pageX-25;			  
			  if(mymetaKey) $("#mypanel .panel").width(neww);
			  else
			  	if(widthpanel) widthpanel.prev(".panel").width(neww);
			  
			  return false;
		      });

  $("body").on("mouseup.presize", function()
     { 
		$("body").off("mousemove.presize");
		$("body").off("mouseup.presize");
	    $('#left').removeClass('noselectable');
		if(mymetaKey) $.cookie('pwidth',widthpanel.prev(".panel").width(),{ expires: 300 });			
//		$.cookie('main_y',main_y,{ expires: 300 });			
		jsMakeDrop();
		return false;
     });

		return false;
     });








if(true)
  $('.resize_me,.sos').mousedown( function(e)
     { 
			  e.preventDefault();
			  
			  if( e.pageY > ($(".sos").offset().top+21) ) may_vertical = false;
			  else may_vertical = true; //в каких направлениях ресайзить
			  

			  $('.bottom_left,.resize_me i').addClass('noselectable');
//			  $('#resize').width('100%');
//			  $('#resize').css('z-index',10000);
//			  $('#resize').css('opacity','0.1');

		$("body").mousemove(function(e){
			  w = $(document).width();
			  neww = e.pageX-25;			  
			  if(may_vertical) //меняю только горизонтальный размер
				{
				newy = e.pageY-$("#header").height()-15;
				main_y = newy;//высота верхней панели в пикселях
				}
			   procent = parseInt( 100*(parseFloat(neww)/parseFloat(w)*100),10 )/100;
			   main_x = procent;
			   onResize();	
		       });

  $("body").mouseup( function()
     { 
		$("body").unbind("mousemove");
	    $('.bottom_left,.resize_me i').removeClass('noselectable');

		$.cookie('main_x',main_x,{ expires: 300 });			
		$.cookie('main_y',main_y,{ expires: 300 });	
		jsMakeDrop();		
	 	return false;
     });


     });

	   
	
/////////////////////////////////////////

}

//переход в календаре на указанный id заметки
var anotherday = false;
function jsCalendarNode(id)
{
	var i_am_scroll;
	if(!(element = jsFind(id))) return true;
	var gotodate = element.date1;
	if ((gotodate!='0000-00-00 00:00:00') && (gotodate)) //прыгаем календарем на выбранную делом дату 
		  {
		  gotodate = Date.createFromMysql(gotodate);
		  i_am_scroll = 1;
		  anotherday = true;
		  }
	else  {
		  if(!anotherday) return false;
		  anotherday = false;
		  gotodate = new Date;
		  i_am_scroll = 0;
		  }
	
	
	
		  var d = gotodate.getDate();
		  var m = gotodate.getMonth();
		  var y = gotodate.getFullYear();

		  var h = gotodate.getHours();
		  var slot = parseInt((95/24)*h,10)-6;

		  $('#calendar').fullCalendar('gotoDate',y,m,d);		  
		  
		  $(".fc-event").removeClass('event-selected');
		  setTimeout( function() 
		  	{ 
				if((slot!=0) && (i_am_scroll == 1))
					{
					$('* #slot_scroll').quickEach(function() 
					  { 
					  	if(slot<0) return true;
					  	slot = $(this).find('.fc-slot'+slot);
					  	if(slot.offset())
					  	  {
					  	    tn = $("#time_now_to").offset().top;
							sc2 = slot.offset().top;
							myheight = $(this).height();
							
							sc3 = $(this).offset().top;
							sc4 = $(this).scrollTop();
							event_height = $(".fc-event[myid="+id+"]").height();
							var scr=sc4-(sc3-sc2)-event_height;
							
							more_down=0;
							
							scr = sc2-tn+100-more_down;
							
							$(this).stop().animate({ 'scrollTop': scr },800); 
						  }
					  });
					}
				else
					i_am_scroll = 1;

		  	setTimeout(function(){ $(".fc-event[myid="+id+"]").removeClass('event-selected').addClass('event-selected'); },20);
		  	},100 );
		  
}

var openredactor;
function jsSelectNode(id,nohash,iamfrom) //открыть заметку во всех панелях
{
//	i_am_from - кто вызвал: redactor, calendar, tree, diary
	$("#top_panel #node_"+id).addClass("selected");
//	console.info(id);
	clearTimeout(openredactor);
	openredactor = setTimeout(function()
		{
	 	jsRedactorOpen([id],iamfrom); 
	 	jsShowAllComments(id);
	 	jsCalendarNode(id);
	 	},300 );

}

function jsRedactorOpen(ids,iamfrom) //открыть редактор / ids=[1,2,3] номера заметок
{
var text = "", mytext="",path1;
var element1,myelement;
$.each(ids,function(ii,id1) 
 {  
 //	console.info("redactor_from",iamfrom);
   element1 = jsFind(id1);
   if(!element1) 
     {
     return false;
     }
 
   			var ans = jsFindPath(id1);
		  	if(ans)
			  	path1 = jsTextPath( ans );
			else
				path1 = "";
	var count = "<div class='divider_count'>"+(ii+1)+"</div>";

   mytext = element1.text;
   if(mytext=="") mytext = "<p>&nbsp;</p>";
   
   var divider = "<div class='divider_red' contenteditable='false' md5='"+$.md5( mytext ) +"' myid='"+id1+"'>"+count+path1+"<h6>"+""+element1.title+"</h6></div>";
   
   text = text + divider+"<div class='edit_text'>"+mytext+"</div>";
   
   if(ids.length==1) 
   		{
   		text = element1.text;
   		$('.redactor_editor').attr("md5",$.md5( mytext ));
   		$('.redactor_editor').attr("myid",id1);
   		}
   
   if(ii==0) myelement = element1;
 });
 
 
//    $('#redactor').attr('notes',id);
   if(text) $('#redactor').setCode( text );
   else $('#redactor').setCode( '' );
   
   clearTimeout(scrolltimer);

   if(element1)
     $(".bottom_right>.redactor_box").scrollTop(element1.s); //вспоминаю старый скроллинг
   
   if(ids.length == 1) $(".divider_red").hide();

      
   if(ids.length>1) mytitle = ids.length + "шт из ветки " + $("#mypanel .selected").find(".n_title").html(); 
   else mytitle = $("#mypanel .selected").find(".n_title").html();

if((mytitle) && (iamfrom!="fav_red") && (ids.length==1)) //устанавливаю заголовок в закладку редактора
		{
		jsAddFavRed(mytitle,ids[0]);
		}
		
//раскрашиваю wiki ссылки
	jsParseWikiLinks(ids[0]);    
}

var removeraretabs;
function jsAddFavRed(mytitle,id) //добавляет закладку под редактор
{
  var myel = jsFind(id);
  if(!myel) return true;
  mytitle = strip_tags( myel.title );
  var elel = $("#fav_red li[myid='"+id+"']");
  if(elel.length>0)
  	{
	$("#fav_red ul li:first").before(  elel );
  	return true;
  	}

  var shorttitle = jsShortText( mytitle , 15 );

  $("<li fix=0 myid='"+id+"' title='"+mytitle+"'>"+shorttitle+"</li>").insertBefore("#fav_red ul li:first");
  jsCalcTabs();
}

function savetext(dont) //сохранение текста в переменной jsSendText - отправляется если текст изменился
{
note_saved = false;

clearTimeout(my_autosave);

		var html = myr.getCode();
		jsHighlightText();
		var text = html,textlength;	
		
		$("<div>"+html+"</div>").find(".divider_red").quickEach(function(iii,el){
			text = "";
			var id_node = $(el).attr('myid');
	    	var md5text = $(".divider_red[myid='"+id_node+"']").attr('md5');
	    	
	    	text = $("<div>"+html+"</div>").find(".divider_red[myid='"+id_node+"']").next(".edit_text:first").html();
	    		
//		    	console.info("?need-save-text",id_node,md5text,el,text);

	    	if(iii==0) 
	    		{
	    		textlength = jsMakeIconText(id_node,text);
		    	$("#node_"+id_node).find(".node_img").attr("class", "node_img "+textlength.myclass );
		    	if(textlength.mylength>0) 
		    		{
		    		$("#node_"+id_node).find(".folder_closed").addClass("full");
		    		}
		    	else
		    		{
		    		$("#node_"+id_node).find(".folder_closed").removeClass("full");
		    		}
		    	}
		    	
//		    console.info("md5",iii,md5text,$.md5(text),text);
	    		
	    	if( md5text!=$.md5(text) ) //если текст не изменился, то ничего не делаю
	    		{
	    		$(".divider_red[myid='"+id_node+"']").attr( 'md5',$.md5(text) );
	    		$(".divider_red[myid='"+id_node+"']").attr( 'md5time',jsNow() );
		    	console.info("save-text",id_node,md5text,el,text);
	    		jsSendText(id_node,text,dont);
//				console.info("hrum = ",id_node,text,dont);
	    		$("#fav_red li[myid="+id_node+"]").attr("fix","1");
	    		}
	    }); //end of each .divider_red
	    
	  if($("<div>"+html+"</div>").find(".divider_red").length==0) //если текст редактируемый один
   		{
			var id_node = $('.redactor_editor').attr("myid");
	    	var md5text = $('.redactor_editor').attr("md5");
	    	
	    	text = html;
	    		
//		    	console.info("?need-save-text",id_node,md5text,el,text);

	    	if(id_node) 
	    		{
	    		textlength = jsMakeIconText(id_node,text);
		    	$("#node_"+id_node).find(".node_img").attr("class", "node_img "+textlength.myclass );
		    	if(textlength.mylength>0) 
		    		{
		    		$("#node_"+id_node).find(".folder_closed").addClass("full");
		    		}
		    	else
		    		{
		    		$("#node_"+id_node).find(".folder_closed").removeClass("full");
		    		}
		    	}
		    	
//		    console.info("md5",iii,md5text,$.md5(text),text);
	    		
	    	if( md5text!=$.md5(text) ) //если текст не изменился, то ничего не делаю
	    		{
	    		$('.redactor_editor').attr( 'md5',$.md5(text) );
	    		$('.redactor_editor').attr( 'md5time', jsNow() );
//		    	console.info("save-text",id_node,md5text,el,text);
	    		jsSendText(id_node,text,dont);
//				console.info("hrum = ",id_node,text,dont);
	    		$("#fav_red li[myid="+id_node+"]").attr("fix","1");
	    		}
   		
   		
   		}


}

function jsMakeIconText(id,text) //выбирает кол-во полосок в иконке при кол-ве текста
{
		var mylength = strip_tags(text).length;
		var i_size = parseInt( mylength/100,10 );
		if(i_size>6) i_size=6;
		if(mylength<100) i_size = "1";				
		if(mylength==0) { i_size = "clean"; }
		
		var mylength1 = parseInt(mylength/30,10)/10;
		if(mylength>0 && mylength1==0) mylength1 = 0.1;
		if(mylength1>1) mylength1 = 0.7;

		
return { myclass:("note-"+i_size), mylength:mylength1 };
}


function jsMakeWiki() //находит всё что в квадратных скобках и заменяет на тег <wiki>
{
var txt = myr.getCode();
var wiki_words = txt.match(/\[\[(.*?)\]\]/ig);
if(!wiki_words) 
	{
	return true; //если нет символов WIKI
	}
else
	{
	aa = rangy.saveSelection();
	txt = myr.getCode();
	wiki_words = txt.match(/\[\[(.*?)\]\]/ig);
	}

if(!wiki_words) 
	{
	return true; //если нет символов WIKI
	}

newtxt = txt;
var need_refresh=false;
$.each(wiki_words, function(i,myword){
	if(strip_tags(myword).length>4) 
		{
			mynewword = myword.replace("[[","").replace("]]","");
			console.info(i,myword, mynewword);
			newtxt = newtxt.replace(myword,"[&nbsp;<span class='wiki' title='Кликните, чтобы создать определение Wiki'>"+mynewword+"</span> ]");
			need_refresh = true;
		}
	else
		{
		rangy.removeMarkers(aa);
		}
	});
if(need_refresh) 
	{
//    console.info("saved_1",savedRange,savedRange2);
	myr.setCode(newtxt);
	note_saved = false;
//    console.info("saved_2",savedRange,savedRange2);
    rangy.restoreSelection(aa);
    savetext(1);
    jsParseWikiLinks($(".redactor_").attr("myid"));
//    console.info("saved_3",savedRange,savedRange2);
	}
}

//сохранение текста из редактора
//id_node - номер id 
//text - html текст
//note_saved = false - сохраняет только при этом условии
function jsSendText(id_node,text,dont)
{
	clearTimeout(my_autosave);  
	jsMakeWiki();
	if(note_saved==true) { return false; } //если сохранения не требуется
		
    	if($(".redactor_editor").find("img:first").length)  //если есть картинка, устанавливаю её иконкой
    		{
    		imgsrc = $(".redactor_editor").find("img:first").attr("src");
    		$("#node_"+id_node+" .node_img").css("background-image", "url("+imgsrc+")");
    		icon = imgsrc;
	    	}
	    else
	    	{
	    	icon = "";
	    	}

		var tt = jsFind(id_node, { text : text, icon : icon }); //сохраняю текст в главном массиве
		if(tt) if(tt.title.indexOf(" - ")!=-1) jsGetAllMyNotes(); //обновляю массив для календаря дневника, если это дневник
    	note_saved=true;
}

function jsTitle(title,tim) //вывод подсказок в левый нижний угол
{
var mytim = tim;
if (!tim) mytim = 5000;

 $('.f_text').html(title).fadeIn('slow');
 clearTimeout(t2);
 if(mytim<60000) t2 = setTimeout(function() { $('.f_text').fadeOut('slow').html('');} ,mytim);

}

//меняет элементы на странице местами
jQuery.fn.swapWith = function(to) {
	console.info("swap");
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}; //подсчёт кол-ва элементов в объектах

Date.prototype.jsDateTitleFull = function(shortit) //вывожу полную дату с днём недели
{
if(!shortit) 
	{
	var months = [" января", " февраля", " марта", " апреля", " мая", " июня", " июля", " августа", " сентября", " октября", " ноября", " декабря"];
	var days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
	}
else 
	{
	var months = [" янв", " фев", " мар", " апр", " мая", " июня", " июля", " авг", " сент", " окт", " нояб", " дек"];
	var days = ["вc", "пн", "вт", "ср", "чт", "пт", "сб"];
	}
var n = this.getDate() + months[this.getMonth()] + " " + this.getFullYear() + ", " + days[this.getDay()] + " — " + (this.getHours()<10?"0":"") +this.getHours()+":"+(this.getMinutes()<10?"0":"")+this.getMinutes();
return n;
}

Date.prototype.jsDateTitle = function() //вывожу дату на русском языке для правого нижнего угла
{
var months = [" января", " февраля", " марта", " апреля", " мая", " июня", " июля", " августа", " сентября", " октября", " ноября", " декабря"];
var days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "Суббота"];
var n = this.getDate() + months[this.getMonth()] + ", " + days[this.getDay()];
return n;
}

function jsSetDiaryDate(skipdays) //устанавливаю дату и номер недели в правый нижний угол
{
today = new Date( jsNow()+skipdays*24*60*60*1000 ); 

$(".todaydate").html( today.jsDateTitle() ); 
$(".todayweek").html( "(" + today.getWeek() + " неделя)");
}


function jsRerememberPomidor() //вспоминаю установки помидорок, нужно после перезагрузки
{
	var pomidor_id = localStorage.getItem("pomidor_id");
	var pomidor_endtime = localStorage.getItem("pomidor_endtime");
	var pomidor_my_min = localStorage.getItem("pomidor_my_min");

	if(pomidor_id && pomidor_endtime && pomidor_my_min )
		{
			$("#pomidor"+pomidor_id).addClass("pomidor_now");
			my_min = pomidor_my_min;
			endtime = pomidor_endtime;
			var now = new Date().getTime();
			if(endtime<now) goPomidor();
		}
}

function goPomidor()  //запуск помидорки, если установленно время финиша
{
      var now = new Date().getTime();
      finishtime = parseInt(endtime,10)+(-my_min*60*1000);
      resttime = (finishtime-now)/1000;

	  if ((!resttime) || (resttime<0)) //если время уже давно вышло, сбрасываю
	  	{ 
	  	$("#pomidoro_icon i").removeClass("pomidor_now");
	  	$("#pomidoro_icon").hide();
		 console.info("resttime<","скрываю");

	  	localStorage.setItem("pomidor_id","0"); 
	    localStorage.setItem("pomidor_endtime","0");
	  	jsSetTitleBack();
	  	return true; 
	  	}


  	  $("#pomidor").css("opacity","1");
  	  
  	  var snd3 = new Audio("img/tick2.mp3"); // buffers automatically when created
  	  snd3.play();
  	  
  	  var snd = new Audio("img/bell.wav"); // buffers automatically when created

	  //Сохраняю параметры, чтобы при перезагрузки сайта таймер тикал дальше
	  if($(".pomidor_now").attr('id')) 
	    {
	    id = parseInt( $(".pomidor_now").attr('id').replace("pomidor",""),10 );
	    localStorage.setItem("pomidor_id",id);
	    }
	  else
	    {
	    localStorage.setItem("pomidor_endtime","0");
	    }
	  localStorage.setItem("pomidor_endtime",endtime);
	  localStorage.setItem("pomidor_my_min",my_min);
	  
	  
clearInterval(mypomidor);
mypomidor =
   setInterval(function(){
      var now = new Date().getTime();
      finishtime = parseInt(endtime,10)+(-my_min*60*1000);
      resttime = (finishtime-now)/1000;
	  document.title=RestMin(resttime);
      
	  $("#pomidor_scale").css("margin-left",parseInt(-resttime*513/80/60,10));

	  if (parseInt(resttime)==15) snd3.play();

	  if (resttime<=0) 
	  	 { 
		 jsSetTitleBack();
//		 $("#pomidoro_icon").hide();
		 console.info("<=","скрываю");
	     $("#pomidor_scale").css("margin-left",0); 

	     var my_min3 = -my_min;
		 var my_min2 = my_min3 - parseInt(my_min3/10,10)*10;
		 var word_end,word_end2;
	     if((my_min2==2) || (my_min2==3) || (my_min2==4)) { word_end = 'ы'; word_end2 = 'у'; }
	     else { word_end = ''; word_end2 = 'у'; }
	     if((my_min2==1)) { word_end = 'а'; word_end2 = 'ё'; }
	     
		 snd.play();
	     if($("#pomidoro_icon i").hasClass("pomidor_now")) { //если это помидорка
		        var id = parseInt( $(".pomidor_now").attr('id').replace("pomidor",""),10 );
		        if (id==8) id=0;
		        id = id+1;
		        text = $("#pomidor"+id).attr("text");
		        
		        joke_id = parseInt(Math.random()*pomidor_text.length,10); //выбираю случайную шутку из массива
		        
		        if($("#pomidor"+id).attr("time")!="-25") 
		           { 
		           joke = pomidor_text[joke_id]+".\n\n";  //тут нужно добавить помидорку в дневник
		           }
		        else joke="";

		     if (confirm(joke +text+ "\n\nЗапустить таймер Pomodoro?")) 
		        {		        
			    $("#pomidoro_icon i").removeClass("pomidor_now");
		        $("#pomidor"+id).addClass("pomidor_now").click();
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
	     } //resttime<0
	   else
	     {
	     }
   	  
      },1000)

}


function jsShowNews(type) //отображение всех комментариев
{
$("#tree_news").html("");
if(type==0)
	{
	var source = $("#comment_template").html();
	template = Handlebars.compile(source);
	
	   var data = my_all_comments.filter(function(el) //поиск всех дел написанных БОЛЬШИМИ буквами и не начинающиеся с цифры
		    { 
		    return el.del==0;
		    } );

		function compare(a,b) {
		  if (parseFloat(a.add_time) < parseFloat(b.add_time))
		     return 1;
		  if (parseFloat(a.add_time) > parseFloat(b.add_time))
		    return -1;
		  return 0;
		}

		chat = data.sort(compare); //сортирую табы по полю tab

	var i;
	var txt="";
	var myhtml = "<h3>Новые комментарии:</h3>";
	$.each(chat, function(i,d)
		{
		var frend = jsFrendById(d.user_id);
		d.foto = frend.foto;
		d.name = frend.fio;
		if(jsFind(d.tree_id)) d.tree_title = "<b>["+jsShortText( jsFind(d.tree_id).title, 50 )+"]</b>";
		if(d.add_time=="0")  d.add_time_txt = "";
		else
			{
			var add_time = new Date( parseInt(d.add_time,10) );
			d.add_time_txt = add_time.jsDateTitleFull("need_short_format");
			}
		
		myhtml += template(d);
		if(i>100) return true;
		});
	
	$("#tree_news").append(myhtml);
	}
}




function RestMin(restsec) //сколько осталось минут
{
var dots=":",my_nul;

var min = parseInt(restsec/60,10);

var sec = parseInt(restsec-min*60,10);

	     if (sec<'10') my_nul = '0';
	     else my_nul = '';


var answer = min + dots + my_nul + sec + " — осталось";

return answer;
}


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





