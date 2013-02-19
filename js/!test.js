function jsTest()
{
  var testcount = 1;
  
  for(test=1;test<=testcount;test=test+1)
  	{
  	the_test = jsTestId(test);
	console.info(test,the_test.result," – (" + the_test.name + ")" );
	}
	
}

function jsTestId(test)
{
	if(test==1)
		{
		name = "jsFind add test";
		old_count = my_all_data.length;
		new_id = jsAddDo( "new", 599, "Тест добавления дела!!!@@" );
		new_count = my_all_data.length;
		ok1 = ((new_count - old_count)==1);
		jsRefreshDo();
		result = new_id;
//		result = ok1;
		}

	if(test==2)
		{
		name = "jsFind test2";
		result = my_all_data.length;
		}

	if(test==3)
		{
		name = "jsFind test3";
		result = my_all_data.length;
		}

return {name:name, result:result};
}