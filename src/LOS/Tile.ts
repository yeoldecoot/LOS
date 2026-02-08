import { Graphics, Sprite, Container } from "pixi.js";
import { Hex } from "../hexgrid/models/Hex";
import { HexUtils } from "../hexgrid/HexUtils";
import { layout } from "../hexgrid/Layout";
import { polyPoint } from "../hexgrid/Layout";
import { lightWoods, heavyWoods, waterTex } from "./Textures";

export class Tile {
	hex: Hex;
	container: Container;
	gfx: Graphics;
	color: number;
	alpha: number;
	sprite: Sprite;
	x = 0;
	y = 0;
	attacker = false;
	defender = false;
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
		({ x: this.x, y: this.y } = HexUtils.hexToPixel(this.hex, layout));
		this.container.position.set(this.x, this.y);
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
		this.updateSprite();
		if (this.intervening) {
			if (this.defendersChoice) {
				this.draw(0xff00ff, 0.5);
			} else {
				this.draw(0x555555, 1);
			}
		} else if (this.attacker) {
			this.draw(0xa52422, 1);
		} else if (this.defender) {
			this.draw(0x759aab, 1);
		} else {
			this.draw(this.color, this.alpha);
		}
	}
	private updateSprite() {
		if (this.woods === 1) this.sprite.texture = lightWoods;
		if (this.woods === 2) this.sprite.texture = heavyWoods;
		if (this.water === true) this.sprite.texture = waterTex;
	}
	private draw(color: number, alpha: number) {
		this.gfx
			.clear()
			.poly(polyPoint())
			.fill({ color, alpha })
			.stroke({ width: 2, color: 0x000000 });
	}

	increaseWoods() {
		this.water = false;
		if (!this.woods) {
			this.woods = 1;
		} else if (this.woods === 1) {
			this.woods = 2;
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
