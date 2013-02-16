<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>IndexedDB</title>
    <script type="text/javascript">
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
        var db;
        (function () {     
            var peopleData = [
                { name: "John Dow", email: "john@company.com" },
                { name: "Don Dow", email: "don@company.com" }
            ];
 
            function initDb() {
                var request = indexedDB.open("1PeopleDB", 1);  
                request.onsuccess = function (evt) {
                    db = request.result;                                                            
                };
 
                request.onerror = function (evt) {
                    console.log("IndexedDB error: " + evt.target.errorCode);
                };
 
                request.onupgradeneeded = function (evt) {                   
                    var objectStore = evt.currentTarget.result.createObjectStore(
                             "people", { keyPath: "id", autoIncrement: true });
 
                    objectStore.createIndex("name", "name", { unique: false });
                    objectStore.createIndex("email", "email", { unique: true });
 
                    for (i in peopleData) {
                        objectStore.add(peopleData[i]);
                    }
                };
            }
 
            function contentLoaded() {
                initDb();                
                var btnAdd = document.getElementById("btnAdd");
                var btnDelete = document.getElementById("btnDelete");
                var btnPrint = document.getElementById("btnPrint");                
 
                btnAdd.addEventListener("click", function () {
                    var name = document.getElementById("txtName").value;
                    var email = document.getElementById("txtEmail").value;
 
                    var transaction = db.transaction("people", IDBTransaction.READ_WRITE);
                    var objectStore = transaction.objectStore("people");                    
                    var request = objectStore.add({ name: name, email: email });
                    request.onsuccess = function (evt) {
                        // do something after the add succeeded
                    };
                }, false);
 
                btnDelete.addEventListener("click", function () {
                    var id = document.getElementById("txtID").value;
 
                    var transaction = db.transaction("people", IDBTransaction.READ_WRITE);
                    var objectStore = transaction.objectStore("people");
                    var request = objectStore.delete(id);
                    request.onsuccess = function(evt) {  
                        // It's gone!  
                    };
                }, false);
 
                btnPrint.addEventListener("click", function () {
                    var output = document.getElementById("printOutput");
                    output.textContent = "";
 
                    var transaction = db.transaction("people", IDBTransaction.READ_WRITE);
                    var objectStore = transaction.objectStore("people");
 
                    var request = objectStore.openCursor();
                    request.onsuccess = function(evt) {  
                        var cursor = evt.target.result;  
                        if (cursor) {  
                            output.textContent += "id: " + cursor.key + 
                                        " is " + cursor.value.name + " ";                            
                            cursor.continue();  
                        }  
                        else {  
                            console.log("No more entries!");  
                        }  
                    };  
                }, false);              
            }
 
            window.addEventListener("DOMContentLoaded", contentLoaded, false); 
    })();       
    </script>
</head>
<body>
    <div id="container">
        <label for="txtName">
            Name:
        </label>
        <input type="text" id="txtName" name="txtName" />
        <br />
        <label for="txtEmail">
            Email:
        </label>
        <input type="email" id="txtEmail" name="txtEmail" />
        <br />
        <input type="button" id="btnAdd" value="Add Record" />
        <br />
        <label for="txtID">
            ID:
        </label>
        <input type="text" id="txtID" name="txtID" />
        <br />
        <input type="button" id="btnDelete" value="Delete Record" />
        <br />
        <input type="button" id="btnPrint" value="Print objectStore" />
        <br />
        <output id="printOutput">
        </output>
    </div>
</body>
</html>