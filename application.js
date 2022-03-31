
'use strict';

import Application from '../app-framework/base/application.js';
import Core from '../app-framework/tools/core.js';
import Dom from '../app-framework/tools/dom.js';
import Configuration from '../app-framework/data_structures/configuration/configuration.js';
import Recorder from '../app-framework/components/recorder.js';
import DiagramAuto from '../app-framework/widgets/diagram/auto.js'
import GridAuto from '../app-framework/widgets/grid/auto.js'
import GisAuto from '../app-framework/widgets/gis/auto.js'
import Playback from '../app-framework/widgets/playback.js';

export default class AppEmbed extends Application { 

	constructor(container, simulation, config, style, files) {		
		super(container);
		
		Dom.add_css(document.body, "Embed");
		
		this.files = files;
		this.simulation = simulation;
		this.settings = config;
			
		this.show_view(this.elems.view).then(view => {
			this.view = view;
			
			if (!this.view) throw new Error("Unable to create a view widget from simulation object.");
			
			this.elems.playback.recorder = new Recorder(this.view.widget.canvas);
			this.elems.playback.initialize(this.simulation, this.settings.playback);
		
			this.view.resize();
			this.view.redraw();
		});
	}
	
	show_view(container) {
		var d = Core.defer();
		
		Dom.add_css(document.body, this.simulation.type);
		
		if (this.settings.diagram) {
			d.Resolve(new DiagramAuto(container, this.simulation, this.settings.diagram));
		}
		else if (this.settings.grid) {
			d.Resolve(new GridAuto(container, this.simulation, this.settings.grid));
		}
		else if (this.settings.gis) {
			var view = new GisAuto(container, this.simulation, this.settings.gis, this.files.geojson || []);
			
			view.on("ready", ev => d.Resolve(view));
		}
		
		return d.promise;
	}					   
						   
	html() {
		return	"<main handle='main' class='awd view-container'>" +
					"<div handle='view' class='view'></div>" +
					"<div handle='playback' widget='Api.Widget.Playback'></div>" +
				"</main>";
	}
}