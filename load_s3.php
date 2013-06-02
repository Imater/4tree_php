<?php

$S3_KEY = 'AKIAJWRDBPSZ66V2SXWA';
$S3_SECRET = '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';
$S3_BUCKET = '/upload.4tree.ru'; // bucket needs / on the front


$S3_URL = 'http://s3-eu-west-1.amazonaws.com';

// expiration date of query
$EXPIRE_TIME = (60 * 5); // 5 minutes

$objectName = '/' . $_GET['name'];

$mimeType = $_GET['type'];
$expires = time() + $EXPIRE_TIME;
$amzHeaders = "x-amz-acl:public-read";
$stringToSign = "PUTnn$mimeTypen$expiresn$amzHeadersn$S3_BUCKET$objectName";

$sig = urlencode(base64_encode(hash_hmac('sha1', $stringToSign, $S3_SECRET, true)));
$url = urlencode("$S3_URL$S3_BUCKET$objectName?AWSAccessKeyId=$S3_KEY&Expires=$expires&Signature=$sig");

echo $url;

?>
