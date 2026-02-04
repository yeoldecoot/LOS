import { Graphics } from "pixi.js";
import Hex from "./models/Hex";
import Point from "./models/Point";
import HexUtils from "./HexUtils";
import { Layout } from "./Layout";

class HexTile extends Hex {
	constructor(q: number, r: number, s: number) {
		super(q, r, s);
	}
}

class HexView {
	gfx: Graphics;
	tile: HexTile;
	pos: Point;
	constructor(tile: HexTile, layout: Layout) {
		this.tile = tile;
		this.gfx = new Graphics();
		this.pos = HexUtils.hexToPixel(tile, layout.layout);
		this.draw(layout);
	}
	draw(layout: Layout) {
		this.gfx.clear();
		this.gfx.poly(layout.cornerPoints);
		this.gfx.stroke({ width: 2, color: 0x000000 });
		const { x, y } = HexUtils.hexToPixel(this.tile, layout.layout);
		this.gfx.position.set(x, y);
	}
}

class HexGrid {
	tiles = new Map<string, HexTile>();
	views = new Map<string, HexView>();
	constructor(layout: Layout) {
		const mapWidth = layout.layout.size.x;
		const mapHeight = layout.layout.size.y;
		for (let q = 0; q < mapWidth; q++) {
			const rOffset = Math.floor(q / 2); // column-based offset

			for (let r = -rOffset; r < mapHeight - rOffset; r++) {
				const s = -q - r;
				const key = `${q},${r},${s}`;

				// --- Model ---
				const tile = new HexTile(q, r, s);

				// --- View ---
				const view = new HexView(tile, layout);

				// --- Store ---
				this.tiles.set(key, tile);
				this.views.set(key, view);

				// --- Add to renderer ---
				layout.addChild(view.gfx);
			}
		}
	}
}
export default HexGrid;
