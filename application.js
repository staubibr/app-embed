
'use strict';

import Core from '../app-framework/tools/core.js';
import Dom from '../app-framework/tools/dom.js';
import Configuration from '../app-framework/data_structures/configuration/configuration.js';
import Templated from '../app-framework/components/templated.js';
import Recorder from '../app-framework/components/recorder.js';
import DiagramAuto from '../app-framework/widgets/diagram/auto.js'
import GridAuto from '../app-framework/widgets/grid/auto.js'
import GisAuto from '../app-framework/widgets/gis/auto.js'
import Playback from '../app-framework/widgets/playback.js';

export default Core.Templatable("Application", class Application extends Templated { 

	constructor(node, simulation, config, style, files) {		
		super(node);
		
		Dom.AddCss(document.body, "Embed");
		
		this.files = files;
		this.simulation = simulation;
		this.settings = config;
			
		this.ShowView(this.Elem("view")).then(view => {
			this.view = view;
			
			if (!this.view) throw new Error("Unable to create a view widget from simulation object.");
			
			this.Widget("playback").recorder = new Recorder(this.view.widget.canvas);
			this.Widget("playback").Initialize(this.simulation, this.settings.playback);
		
			this.view.Resize();
			this.view.Redraw();
		});
		
	}
	
	ShowView(container) {
		var d = Core.Defer();
		
		Dom.AddCss(document.body, this.simulation.type);
		
		if (this.settings.diagram) {
			d.Resolve(new DiagramAuto(container, this.simulation, this.settings.diagram));
		}
		else if (this.settings.grid) {
			d.Resolve(new GridAuto(container, this.simulation, this.settings.grid));
		}
		else if (this.settings.gis) {
			var view = new GisAuto(container, this.simulation, this.settings.gis, this.files.geojson || []);

			// Dom.Place(this.Elem("playback"), view.widget.roots[0]);
			
			view.On("ready", ev => d.Resolve(view));
		}
		
		return d.promise;
	}
	
	OnWidget_Error(ev) {
		alert (ev.error);
	}						   
						   
	Template() {
		return	"<main handle='main' class='awd view-container'>" +
					"<div handle='view' class='view'></div>" +
					"<div handle='playback' widget='Widget.Playback'></div>" +
				"</main>";
	}
});