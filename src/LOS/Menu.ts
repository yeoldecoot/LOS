import { Sprite } from "pixi.js";
import { CheckBox, RadioGroup } from "@pixi/ui";
import { cursorTex, lightWoods, waterTex } from "./Textures";
//create UI
const scale = 0.2;

export const menu = new RadioGroup({
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
					texture: lightWoods,
					tint: 0xffffff,
				}),
				checked: new Sprite({
					scale: scale,
					texture: lightWoods,
					tint: 0x555555,
				}),
			},
		}),
		new CheckBox({
			style: {
				unchecked: new Sprite({
					scale: scale,
					texture: waterTex,
					tint: 0xffffff,
				}),
				checked: new Sprite({
					scale: scale,
					texture: waterTex,
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
