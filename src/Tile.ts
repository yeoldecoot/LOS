import { Graphics } from "pixi.js";
import { Hex } from "./hexgrid/models/Hex";
import { HexUtils } from "./hexgrid/HexUtils";
import { layout } from "./hexgrid/Layout";
import { polyPoint } from "./hexgrid/Layout";

export class Tile {
	hex: Hex;
	gfx: Graphics;
	color: number;
	alpha: number;
	x = 0;
	y = 0;
	constructor(q: number, r: number, s: number, color = 0xffffff, alpha = 1) {
		this.hex = new Hex(q, r, s);
		this.gfx = new Graphics();
		this.color = color;
		this.alpha = alpha;
		this.draw();
	}
	draw() {
		({ x: this.x, y: this.y } = HexUtils.hexToPixel(this.hex, layout));
		this.gfx
			.clear()
			.poly(polyPoint())
			.fill({ color: this.color, alpha: this.alpha })
			.stroke({ width: 2, color: 0x000000 });
	}
}
export default Tile;
