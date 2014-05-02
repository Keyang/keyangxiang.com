/**
 * Module dependencies.
 */

var server=require("csvtojson").interfaces.web;

server.startWebServer({
	"port":process.env.VCAP_APP_PORT || 8801
});
