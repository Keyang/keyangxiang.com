<?php
require_once ("./http/Request2.php");
$http=new HTTP_Request2("https://panel.dreamhost.com/index.cgi");
        $http->setCookieJar(true);
        $http->send();
        $http->setMethod(HTTP_Request2::METHOD_POST);
        $param=array(
            "username"=>"keyang.xiang@gmail.com",
            "password"=>"bzallsylsn438985",
            "Nscmd" => "Nlogin"
        );
        $http->addPostParameter($param);
        $http->send();
        $http->setMethod(HTTP_Request2::METHOD_GET);
        $res=$http->send();
echo "done";
?>
