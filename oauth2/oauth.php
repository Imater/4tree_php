<?php

require_once "{INSTALL_DIR}/php-oauth-client/vendor/autoload.php";
require_once "{INSTALL_DIR}/php-simple-auth/lib/SimpleAuth.php";

try {
    // first we login to this app...
    $auth = new SimpleAuth();
    $userId = $auth->authenticate();

    // then we go and obtain an access token and bind it to the
    // user logged into this application...
    $a = new \fkooman\OAuth\Client\Api("demo-oauth-app", $userId, array("authorizations"));
    $a->setReturnUri("{BASE_URL}/demo-oauth-app/index.php");
    $response = $a->makeRequest("{BASE_URL}/php-oauth/api.php/authorizations/");
    header("Content-Type: application/json");
    echo $response->getBody();
} catch (SimpleAuthException $e) {
    echo sprintf("SimpleAuthException: %s", $e->getMessage());
} catch (Exception $e) {
    echo sprintf("Exception: %s", $e->getMessage());
}

?>