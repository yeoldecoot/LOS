import { Graphics, Sprite, Assets, Container } from "pixi.js";
import { Hex } from "./hexgrid/models/Hex";
import { HexUtils } from "./hexgrid/HexUtils";
import { layout } from "./hexgrid/Layout";
import { polyPoint } from "./hexgrid/Layout";

const lightWoods = await Assets.load("assets/tree.png");
const heavyWoods = await Assets.load("assets/heavy.png");

export class Tile {
	hex: Hex;
	container: Container;
	gfx: Graphics;
	color: number;
	alpha: number;
	sprite: Sprite;
	x = 0;
	y = 0;
	defendersChoice = false;
	intervening = false;
	blocked = false;
	woods = 0;
	water = false;
	elevation = 0;
	constructor(q: number, r: number, s: number, color = 0xffffff, alpha = 1) {
		this.hex = new Hex(q, r, s);
		this.container = new Container();
		this.gfx = new Graphics();
		this.sprite = new Sprite();
		this.sprite.scale = 0.1;
		this.sprite.x = -25;
		this.sprite.y = -25;
		this.container.addChild(this.gfx);
		this.container.addChild(this.sprite);
		this.color = color;
		this.alpha = alpha;
		this.update();
	}
	update() {
		({ x: this.x, y: this.y } = HexUtils.hexToPixel(this.hex, layout));
		if (this.intervening) {
			if (this.defendersChoice) {
				this.draw(0xff00ff, 0.5);
			} else {
				this.draw(0x555555, 1);
			}
		} else {
			this.draw(this.color, this.alpha);
		}
	}
	private draw(color: number, alpha: number) {
		this.gfx
			.clear()
			.poly(polyPoint())
			.fill({ color, alpha })
			.stroke({ width: 2, color: 0x000000 });
		this.container.position.set(this.x, this.y);
	}
	increaseWoods() {
		this.water = false;
		if (!this.woods) {
			this.woods = 1;
			this.sprite.texture = lightWoods;
		} else if (this.woods === 1) {
			this.woods = 2;
			this.sprite.texture = heavyWoods;
		}
	}

	addWater() {
		this.woods = 0;
		this.water = true;
	}

	increaseElevation() {
		if (this.elevation) {
			this.elevation++;
		} else {
			this.elevation = 1;
		}
	}

	decreaseWoods() {
		if (!this.woods) {
			this.woods = 0;
		} else if (this.woods > 0) {
			this.woods--;
		}
	}

	removeWater() {
		this.water = false;
	}

	decreaseElevation() {
		if (this.elevation) {
			this.elevation--;
		} else {
			this.elevation = -1;
		}
	}
}
export default Tile;
