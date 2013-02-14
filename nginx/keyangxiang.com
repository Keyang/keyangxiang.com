# You may add here your
# server {
#	...
# }
# statements for each of your virtual hosts to this file

##
# You should look at the following URL's in order to grasp a solid understanding
# of Nginx configuration files in order to fully unleash the power of Nginx.
# http://wiki.nginx.org/Pitfalls
# http://wiki.nginx.org/QuickStart
# http://wiki.nginx.org/Configuration
#
# Generally, you will want to move this file somewhere, and start with a clean
# file but keep this around for reference. Or just disable in sites-enabled.
#
# Please see /usr/share/doc/nginx-doc/examples/ for more detailed examples.
##

server {
	#listen   80; ## listen for ipv4; this line is default and implied
	#listen   [::]:80 default ipv6only=on; ## listen for ipv6

	root /home/keyang/websites/keyangxiang.com;
	index index.html index.htm index.php;

	# Make site accessible from http://localhost/
	server_name *.keyangxiang.com;

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to index.html
		try_files $uri $uri/ /index.html;
		# Uncomment to enable naxsi on this location
		# include /etc/nginx/naxsi.rules
	}

	# Only for nginx-naxsi : process denied requests
	#location /RequestDenied {
		# For example, return an error code
		#return 418;
	#}

	error_page 404 /404.html;

	# redirect server error pages to the static page /50x.html
	#
	#error_page 500 502 503 504 /50x.html;
	#location = /50x.html {
	#	root /usr/share/nginx/www;
	#}

	# pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
	#
	location ~ /.+/.+\.php$ {
		#alias /home/keyang/source/keyangxiang.com/blog;
		#fastcgi_split_path_info ^(.+\.php)(/.+)$;
		# NOTE: You should have "cgi.fix_pathinfo = 0;" in php.ini
	
		# With php5-cgi alone:
		fastcgi_pass 127.0.0.1:9000;
		# With php5-fpm:
		#fastcgi_pass unix:/var/run/php5-fpm.sock;
		fastcgi_index index.php;
		include fastcgi_params;
	}
	location /blog/ {
		if ($request_uri ~ /wp-admin){
			 break;	
			}
		rewrite ^/blog/(.+)/$ /blog/index.php;
	}
	location /404.html {
		return 404;
	}
	location /projects/csv2json/ {
                proxy_pass  http://csv2json.cloudfoundry.com/;
                proxy_set_header X-Real_IP $remote_addr;

        }
	# deny access to .htaccess files, if Apache's document root
	# concurs with nginx's one
	#
	#location ~ /\.ht {
	#	deny all;
	#}
}


