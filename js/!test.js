	var new_id8,id_of_new;

function jsTestIt(){
	$("#qunit-tests").html("");
	
	if( window.location.hash.indexOf("long") !=-1 )	var longtest = true;
	else var longtest = false;
	
	if(longtest)
	test("Открытие рекурсивом большой папки",function(){
		jsOpenRedactorRecursive(599);
		ok(true);
	});
	
	
	//длинные тесты, чтобы выполнить, нужно набрать в строку #long
	if(longtest)
	test('Асинхронный тест только сохранения', function() {
		setTimeout(function(){
			console.info(jsDelId( parseInt(new_id8) ),"Заметка №"+new_id8+" удалена");
			},30000);
		stop();
		var myname = jsNow()+" - тест";
		var old_id8 = jsCreateDo(1,myname);

		window.after_ajax = function()
			{ 
			window.after_ajax = null;
			setTimeout(function(){
				var answer = my_all_data.filter(function(el,i) { if(el.title) return el.title==myname; });	
				new_id8=answer[0].id; 
				ok(parseInt(old_id8)<parseInt(new_id8),"Новый id = "+new_id8+", старый id = "+old_id8+", name="+myname); 
				ok(my_all_data, localStorage.getItem("last_sync_time")+" < "+jsNow());
				start();
				},500);
			};

		jsSync("save_only");
		});
	
	///короткие тесты 	
	
	test('jsCreateDo("_НОВОЕ")', function() {
		id_of_new = jsCreateDo(1,"_НОВОЕ");
		ok(id_of_new, 'Элемент '+id_of_new+' найден');
	});
	
	test('jsFind('+id_of_new+')', function() {
		equal(jsFind(id_of_new).id,id_of_new, 'Элемент '+id_of_new+' найден');
	});
	
	test('jsCreate_or_open(_НОВОЕ)', function() {
		equal(jsCreate_or_open(["_НОВОЕ"]),id_of_new, 'Элемент НОВОЕ найден');
	});
	
	test('jsTestDateParse', function() {
		ok(jsParseDate("Мыть через 3 дня").title=="+3 дн. ", "Через 3 дня - работает");
		ok(jsParseDate("Забрать 12.05.2015").title=="12.05.2015 ", "12.05.2015 - работает");
	});
	
	test('jsGetAllMyNotes', function() {
		ok(jsGetAllMyNotes().length>50, "Загрузил заметки");
	});
	
	test('jsDiaryFindDateNote', function() {
		ok( jsDiaryFindDateNote(new Date("2013-02-16"))[1].length>30 , "Есть заметка на 2013-02-16");
	});
	
	test('jsCreateDo + jsDelete + node_to_id + jsPlaceMakedone + jsNow + jsGetSyncId', function() {
		var id = jsCreateDo(1,"***Тест-"+jsNow());
		ok( jsFind(id).id == id , "Создал и нашёл созданную заметку №"+id);
		ok(jsDelId(id),"Заметка №"+id+" удалена");
		var time_dif = (jsNow() - jsNow(22));
		ok( time_dif > 0 , "Вывод текущего времени "+time_dif );
		ok( jsGetSyncId().indexOf(":")!=-1, "jsGetSyncId()");
	});

	test('node_to_id + jsFindLastSync + мелкие функции', function() {
		equal(node_to_id("node_566"),566, "node_to_id работает");
		equal(id_to_node("566"),"node_566", "id_to_node работает");
		ok(jsFindLastSync()>100,"jsFindLastSync - работает")
		});

	test('jsPlaceMakedone', function() {
		ok(jsPlaceMakedone(id_of_new)!=0,"jsPlaceMakedone работает");
		$(".makedone,.makedone_arrow,.makedone_arrow2").hide();
		});

	
	test('Проверяю поиск', function() {
		$("#textfilter").val("ОВОЕ");
		jsHighlightText();
		ok($(".highlight").length>0,"Один элемент подсвечен");
		$("#textfilter").val("");
		jsHighlightText();
		ok($(".highlight").length==0,"Вся подсветка снята");
		$("#textfilter").val("вертолётной");
		$('#textfilter').keyup();
		});
		
	test('Проверяю jsDry', function() {
		ok( jsDry([jsFind(id_of_new,{text:"Тестирую"})])[0].text == "Тестирую", "jsDry(Тестирую)");
		});

	test('Проверяю внутренню базу IndexedDB', function() {
		stop();
		tree_db.setItem("author","JOHN WEZEL").done(function(ans)
			{
				tree_db.setItem("author").done(function(ans)
					{
					if(ans=="JOHN WEZEL") ok(true,"Сохранил и считал один параметр в tree_settings: "+ans+
											". Тип хранения: "+db.getType());
					start();
					});
			});		
		});
		
	if(longtest)
	test('Тесты tree_db', function () {
		ok( JSON.stringify(db.getSchema().stores).indexOf('"tree"') != -1, "Таблица tree существует" );
		stop();
		tree_db.calculate_md5().done(function(md5)
			{ 
			ok(md5.length>0,"md5 массив передан в кол-ве: "+md5.length+" шт.")
			start();
			});
		stop();

		tree_db.compare_md5_local_and_server().done(function(test_ok)
			{ 
			ok(true,"Сверку локальной базы и сервера по md5 "+test_ok);
			start();
			});
			
		stop();
		tree_db.setItem("big_object",jsFind(id_of_new)).done(function(ans)
			{
				tree_db.setItem("big_object").done(function(ans)
					{
					if(JSON.stringify(ans)==JSON.stringify(jsFind(id_of_new))) ok(true,"Сохранил и считал один параметр в tree_settings: "+ans.title+
											". Тип хранения: "+db.getType());
					start();
					});
			});


		});
		
		//////////////////////////////////////////
		test('Тесты разных функций', function () {
		ok(Object.size(pomidor_text)>20,"Проверяю функцию Object.size");
		equal(RestMin(160),"2:40 — осталось","Проверяю вывод заголовков с временем, которое осталось");
		jsTitle("Проверяю вывод комментария");
		ok($('.f_text').is(":visible"),"Комментарий отображается");
		ok($('.f_text').html()=="Проверяю вывод комментария","Комментарий совпадает с тем, который установили в тесте: "+$('.f_text').html());
		
		});


}