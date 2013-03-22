function jsTestIt(){

	test('jsFind(599)', function() {
		equal(jsFind(599).id,599, 'Элемент 599 найден');
	});
	
	test('jsCreate_or_open(_НОВОЕ)', function() {
		equal(jsCreate_or_open(["_НОВОЕ"]),599, 'Элемент НОВОЕ найден');
	});
	test('jsCreate_or_open(ДНЕВНИК)', function() {
		equal(jsCreate_or_open(["ДНЕВНИК"]),6410, 'Элемент ДНЕВНИК найден');
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
		ok( jsFind(id).id == id , "Нашёл созданную заметку №"+id);
		ok(jsDelId(id),"Заметка №"+id+" удалена");
		equal(node_to_id("node_566"),566, "node_to_id работает");
		equal(id_to_node("566"),"node_566", "id_to_node работает");
		ok(jsPlaceMakedone(599)!=0,"jsPlaceMakedone работает");
		$(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(300);
		ok( (jsNow() - jsNow(22)) > 0 , "Вывод текущего времени" );
		ok( jsGetSyncId().indexOf(":")!=-1, "jsGetSyncId()");
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
		})
		
	test('Проверяю редактирование + jsDry', function() {
		ok( jsDry([jsFind(6447,{text:"Тестирую"})])[0].text == "Тестирую", "jsDry(Тестирую)");
		});

}