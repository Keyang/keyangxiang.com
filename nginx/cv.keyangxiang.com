server {

        listen   80; ## listen for ipv4

        server_name  cv.keyangxiang.com;

        root /var/www/cv.keyangxiang.com;
        location / {
                index  index.html;
        }

        error_page  404  /index.html;

        # redirect server error pages to the static page /50x.html
        #
        #error_page   500 502 503 504  /50x.html;
        #location = /50x.html {
        #       root   /var/www/nginx-default;
        #}

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
                #proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        location ~ /\.ht {
               #deny  all;
        }
}
