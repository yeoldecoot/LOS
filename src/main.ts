import { Application, Container } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Tile } from "./Tile";
import { layout } from "./hexgrid/Layout";
import { initDevtools } from "@pixi/devtools";

(async () => {
	function update() {
		tiles.forEach((tile) => {
			
		});
	}

	// Create and initialize the application
	const app = new Application();
	initDevtools({ app });
	await app.init({
		background: "#FFFFFF",
		resizeTo: window,
		backgroundAlpha: 0,
		antialias: true,
		autoDensity: true,
		resolution: window.devicePixelRatio,
	});

	//create the main container
	const main = new Container();

	//create hexgrid
	const tiles: Tile[] = [];
	const mapWidth = 41;
	const mapHeight = 40;
	for (let q = 0; q < mapWidth; q++) {
		const rOffset = Math.floor(q / 2);
		for (let r = -rOffset; r < mapHeight - rOffset; r++) {
			const s = -q - r;
			const tile = new Tile(q, r, s);
			main.addChild(tile.gfx);
			tiles.push(tile);
		}
	}

	//pan/zoom
	const bounds = main.getBounds();
	const width = bounds.width - layout.size.x * 2;
	const height = bounds.height - layout.size.y;
	const viewport = new Viewport({
		screenWidth: app.screen.width,
		screenHeight: app.screen.height,
		worldWidth: width,
		worldHeight: height,
		events: app.renderer.events,
	});

	// enable interaction plugins
	viewport
		.moveCenter({ x: width / 2, y: height / 2 })
		.drag() // pan with drag
		.pinch() // touch pinch zoom
		.wheel() // mouse wheel zoom
		.clamp({ direction: "all" }) // clamp pan
		.clampZoom({
			minWidth: 400,
			minHeight: 400,
			maxWidth: width,
			maxHeight: height,
		}); //clamp zoom

	//ticker
	app.ticker.add(() => {
		update();
	});

	//define hierarchy
	document.body.appendChild(app.canvas);
	app.stage.addChild(viewport);
	viewport.addChild(main);
})();
