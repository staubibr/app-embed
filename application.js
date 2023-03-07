'use strict';

import Application from '../app-framework/base/application.js';
import Core from '../app-framework/tools/core.js';
import Dom from '../app-framework/tools/dom.js';
import Net from '../app-framework/tools/net.js';
import Configuration from '../app-framework/data_structures/visualization/configuration.js';
import Recorder from '../app-framework/components/recorder.js';
import wDiagram from '../app-framework/widgets/diagram/w-diagram.js'
import wGrid from '../app-framework/widgets/grid/w-grid.js'
import wGIS from '../app-framework/widgets/gis/w-gis.js'
import Playback from '../app-framework/widgets/playback.js';
import Loader from '../app-framework/widgets/loader.js';

export default class AppEmbed extends Application { 

	async load() {
		var qry = new URLSearchParams(window.location.search);
		
		this.elems.loader.on("ready", ev => this.initialize(ev.simulation, ev.viz, ev.files));
		this.elems.loader.on("error", ev => this.handle_error(ev.error));
		
		if (qry.get("viz")) {
			var file = await Net.file(qry.get("viz"), "visualization.json");
			
			this.elems.loader.load([file]);
		}
		
		else Dom.remove_css(this.elems.loader.root, "hidden");
	}
	
	async initialize(simulation, config, files) {
		var view = await this.show_view(simulation, config, files);
		
		this.elems.playback.recorder = new Recorder(view.canvas);
		this.elems.playback.initialize(simulation, config);
	}
	
	show_view(simulation, config, files) {
		var d = Core.defer();
		
		Dom.remove_css(this.elems.playback.root, "hidden");
		Dom.add_css(document.body, config.type);
		
		if (config.type == "diagram") {			
			return d.Resolved(new wDiagram(this.elems.view, simulation, config));
		}
		else if (config.type === "grid") {
			return d.Resolved(new wGrid(this.elems.view, simulation, config));
		}
		else if (config.type === "gis") {
			var view = new wGIS(this.elems.view, simulation, config, files || []);
			
			view.on("ready", ev => d.Resolve(view));
			
			return d.promise;
		}
		else {
			this.handle_error(new Error("The embedded DEVS viewer does not support visualization type " + view));
		}		
	}	
	
	html() {
		return	"<main handle='main' class='view-container'>" +
					"<div handle='loader' class='loader-widget hidden' widget='Api.Widget.Loader'></div>" + 
					"<div handle='view' class='view'></div>" +
					"<div handle='playback' class='playback hidden' widget='Api.Widget.Playback'></div>" +
				"</main>";
	}
}