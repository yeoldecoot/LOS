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
    defendersChoice = false;
    intervening = false;
    blocked = false;
    woods = 0;
	constructor(q: number, r: number, s: number, color = 0xffffff, alpha = 1) {
		this.hex = new Hex(q, r, s);
		this.gfx = new Graphics();
		this.color = color;
        this.alpha = alpha;
		this.update();
	}
	update() {
        ({ x: this.x, y: this.y } = HexUtils.hexToPixel(this.hex, layout));
        if(this.intervening) {
            this.draw(0x555555,1)
        } else {
            this.draw(this.color,this.alpha);
        }
	}
    private draw(color: number, alpha: number) {
		this.gfx
			.clear()
			.poly(polyPoint())
			.fill({ color, alpha })
			.stroke({ width: 2, color: 0x000000 });
        this.gfx.position.set(this.x, this.y);
    }
}
export default Tile;
