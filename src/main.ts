import { Application, Container, Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Hex } from "./hexgrid/models/Hex";
import { polyPoint, layout } from "./hexgrid/Layout";
import HexUtils from "./hexgrid/HexUtils";

(async () => {
	//draw a hex to the screen with a given color
	function draw(hex: Hex, color: number) {
		const { x, y } = HexUtils.hexToPixel(hex, layout);
		const gfx = new Graphics()
			.poly(polyPoint())
			.fill(color)
			.stroke({ width: 2, color: 0x000000 });
		gfx.position.set(x, y);
		main.addChild(gfx);
	}

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

	//create the main container
	const main = new Container();

	//create hexgrid
	const hexes = new Map<string, Hex>();
	const mapWidth = 41;
	const mapHeight = 40;
	for (let q = 0; q < mapWidth; q++) {
		const rOffset = Math.floor(q / 2);
		for (let r = -rOffset; r < mapHeight - rOffset; r++) {
			const s = -q - r;
			const key = `${q},${r},${s}`;
			hexes.set(key, new Hex(q, r, s));
			draw(<Hex>hexes.get(key), 0xffffff);
		}
	}

	//create attacker hex (still need to decide between state based vs object)
	const attackerHex = new Hex(20, 10, -30);
	draw(attackerHex, 0x555555);

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

	//create heirarchy
	app.stage.addChild(viewport);
	viewport.addChild(main);

	//define hierarchy
	document.body.appendChild(app.canvas);
})();
