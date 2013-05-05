<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html lang="ru" class="" manifest="">
<!-- 1browser_manifest -->

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">

<head>
<title>4tree.ru — мои дела</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>

<script src="js/ztx-ydn.db-dev-0.6.2.js"></script>
<script src="js/jquery-1.9.1.min.js"></script>
</head>


<body>
<h1>Тестирование базы данных YDN.</h1>

<div id="output"></div>

<script>
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

function randName()
{
return "John"+Math.random()*100;
}

function randEmail()
{
return Math.random()*300+"@4tree.ru";
}


///генерируем данные
genAuthors = function(n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    out[i] = {
      first: randName(),
      last: randName(),
      born: +(new Date(1900+Math.random()*70, 12*Math.random(), 30*Math.random())),
      email: randEmail(),
      company: "Tea",
      hobby: {name:"Box", age: "48"}
    };
  }
  return out;
};



var DB_4TREE = function(db_name_global,need_log){
	 if ( (typeof arguments.callee.instance=='undefined') || (true)) //true - отключает singleton
	 {
	  arguments.callee.instance = new function()
	  	{
	  	var db;
	  	var last_log_time=jsNow();
	  	var log_i=1;
  		var this_db = this;
  		var need_did = false;
  		var mytimer;
	  	
	  	this.log = function(x1,x2,x3,x4,x5) { //логирование любых 5 параметров в консоль
		  	var time_dif = jsNow()-last_log_time;
		  	last_log_time=jsNow();
	  		if(need_log) { 
	  			console.info(log_i+". log("+time_dif+"ms): ",x1?x1:" ",x2?x2:" ",x3?x3:" ",x4?x4:" ",x5?x5:" "); 
	  			log_i++;
	  		}
	  	}
	  	
	  	this.js_setNeedDid = function(set_need_did) //если true, то показывать выполненные дела
	  		{
	  		need_did = set_need_did;
	  		}
	  	
	  	this.js_InitDB = function() //инициализация базы данных
	  		{
		  	//схема структуры базы данных
		  	if(db_name_global == "4tree_db")
		  		{
				  	var author_store_schema = { //схема базы данных
				  	  name: '4tree_db',
				  	  keyPath: 'id', // optional, 
				  	  autoIncrement: false, // optional. 
				  	  indexes: [
				  	    {
				  	      keyPath: 'date1',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'del',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'did',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'fav',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'lsync',
				  	    }, {
				  	      keyPath: 'parent_id',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'position',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'remind',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'time',
				  	    }, {
				  	      keyPath: 'title',
				  	      type:'TEXT'
				  	    }, {
				  	      keyPath: 'user_id',
				  	      type:'TEXT'
				  	    }
				  	  ] // индексы в базе данных
				  	};
			  	} else {
			  		var author_store_schema = {};
			  	}
		  	
		  	schema = {
		  	  stores: [author_store_schema]
		  	}; 
		  	
		  	db = new ydn.db.Storage('_all_tree', schema);
		  	this_db.log("(js_InitDB) База данных инициализированна");
		  	} //js_InitDB
		  	
		this.js_InitDB(); //инициализирую базу данных  	
	  	
	  	this.js_LoadAllDataFromServer = function() //загружаю данные с сервера в внутреннюю базу данных
	  		{
	  			setTimeout(function(){ this_db.log("Тип базы данных: "+db.getType());},500 );
		  		this_db.log("Начинаю загрузку с сервера");

		  		db.clear("4tree_db").done(function(){
		  		$.getJSON(lnk,function(data){
		  		   this_db.log("Загружено с сервера ",Object.size(data.all_data),"элементов");
		  		   var my_all_data = $.map(data.all_data, function (value, key) { 
		  		   value["new"] = "";
		  		   return value; });
		  			
		  			db.put(db_name_global, my_all_data).then(
		  			  function(ids) {
		  			    this_db.log(ids.length + ' записей записано в базу');
		  		
		  			    db.count('4tree_db').done(function(x) {
		  		    		this_db.log(x," посчитано записей в базе");
		  		    		});
		  		    	
		  		    	//проставляю tmp_cnt = кол-ву детей в базе
		  		    	this_db.js_SetChildrensCount2().done(function(x){this_db.log("Кол-во детей подсчитано");});
		  		    		
		  			  }, function(e) {
		  			    throw e;
		  			  });
		  			  
		  			});
		  			}); //clear(4tree_db)

	  		} //js_loadAllDataFromServer
	  		
	  	this.js_Find = function(id,fields)
	  		{
		  		var d=$.Deferred();
		  		db.get("4tree_db",id.toString()).done(function(record) {
		  		     //сохраняю значения, если это нужно
		  		     if(record && fields) { //если нужно присваивать значения
		  		     	var is_changed = false;
		  		
		  		     	//поле, где записаны все изменённые не синхронизированные поля:
		  		     	var changed_fields = record["new"]; 
		  		     	$.each(fields, function(namefield,newvalue) 
		  		     		{ 		
		  		     		if(record[namefield]!=newvalue) 
		  		     			{
		  		     			is_changed = true;
		  		     			record[namefield] = newvalue;
		  		     			console.info("need_save:",namefield," = ",newvalue);
		  		   			  if((changed_fields.indexOf(namefield+",")==-1) && (changed_fields.indexOf("tmp_")==-1))
		  		   			  		{ 
		  		   			  		changed_fields = changed_fields + namefield + ","; 
		  		   			  		}
		  		     			}
		  		     		});
		  		     	if(is_changed) {
		  		     	  record["new"] = changed_fields;
		  		     	  db.put("4tree_db",record);
		  		     	} 

		  		     	//если не меняли время вручную и это не временное поле
		  		     	if( (changed_fields.indexOf("time,")==-1) && (changed_fields.indexOf("tmp_")==-1) ) 
		  		     	    {
		  		     	    record.time = parseInt(jsNow(),10); //ставлю время изменения (для синхронизации)
		  		     	    }
		  		     	else
		  		     	    {
		  		     	    record["new"] = "";
		  		     	    }
		  		
		  		     } // (record && fields)
		  		     
		  		     d.resolve(record);
		  		     });
		  		return d.promise();
	  		} //js_Find
	  		
	  	this.js_FindByParent = function(parent_id)
	  		{
	  		var d=$.Deferred();
	  		var iter = ydn.db.IndexValueCursors.where('4tree_db', 'parent_id', '=',parent_id.toString());
	  		db.values(iter).done(function(records) {
	  					 records = this_db.js_RemoveDid(records);
	  		   	  	     d.resolve(records);
	  		   	  	     });
	  		return d.promise();
	  		} //js_FindByParent
	  	
	  	this.js_RemoveDid = function(records) //удаляет выполненные дела + удалённые
	  		{
  			records = records.filter(function(el,i)
  				{
  				if(el.del!="0") return false;
  				if(need_did==true || el.did==0) return true;
  				});
	  		return records;
	  		}
	  		
	  	this.js_SetChildrensCount = function()
	  		{
	  		var d=$.Deferred();
	  		var iter = ydn.db.IndexValueCursors.where('4tree_db', 'del', '=','0');
	  		var unique = true;
	  		var hobby_key_iter = new ydn.db.IndexValueCursors('4tree_db', 'parent_id', null, false, unique);
	  		db.values(hobby_key_iter).done(function(records) {
		  		this_db.log("Unic parent_id",records);
		  		$.each(records,function(i,el) {
		  			this_db.js_FindByParent(el.parent_id).done(function(childrens)
		  				{
			  			var childs_cnt = Object.size(childrens);
			  			this_db.js_Find(el.parent_id,{tmp_childs:childs_cnt}).done(function(x)
			  				{
			  				clearTimeout(mytimer);
			  				mytimer = setTimeout(function(){this_db.log("end");},50);
			  				});
		  				});
		  			});
		  		});

	  		db.values(iter).done(function(records) {
	  					 records = this_db.js_RemoveDid(records);
	  		   	  	     d.resolve(records);
	  		   	  	     });
	  		return d.promise();
	  		} //js_SetChildrensCount


	  	this.js_SetChildrensCount3 = function()
	  		{
	  		var d=$.Deferred();
	  		var iter = ydn.db.Cursors.where('4tree_db', 'del', '=','0');
	  		var unique = false;
	  		var hobby_key_iter = new ydn.db.ValueCursors('4tree_db');
	  		db.values(hobby_key_iter,1000000000).done(function(records) {
	  			console.info("r",records);
	  			d.resolve();
	  			});
	  		return d.promise();
	  		}

	  	this.js_SetChildrensCount2 = function()
	  		{
	  		var d=$.Deferred();
	  		var iter = ydn.db.IndexValueCursors.where('4tree_db', 'del', '=','0');
	  		var unique = false;
	  		var hobby_key_iter = new ydn.db.IndexValueCursors('4tree_db', 'parent_id', null, false, unique);
	  		db.values(hobby_key_iter,1000000000).done(function(records) {
		  		var old_id,count_id=0;
		  		records = this_db.js_RemoveDid(records);
		  		$.each(records,function(i,el){
		  			if(old_id==el.parent_id) {count_id++; }
		  			else  //значение подсчитано
		  				{ 
		  				//меняю значение
		  				if(old_id) this_db.js_Find(old_id,{tmp_cnt:count_id}).done(function(x) 
		  					{
			  				clearTimeout(mytimer);
			  				mytimer = setTimeout(function()
			  					{ 
			  					d.resolve(records);
			  					this_db.log("did"); 
			  					},50);
		  					});
		  				count_id=0;
		  				}
		  			old_id=el.parent_id;
			  		});
		  		});
	  		return d.promise();
	  		} //js_SetChildrensCount

	  		
	  	}
	 } //if typeof
	 
	 return arguments.callee.instance;


}


