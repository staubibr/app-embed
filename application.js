
'use strict';

import Application from '../app-framework/base/application.js';
import Core from '../app-framework/tools/core.js';
import Dom from '../app-framework/tools/dom.js';
import Configuration from '../app-framework/data_structures/visualization/configuration.js';
import Recorder from '../app-framework/components/recorder.js';
import wDiagram from '../app-framework/widgets/diagram/w-diagram.js'
import wGrid from '../app-framework/widgets/grid/w-grid.js'
import wGIS from '../app-framework/widgets/gis/w-gis.js'
import Playback from '../app-framework/widgets/playback.js';

export default class AppEmbed extends Application { 

	constructor(container, simulation, config, files) {		
		super(container);
		
		this.simulation = simulation;
		this.config = config;
		this.files = files;
		
		this.initialize();
	}
	
	async initialize() {
		this.view = await this.show_view(this.elems.view);
		
		this.elems.playback.recorder = new Recorder(this.view.canvas);
		this.elems.playback.initialize(this.simulation, this.config);
	}
	
	show_view(container) {
		var d = Core.defer();
		
		Dom.add_css(document.body, this.config.type);
		
		if (this.config.type == "diagram") {			
			return d.Resolved(new wDiagram(container, this.simulation, this.config));
		}
		else if (this.config.type === "grid") {
			return d.Resolved(new wGrid(container, this.simulation, this.config));
		}
		else if (this.config.type === "gis") {
			var view = new wGIS(container, this.simulation, this.config, this.files || []);
			
			view.on("ready", ev => d.Resolve(view));
			
			return d.promise;
		}
		else {
			this.handle_error(new Error("The embedded DEVS viewer does not support visualization type " + view));
		}		
	}					   
	
	html() {
		return	"<main handle='main' class='view-container'>" +
					"<div handle='view' class='view'></div>" +
					"<div handle='playback' widget='Api.Widget.Playback'></div>" +
				"</main>";
	}
}