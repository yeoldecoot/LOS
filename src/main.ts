import {
	Application,
	Container,
	Graphics,
	extensions,
	CullerPlugin,
	Assets,
	Sprite,
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
			tile.container.interactive = true;
			tile.container.onpointertap = () => {
				if (cameraMoving) return;
				if (menu.selected === 0) {
					defender.hex = tile.hex;
				} else if (menu.selected === 1) {
					tile.increaseWoods();
				}
				updateLOS(tiles, attacker, defender);
			};
			main.addChild(tile.container);
			tiles.push(tile);
		}
	}

	//create attacker and defender tiles and the line drawn between them
	const attacker = new Tile(20, 10, -30, 0xa52422);
	main.addChild(attacker.container);

	const defender = new Tile(20, 10, -30, 0x759aab);
	main.addChild(defender.container);

	const line = new Graphics();
	main.addChild(line);

	function updateLine() {
		line.clear()
			.moveTo(attacker.x, attacker.y)
			.lineTo(defender.x, defender.y)
			.stroke({ color: 0x000000, width: 2 });
	}

	//create UI
	const scale = 0.2;
	const cursorTex = await Assets.load("assets/cursor.png");
	const treeTex = await Assets.load("assets/tree.png");
	const menu = new RadioGroup({
		items: [
			new CheckBox({
				style: {
					unchecked: new Sprite({
						scale: scale,
						texture: cursorTex,
						tint: 0xffffff,
					}),
					checked: new Sprite({
						scale: scale,
						texture: cursorTex,
						tint: 0xffffff,
					}),
				},
			}),
			new CheckBox({
				style: {
					unchecked: new Sprite({
						scale: scale,
						texture: treeTex,
						tint: 0xffffff,
					}),
					checked: new Sprite({
						scale: scale,
						texture: treeTex,
						tint: 0x555555,
					}),
				},
			}),
		],
		type: "vertical",
		elementsMargin: 8,
	});

	if (menu.innerView) {
		menu.innerView.padding = 10;
	}
	menu.interactive = true;

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
	});
	viewport.on("pointerup", () => {
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
		defender.update();
		updateLine();
		tiles.forEach((tile) => {
			tile.update();
		});
	});

	//define hierarchy
	document.body.appendChild(app.canvas);
	app.stage.addChild(viewport);
	app.stage.addChild(menu);
	viewport.addChild(main);
})();