mydb = new DB_4TREE("4tree_db","need_log"); 
//mydb.js_LoadAllDataFromServer();

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}; //подсчёт кол-ва элементов в объектах



// db = new ydn.db.Storage("_all_tree");
 
 //схема структуры базы данных
 var author_store_schema = {
   name: '4tree_db',
   keyPath: 'id', // optional, 
   autoIncrement: false, // optional. 
   indexes: [
     {
       keyPath: 'date1',
     }, {
       keyPath: 'del'
     }, {
       keyPath: 'did',
     }, {
       keyPath: 'fav',
     }, {
       keyPath: 'lsync',
     }, {
       keyPath: 'parent_id',
     }, {
       keyPath: 'position',
     }, {
       keyPath: 'remind',
     }, {
       keyPath: 'time',
     }, {
       keyPath: 'title',
       type:'TEXT'
     }, {
       keyPath: 'user_id',
     }
   ] // optional, list of index schema as array.
 };
 
 schema = {
   stores: [author_store_schema]
 }; 

 db = new ydn.db.Storage('_all_tree', schema);

 var lnk = "do.php?get_all_data2="+jsNow()+"&sync_id=test"; 

 var authors = genAuthors(3);

if(true)	
 $.getJSON(lnk,function(data){
// 	console.info(data.all_data);
	my_all_data = $.map(data.all_data, function (value, key) { 
	value["new"] = "";
	return value; });
 	
	$("#output").append("Запрос выполнен "+my_all_data.length);
 	
 	db.put('4tree_db', my_all_data).then(
 	  function(ids) {
 	    console.log(ids.length + ' authors put.');

		$("#output").append("<br>5. Number of elements = ",ids.length);
 	    
 	    db.count('4tree_db').done(function(x) {
	 		console.info("5. Number of elements = ",x);
	 		$("#output").append('<br>6. Number of authors: ' + x);
	 		});


	 		if(true)
	 			jsFindByParent(599).done(function(elements){
	 				var len = elements.length;
	 				for(var i=0; i<len;i++)
	 					{
	 					$("#output").append("<br>"+i+". "+elements[i].id+" : "+elements[i].title);
	 					}
	 			});

 	    
 	    
 	  }, function(e) {
 	    throw e;
 	  });
 	  
 	});
 
 
