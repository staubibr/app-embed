'use strict';

import Core from "../app-framework/tools/core.js";
import Net from "../app-framework/tools/net.js";
import Evented from '../app-framework/base/evented.js';
import Loader from '../app-framework/widgets/loader.js';
import AppConfig from '../app-framework/components/config.js';
import Application from "./application.js";

export default class Main extends Evented { 

	get path() { return this._json.path; }

	get uuid() { return this._json.uuid; }

	get id() { return this._json.id; }

	get diagram() { return this._json.diagram; }

	get container() { return this._container; }

	constructor(container, json) {
		super();
		
		this._container = container;
		this._json = json;

		var p1 = Core.wait_for_document();
		var p2 = AppConfig.load("./application.json");

		Promise.all([p1, p2]).then(this.on_base_config_loaded.bind(this), this.on_wdsv_failure.bind(this));
	
		this.emit("initializing");
	}
	
	on_base_config_loaded(responses) {	
		this.loader = new Loader(this.container);
		
		this.loader.on("ready", this.on_loader_ready.bind(this));
		this.loader.on("error", this.on_loader_failure.bind(this));
	
		AppConfig.URLs.models = null;
	
		if (this.path) AppConfig.URLs.models = [AppConfig.URLs.logs, this.path].join("/");
		
		if (this.uuid) AppConfig.URLs.models = [AppConfig.URLs.viz, this.uuid].join("/");
	
		if (AppConfig.URLs.models) {			
			var files = {
				visualization : `${AppConfig.URLs.models}/visualization.json`,
				structure : `${AppConfig.URLs.models}/structure.json`,
				messages : `${AppConfig.URLs.models}/messages.log`,
				style : `${AppConfig.URLs.models}/style.json`
			}
			
			if (this.diagram) files.diagram = `${AppConfig.URLs.models}/diagram.svg`;
			
			this.load_files(files);
		}
		
		else this.loader.container.style.display = "block";
	}
	
	load_files(files) {	
		var p1 = Net.file(files.visualization, "visualization.json", true);
		var p2 = Net.file(files.structure, "structure.json");
		var p3 = Net.file(files.messages, "messages.log");
		var p4 = Net.file(files.style, "style.json", true);
		
		var defs = [p1,p2,p3,p4];
		
		if (files.diagram) defs.push(Net.file(files.diagram, "diagram.svg", true));
		
		Promise.all(defs).then(this.on_files_ready.bind(this), this.on_wdsv_failure.bind(this));
	}
	
	on_files_ready(files) {
		files = files.filter(f => !!f);
		
		this.files = { 
			structure: files.find(f => f.name == 'structure.json'),
			messages: files.find(f => f.name == 'messages.log'),
			diagram: files.find(f => f.name == 'diagram.svg'),
			visualization: files.find(f => f.name == 'visualization.json'),
			style: files.find(f => f.name == 'style.json')
		}
		
		this.loader.load(this.files);
	}

	on_loader_ready(ev) {
		this.loader.root.remove();
		this.loader.container.style.display = "block"

		var app = new Application(this.container, ev.simulation, ev.configuration, ev.style, ev.files);

		this.emit("ready", { application:app });
	}
	
	on_loader_failure(ev) {
		this.on_wdsv_failure(ev.error);
	}
	
	on_wdsv_failure(error) {
		console.error(error);
		
		this.emit("error", { error:error });
	}
}