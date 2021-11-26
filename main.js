import WDSV from './WDSV.js';
import Net from '../app-framework/tools/net.js';

var params = { 
	id : Net.GetUrlParameter("id"),
	path: Net.GetUrlParameter("path"),
	diagram: Net.GetUrlParameter("diagram") == "true"
}

var viewer = new WDSV(document.body, params);

viewer.On("Error", (error) => alert(error.toString()));