'use strict';

import Core from "../app-framework/tools/core.js";
import Net from "../app-framework/tools/net.js";
import Evented from '../app-framework/base/evented.js';
import Loader from '../app-framework/widgets/loader.js';
import AppConfig from '../app-framework/components/config.js';
import Application from "./application.js";

export default class Main extends Evented { 

	get uuid() { return this._json.uuid; }

	get container() { return this._container; }

	constructor(container, json) {
		super();
		
		this._container = container;

		var p1 = Core.wait_for_document();
		var p2 = AppConfig.load("./application.json");

		Promise.all([p1, p2]).then(this.on_config_loaded.bind(this), ev => console.error(ev));
	
		this.emit("initializing");
	}
	
	async on_config_loaded(responses) {
		var viz = Net.get_url_parameter("viz");
		var uuid = Net.get_url_parameter("uuid");
		
		this.loader = new Loader(this.container);
		
		this.loader.on("ready", this.on_loader_ready.bind(this));
		this.loader.on("error", ev => console.error(ev.error));

		AppConfig.URLs.models = null;

		if (viz || uuid) {
			var url = uuid ? [AppConfig.URLs.viz, uuid].join("/") : viz;
			var file = await Net.file(url, "visualization.json");

			this.loader.load([file]);
		}

		else this.loader.container.style.display = "block";
	}
	
	on_loader_ready(ev) {		
		this.loader.root.remove();
		this.loader.container.style.display = "block"

		var app = new Application(this.container, ev.simulation, ev.viz, ev.files);

		this.emit("ready", { application:app });
	}
	
	on_wdsv_failure(error) {
		console.error(error);
	}
}
