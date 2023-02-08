import WDSV from './WDSV.js';
import Net from '../app-framework/tools/net.js';

var params = { 
	id : Net.get_url_parameter("id"),
	path: Net.get_url_parameter("path"),
	uuid: Net.get_url_parameter("uuid"),
	diagram: Net.get_url_parameter("diagram") == "true"
}

var viewer = new WDSV(document.body, params);

viewer.on("error", (error) => alert(error.toString()));