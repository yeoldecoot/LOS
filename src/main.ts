import { Application, Container, Graphics, extensions, CullerPlugin } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Tile } from "./Tile";
import { Hex } from "./hexgrid/models/Hex"
import { layout } from "./hexgrid/Layout";
import { initDevtools } from "@pixi/devtools";

(async () => {

	// ----------------- LOS ----------------- //

	// dot product between hex A and B
	function dot(a: Hex, b: Hex) {
		return a.q * b.q + a.r * b.r;
	}

	// Check if line AB crosses hex
	function lineCrossesHex(A: Hex, B: Hex, hex: Tile) {
		// define the 6 vertices of the given hex
		const vertices = [];
		vertices.push(new Hex(hex.hex.q + 2 / 3, hex.hex.r - 1 / 3, hex.hex.s - 1 / 3));
		vertices.push(new Hex(hex.hex.q + 1 / 3, hex.hex.r + 1 / 3, hex.hex.s - 2 / 3));
		vertices.push(new Hex(hex.hex.q - 1 / 3, hex.hex.r + 2 / 3, hex.hex.s - 1 / 3));
		vertices.push(new Hex(hex.hex.q - 2 / 3, hex.hex.r + 1 / 3, hex.hex.s + 1 / 3));
		vertices.push(new Hex(hex.hex.q - 1 / 3, hex.hex.r - 1 / 3, hex.hex.s + 2 / 3));
		vertices.push(new Hex(hex.hex.q + 1 / 3, hex.hex.r - 2 / 3, hex.hex.s + 1 / 3));
		// define the line between hex A and hex B
		const V = new Hex(B.q - A.q, B.r - A.r, B.s - A.s);
		// define the line orthogonal to line AB
		const N = new Hex(-V.r, V.q, V.r - V.q);
		// test each vertex to see which half plane the vertex falls on
		let pos = 0, neg = 0;
		let count = 0;
		for (const P of vertices) {
			const D = dot(N, new Hex(P.q - A.q, P.r - A.r, P.s - A.s));
			const EPSILON = 1e-9;
			if (D > EPSILON) pos++;
			if (D < -EPSILON) neg++;
			if (Math.abs(D) <= EPSILON) {
				count++;
			}
		}
		if (count > 1) {
			pos++;
			neg++;
			hex.defendersChoice = true;
		}
		return pos > 0 && neg > 0;
	}

	function updateLOS() {
		tiles.forEach((hex) => {
			hex.blocked = false;
			hex.intervening = false;
			hex.defendersChoice = false;
		});
		const hexA = attacker;
		const hexB = defender;
		// Determine candidate rectangle in cube coordinates
		const minQ = Math.min(hexA.hex.q, hexB.hex.q);
		const maxQ = Math.max(hexA.hex.q, hexB.hex.q);
		const minR = Math.min(hexA.hex.r, hexB.hex.r);
		const maxR = Math.max(hexA.hex.r, hexB.hex.r);
		// for each candidate in the box, check for collision
		const candidates: Tile[] = [];
		for (let q = minQ; q <= maxQ; q++) {
			for (let r = minR; r <= maxR; r++) {
				const s = -q - r;

				if ((q === hexA.hex.q && r === hexA.hex.r) || (q === hexB.hex.q && r === hexB.hex.r)) continue;

				const hex = tiles.find(h => h.hex.q === q && h.hex.r === r && h.hex.s === s);
				if (lineCrossesHex(hexA.hex, hexB.hex, <Tile>hex)) {
					candidates.push(<Tile>hex);
				}
			}
		}
		// need to find the right sorting order...
		candidates.sort((a, b) => {
			const da = Math.abs(a.hex.q) + Math.abs(a.hex.r);
			const db = Math.abs(b.hex.q) + Math.abs(b.hex.r);
			if (da !== db) return da - db;
			return (a.hex.r - b.hex.r) || (a.hex.q - b.hex.q);
		});
		let totalWoods = 0;
		let blocked = false;
		let count = 0;
		for (const candidate of candidates) {
			candidate.intervening = true;
			candidate.blocked = blocked;
			// if there are too many woods in the way block LOS
			if (candidate.woods) {
				totalWoods += candidate.woods;
			}
			if (totalWoods >= 3) {
				blocked = true;
			}

			count++;
			if (count > 2) {
				count = 0;
				candidate.defendersChoice = false;
			}
		}
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
			const tile = new Tile(q, r, s,0xffffff,0);
			tile.gfx.interactive = true;
			tile.gfx.onclick = () => {
				defender.hex = tile.hex;
				updateLOS();
			};
			main.addChild(tile.gfx);
			tiles.push(tile);
		}
	}

	//create attacker and defender tiles

	const attacker = new Tile(20,10,-30,0xa52422)
	main.addChild(attacker.gfx);

	const defender = new Tile(20,10,-30,0x759AAB)
	main.addChild(defender.gfx)

	const line = new Graphics();
	main.addChild(line);

	function updateLine() {
		line.clear().moveTo(attacker.x, attacker.y).lineTo(defender.x,defender.y).stroke({ color: 0x000000, width: 2 });
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

	//update
	app.ticker.maxFPS = 30;
	app.ticker.add(() => {
		updateLine();
		tiles.forEach(tile => {
			tile.update();
		});
		defender.update();
	});

	//define hierarchy
	document.body.appendChild(app.canvas);
	app.stage.addChild(viewport);
	viewport.addChild(main);
})();
