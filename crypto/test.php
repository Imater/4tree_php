<html lang="ru" class="" manifest="">
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">

<head>
<script src="rollups/aes.js"></script>
<script src="components/enc-base64-min.js"></script>
<script>
    var text = "Женя вышел погулять и пришёл сюда опять";
    var key = CryptoJS.enc.Base64.parse("#base64Key#");
    var iv  = CryptoJS.enc.Base64.parse("#base64IV#");
    
    console.info(key,iv)

    var encrypted = CryptoJS.AES.encrypt(text, key, {iv: iv});
    console.log(encrypted.toString());

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {iv: iv});
    console.info("decrypt=",decrypted.toString(CryptoJS.enc.Utf8));
</script>

</head>
<body>

</body>
</html>