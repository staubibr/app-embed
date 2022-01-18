'use strict';

import Core from "../app-framework/tools/core.js";
import Net from "../app-framework/tools/net.js";
import Evented from '../app-framework/components/evented.js';
import Loader from '../app-framework/widgets/loader.js';
import ChunkReader from '../app-framework/components/chunkReader.js';
import Application from "./application.js";

export default class Main extends Evented { 

	get path() { return this._json.path; }

	get uuid() { return this._json.uuid; }

	get id() { return this._json.id; }

	get diagram() { return this._json.diagram; }

	get node() { return this._node; }

	constructor(node, json) {
		super();
		
		this._node = node;
		this._json = json;

		Core.WaitForDocument().then(this.OnBaseConfig_Loaded.bind(this), this.OnWDSV_Failure.bind(this));
	
		this.Emit("Initializing");
	}
	
	OnBaseConfig_Loaded(responses) {	
		this.loader = new Loader(this.node);
		
		this.loader.On("ready", this.OnLoader_Ready.bind(this));
		this.loader.On("error", this.OnLoader_Failure.bind(this));
	
		Core.URLs.models = null;
	
		if (this.path) Core.URLs.models = [Core.URLs.logs, this.path].join("/");
		
		if (this.uuid) Core.URLs.models = [Core.URLs.viz, this.uuid].join("/");
	
		if (Core.URLs.models) {			
			var files = {
				visualization : `${Core.URLs.models}/visualization.json`,
				structure : `${Core.URLs.models}/structure.json`,
				messages : `${Core.URLs.models}/messages.log`,
				style : `${Core.URLs.models}/style.json`
			}
			
			if (this.diagram) files.diagram = `${Core.URLs.models}/diagram.svg`;
			
			this.LoadFiles(files);
		}
		
		else this.loader.container.style.display = "block";
	}
	
	LoadFiles(files) {	
		var p1 = Net.File(files.visualization, "visualization.json", true);
		var p2 = Net.File(files.structure, "structure.json");
		var p3 = Net.File(files.messages, "messages.log");
		var p4 = Net.File(files.style, "style.json", true);
		
		var defs = [p1,p2,p3,p4];
		
		if (files.diagram) defs.push(Net.File(files.diagram, "diagram.svg", true));
		
		Promise.all(defs).then(this.OnFiles_Ready.bind(this), this.OnWDSV_Failure.bind(this));
	}
	
	OnFiles_Ready(files) {
		files = files.filter(f => !!f);
		
		this.files = { 
			structure: files.find(f => f.name == 'structure.json'),
			messages: files.find(f => f.name == 'messages.log'),
			diagram: files.find(f => f.name == 'diagram.svg'),
			visualization: files.find(f => f.name == 'visualization.json'),
			style: files.find(f => f.name == 'style.json')
		}
		
		this.loader.Load(this.files);
	}

	OnLoader_Ready(ev) {
		this.loader.roots.forEach(r => this.node.removeChild(r));
		this.loader.container.style.display = "block"

		var app = new Application(this.node, ev.simulation, ev.configuration, ev.style, ev.files);

		this.Emit("Ready", { application:app });
	}
	
	OnLoader_Failure(ev) {
		this.OnWDSV_Failure(ev.error);
	}
	
	OnWDSV_Failure(error) {
		console.error(error);
		
		this.Emit("Error", { error:error });
	}
}