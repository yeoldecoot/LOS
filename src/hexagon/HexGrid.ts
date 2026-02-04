import { Layout } from "./Layout";
import HexTile from "./HexTile";
import HexView from "./HexView";

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