function jsFind2(id,fields) //считывание и запись данных в базу
{
 var d=$.Deferred();
 db.get("4tree_db",id.toString()).done(function(record) {
	  //сохраняю значения, если это нужно
	  if(record && fields) { //если нужно присваивать значения
	  	var is_changed = false;

	  	//поле, где записаны все изменённые не синхронизированные поля:
	  	var changed_fields = record["new"]; 
	  	$.each(fields, function(namefield,newvalue) 
	  		{ 		
	  		if(record[namefield]!=newvalue) 
	  			{
	  			is_changed = true;
	  			record[namefield] = newvalue;
	  			console.info("need_save:",namefield," = ",newvalue);
				if(changed_fields.indexOf(namefield+",")==-1) changed_fields = changed_fields + namefield + ","; 
	  			}
	  		});
	  	if(is_changed) {
	  	  record["new"] = changed_fields;
	  	  db.put("4tree_db",record);
	  	} 

	  }
	  
	  d.resolve(record);
	  });
 return d.promise();
}
 
function jsFindByParent(id)
{
 var d=$.Deferred();
 var iter = ydn.db.IndexValueCursors.where('4tree_db', 'parent_id', '=',id.toString());
 db.values(iter).done(function(records) {
		  	     d.resolve(records);
		  	     });
 return d.promise();
}

