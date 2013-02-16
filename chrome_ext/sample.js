// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// A generic onclick callback function.
var ttt;
function genericOnClick(info, tab) {
  ttt = tab;
  chrome.tabs.executeScript(null, { file: "contentscript.js" }); 
  
  chrome.extension.getBackgroundPage().console.info(info,chrome.extension);	
  chrome.extension.getBackgroundPage().console.log("item " + info.menuItemId + " was clicked");
  chrome.extension.getBackgroundPage().console.log("info: " + JSON.stringify(info));
  chrome.extension.getBackgroundPage().console.log("tab: " + JSON.stringify(tab));
}

chrome.extension.onRequest.addListener(onSelection);
var vv;
      function onSelection(payload) {
        console.info('Got selection: ', payload);
        vv = payload;
        if (!vv.html) text = vv.text;
        else text = vv.html;
		
		var req = new XMLHttpRequest();
		req.open('POST',"http://4tree.ru/do.php?newtext=1",false);
		req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		data = 'text='+encodeURIComponent(text)+'&title='+encodeURIComponent(ttt.title)+'&url='+encodeURIComponent(ttt.url);
		req.send(data);
		alert('Сохранил в папке _НОВОЕ: "'+ttt.title+'"');
        
        
//        chrome.extension.onRequest.removeListener(window.onSelection);
      };


// Create one test item for each context type.
var contexts = ["page","selection","link","editable","image","video",
                "audio"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  if(context == 'selection') contexttext = "выбранное";
  if(context == 'page') contexttext = "всю страницу";
  if(context == 'link') contexttext = "ссылку";
  if(context == 'editable') contexttext = "выбранное";
  if(context == 'image') contexttext = "картинку";
  if(context == 'video') contexttext = "видеоролик";
  var title = "Скопировать " + contexttext + " в 4tree.ru";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  chrome.extension.getBackgroundPage().console.log("'" + context + "' item:" + id);
}


// Create a parent item and two children.
var parent = chrome.contextMenus.create({"title": "Добавить дело и установить дату"});
var child1 = chrome.contextMenus.create(
  {"title": "Сегодня", "parentId": parent, "onclick": genericOnClick});
var child2 = chrome.contextMenus.create(
  {"title": "Завтра", "parentId": parent, "onclick": genericOnClick});
var child2 = chrome.contextMenus.create(
  {"title": "Через месяц", "parentId": parent, "onclick": genericOnClick});
chrome.extension.getBackgroundPage().console.log("parent:" + parent + " child1:" + child1 + " child2:" + child2);


// Create some radio items.
function radioOnClick(info, tab) {
  chrome.extension.getBackgroundPage().console.log("radio item " + info.menuItemId +
              " was clicked (previous checked state was "  +
              info.wasChecked + ")");
}
/*
var radio1 = chrome.contextMenus.create({"title": "Radio 1", "type": "radio",
                                         "onclick":radioOnClick});
var radio2 = chrome.contextMenus.create({"title": "Radio 2", "type": "radio",
                                         "onclick":radioOnClick});
chrome.extension.getBackgroundPage().console.log("radio1:" + radio1 + " radio2:" + radio2);
*/

// Create some checkbox items.
function checkboxOnClick(info, tab) {
  chrome.extension.getBackgroundPage().console.log(JSON.stringify(info));
  chrome.extension.getBackgroundPage().console.log("checkbox item " + info.menuItemId +
              " was clicked, state is now: " + info.checked +
              "(previous state was " + info.wasChecked + ")");

}
var checkbox1 = chrome.contextMenus.create(
  {"title": "Сохранить ссылку на эту страницу", "onclick":checkboxOnClick});
/*var checkbox2 = chrome.contextMenus.create(
  {"title": "Checkbox2", "type": "checkbox", "onclick":checkboxOnClick});
chrome.extension.getBackgroundPage().console.log("checkbox1:" + checkbox1 + " checkbox2:" + checkbox2);
*/

// Intentionally create an invalid item, to show off error checking in the
// create callback.
chrome.extension.getBackgroundPage().console.log("About to try creating an invalid item - an error about " +
            "item 999 should show up");
chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
  if (chrome.extension.lastError) {
    chrome.extension.getBackgroundPage().console.log("Got expected error: " + chrome.extension.lastError.message);
  }
});
