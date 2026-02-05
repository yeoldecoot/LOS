import { Orientation } from "./models/Orientation";
import { Point } from "pixi.js";

type Size = { x: number; y: number };
export type LayoutDimension = {
	size: Size;
	orientation: Orientation;
	origin: Size;
	spacing: number;
};

const LAYOUT_FLAT = new Orientation(
	3.0 / 2.0,
	0.0,
	Math.sqrt(3.0) / 2.0,
	Math.sqrt(3.0),
	2.0 / 3.0,
	0.0,
	-1.0 / 3.0,
	Math.sqrt(3.0) / 3.0,
	0.0,
);

export const layout: LayoutDimension = {
	size: { x: 50, y: 50 },
	orientation: LAYOUT_FLAT,
	origin: { x: 0, y: 0 },
	spacing: 1,
};

export function polyPoint(
	circumradius = layout.size.x,
	angle: number = 0,
	center: Point = new Point(0, 0),
) {
	const corners: Point[] = [];

	for (let i = 0; i < 6; i++) {
		const x = circumradius * Math.cos((2 * Math.PI * i) / 6 + angle);
		const y = circumradius * Math.sin((2 * Math.PI * i) / 6 + angle);
		const point = new Point(center.x + x, center.y + y);
		corners.push(point);
	}

	return corners;
}
