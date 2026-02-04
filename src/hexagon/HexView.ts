import Point from "./models/Point";
import HexUtils from "./HexUtils";
import { Graphics } from "pixi.js";
import { Layout } from "./Layout";
import HexTile from "./HexTile";

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
export default HexView;