function jsCountByParent(id)
{
 var d=$.Deferred();
 var iter = ydn.db.IndexValueCursors.where('4tree_db', 'parent_id', '=',id.toString());
// var iter = new ydn.db.ValueCursors("4tree_db");
// iter = iter.restrict("did","1");
 db.values(iter).then(function(records) {
		  	     d.resolve(records);
		  	     });
 return d.promise();
}
 
 
 
if(false) 
{ 
 db = new ydn.db.Storage("_all_tree");

 //сохранение и воспроизведение записей
 db.put("store-name",{id:599,title:"Жопа",text:"Are you ready?"},"id1");
 db.get("store-name","id1").always(function(record){
	 							 console.info("first = ",record);
	 							 $("#output").append("1. Сохранил store-name: "+record.title);
								 });
								 
 //сохранение данных во внешнем ключе
 db.put('store1', {test: 'Hello World!',title:'oops :)'}, 123);
 req = db.get('store1', 123);
 req.done(function(record) {
 	 console.log("second = ",record);
	 $("#output").append("<br>2. Сохранил store-name: "+record.title);
 	 });
 req.fail(function(e) {
 	 throw e;
 	 });					
 	 
 //сохранение данных в внутреннем ключе		 
 record = {id: 'abc', message: 'Testing in line key'};
 req = db.put({name: 'store2', keyPath: 'id'}, record);
 req.done(function(key) {
   console.info("third key = ",key);
   $("#output").append("<br>3. Сохранил inline-key: "+key);
 });
 req.fail(function(e) {
   throw e;
 });

 //поиск данных по ключу
 db.put('store2', [{id: 'a', message: 'a record'}, {id: 'b', message: 'b record'}]);
 db.values('store2', null, 2000).done(function(records) {
    console.info("4. list-records",records);
 });
 
 db.keys('store2', null, 10).done(function(records) {
  console.info("4. only-keys = ",records);
 });

 db.get("store2","abc").done(function(records) {
  console.info("4. current reccord for a = ",records);
 });
 
 //схема структуры базы данных
 var author_store_schema = {
   name: 'author',
   keyPath: 'email', // optional, 
   autoIncrement: false, // optional. 
   indexes: [
     {
       name: 'born', // optional
       keyPath: 'born',
       unique: false, // optional, default to false
       multiEntry: false // optional, default to false
     }, {
       keyPath: 'company'
     }, {
       keyPath: 'hobby',
       multiEntry: true
     }
   ] // optional, list of index schema as array.
 };
 
 schema = {
   stores: [author_store_schema]
 }; 


//заполняю базу данных клиентами
db = new ydn.db.Storage('test-3', schema);
var authors = genAuthors(3);
db.put('author', authors).then(
  function(ids) {
    console.log(ids.length + ' authors put.');
  }, function(e) {
    throw e;
  }
);

//считаю кол-во элементов в базе (медленная операция, нужно кешировать)
db.count('author').done(function(x) {
  console.info("5. Number of authors = ",x);
  $("#output").append('<br>4. Number of authors: ' + x);
});

//сортировка по дате рождения
var reverse = false; // sorted by ascending of date
var limit = 10;
  db.values(new ydn.db.Cursors('author', 'born', null, reverse), limit).done(function(records) {
  console.info("5. Sorted = ",records);
});

//сортировка по email
var key_range = null;
db.keys('author', key_range, 10).done(function(records) {
  console.log(records);
});

//вычисление уникальных значений company в базе (Cursors)
var unique = true;
var hobby_key_iter = new ydn.db.Cursors('author', 'company', null, false, unique);
db.keys(hobby_key_iter).done(function(hobby) {
  console.log(hobby);
});
 	
//вычисление уникальных значений company в базе (IndexValueCursors)
var hobby_iter = new ydn.db.IndexValueCursors('author', 'company', null, false, unique);
db.keys(hobby_iter).done(function(hobby) {
  console.log(hobby);
}); 	  

//сравнение вышеуказанных функций
var hobby_key_iter = new ydn.db.Cursors('author', 'company', null, false, unique);
var hobby_iter = new ydn.db.IndexValueCursors('author', 'company', null, false, unique);

db.values(hobby_key_iter).done(function(refs) {
  console.log(refs); //возвращает ключи
});
db.values(hobby_iter).done(function(refs) {
  console.log(refs); //возвращает значения
});

//фильтр
var lower = + new Date(1942, 1, 1); // 1942 February 1
var upper = + new Date(1942, 2, 1); // 1942 March 1
var iter = ydn.db.IndexValueCursors.where('author', 'born', '>=', lower, '<', upper);
db.values(iter).done(function(records) {
  console.log(records);
  records.map(function(x) {
    console.log(x.first + ' ' + x.last + ' ' + new Date(x.born));
  });
});

//фильтр2
var iter = ydn.db.IndexValueCursors.where('author', 'company', '=',"Tea");
db.values(iter).done(function(records) {
  console.log(records);
  records.map(function(x) {
    console.log(x.first + ' ' + x.last + ' ' + new Date(x.born));
  });
});

//фильр + paging страница №1
var iter = new ydn.db.IndexValueCursors('author', 'company', ydn.db.KeyRange.only('Home'));
var limit = 10;
db.values(iter, limit).then(function(records) {
  console.log(records);
  console.log('From ' + records[0].email + ' to ' + records[records.length - 1].email);
}, function(e) {
  throw e;
});

//фильтр + страница №2
db.values(iter, limit).then(function(records) {
  console.log(records);
  console.log('From ' + records[0].email + ' to ' + records[records.length - 1].email);
}, function(e) {
  throw e;
});

//map - выводит всех авторов емайл которых начинается с 0.95
var iter = new ydn.db.ValueCursors('author', ydn.db.KeyRange.starts('0.95'));
var names = [];
db.map(iter, function(value) {
  names.push(value.first + ' ' + value.last + ' <' + value.email + '>');
}).then(function() {
  console.log(names); 
}, function(e) {
  throw e;
});

//агрегация Reduce
var iter = new ydn.db.Cursors('author', 'born');
var iter = new ydn.db.ValueCursors('author', ydn.db.KeyRange.starts('0.95'));

var initial = 0;
var now = +new Date();
db.reduce(iter, function(previous, current, index) {
  var age_ms = now - current;  
  var age = age_ms / (1000 * 60 * 60 * 24 * 365);
  return (age + previous * index) / (index + 1);
}, initial).then(function(result) {
  console.log('Average age: ' + result); 
}, function(e) {
  throw e;
});

//updating
console.info("Updating...");
var iter = new ydn.db.ValueCursors('author', ydn.db.KeyRange.starts('0.95'));
var mode = 'readwrite';
var updated = 0;
var deleted = 0;
db.open(iter, function(cursor) {
  var author = cursor.value();
  if (author.company == 'Home') {
    cursor.clear().then(function(e) {
      deleted++;
    }, function(e) {
      throw e;
    });
  } else if (author.company == 'Work') {
    author.company = 'Coffee';
    cursor.update(author).then(function(e) {
      console.info("updated",e);
      updated++;
    }, function(e) {
      throw e;
    }); 
  }
}, mode).then(function() {
  console.log(updated + ' records updated, ' + deleted + ' deleted.'); 
}, function(e) {
  throw e;
});

}



 	  
</script>


</body>





















