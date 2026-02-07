import {
	Application,
	Container,
	Graphics,
	extensions,
	CullerPlugin,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Tile } from "./Tile";
import { layout } from "./hexgrid/Layout";
import { initDevtools } from "@pixi/devtools";
import { updateLOS } from "./LOS";
import { CheckBox, RadioGroup } from "@pixi/ui";

(async () => {
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
	extensions.add(CullerPlugin);

	//create the main container
	const main = new Container();
	main.cullable = true;
	main.cullableChildren = true;

	//create hexgrid
	const tiles: Tile[] = [];
	const mapWidth = 41;
	const mapHeight = 40;
	for (let q = 0; q < mapWidth; q++) {
		const rOffset = Math.floor(q / 2);
		for (let r = -rOffset; r < mapHeight - rOffset; r++) {
			const s = -q - r;
			const tile = new Tile(q, r, s, 0xffffff, 0);
			tile.gfx.interactive = true;
			tile.gfx.onpointertap = (e) => {
				if(cameraMoving) return;
				defender.hex = tile.hex;
				updateLOS(tiles, attacker, defender);
			};
			main.addChild(tile.gfx);
			tiles.push(tile);
		}
	}

	//create attacker and defender tiles and the line drawn between them
	const attacker = new Tile(20, 10, -30, 0xa52422);
	main.addChild(attacker.gfx);

	const defender = new Tile(20, 10, -30, 0x759aab);
	main.addChild(defender.gfx);

	const line = new Graphics();
	main.addChild(line);

	function updateLine() {
		line.clear()
			.moveTo(attacker.x, attacker.y)
			.lineTo(defender.x, defender.y)
			.stroke({ color: 0x000000, width: 2 });
	}

	//create UI
	const menu = new RadioGroup({
		items: [
			new CheckBox({
				style: {
					unchecked: `switch_off.png`,
					checked: `switch_on.png`,
				},
			}),
			new CheckBox({
				style: {
					unchecked: `switch_off.png`,
					checked: `switch_on.png`,
				},
			}),
			new CheckBox({
				style: {
					unchecked: `switch_off.png`,
					checked: `switch_on.png`,
				},
			}),
		],
		type: "vertical",
		elementsMargin: 8,
	});
	//create viewport
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

	//enable viewport interaction plugins
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
		
	//prevent click event during viewport movement
	let cameraMoving = false;
	let moveEndTimer: number | null = null;
	const MOVE_IDLE_DELAY = 50; // ms after last movement to consider stable

	viewport.on("moved", () => {
		cameraMoving = true;

		if (moveEndTimer !== null) {
			clearTimeout(moveEndTimer);
		}

		moveEndTimer = window.setTimeout(() => {
			cameraMoving = false;
			moveEndTimer = null;
		}, MOVE_IDLE_DELAY);
	});

	//update
	app.ticker.maxFPS = 30;
	app.ticker.add(() => {
		updateLine();
		tiles.forEach((tile) => {
			tile.update();
		});
		defender.update();
	});

	//define hierarchy
	document.body.appendChild(app.canvas);
	app.stage.addChild(menu);
	app.stage.addChild(viewport);
	viewport.addChild(main);
})();
