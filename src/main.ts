import { Application } from "pixi.js";
import { Viewport } from "pixi-viewport";
import Layout from "./hexagon/Layout";
import HexGrid from "./hexagon/Hexagon";
(async () => {
	// Create a new application
	const app = new Application();

	// Initialize the application
	await app.init({
		background: "#FFFFFF",
		resizeTo: window,
		backgroundAlpha: 0,
		antialias: true,
		autoDensity: true,
		resolution: window.devicePixelRatio,
	});
	document.body.appendChild(app.canvas);

	//create the hexgrid
	const layout = new Layout({ size: { x: 40, y: 40 }, flat: true });
	const hexGrid = new HexGrid(layout);
	console.log(hexGrid);
	//define the viewport
	const bounds = layout.getBounds();
	const width = bounds.width-80;
	const height = bounds.height-40
	const viewport = new Viewport({
		screenWidth: app.screen.width,
		screenHeight: app.screen.height,
		worldWidth: width,
  		worldHeight: height,
		events: app.renderer.events,
	});
	app.stage.addChild(viewport);

	// enable interaction plugins
	viewport
		.moveCenter({x: width/2, y: height/2})
		.drag() // pan with drag
		.pinch() // touch pinch zoom
		.wheel() // mouse wheel zoom
		.clamp({ direction: "all" }) // clamp pan
		.clampZoom({minWidth: 400, minHeight: 400, maxWidth: width, maxHeight: height}); //clamp zoom

	//add layout to viewport
	viewport.addChild(layout);
})();
