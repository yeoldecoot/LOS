import { Container, Point as PixiPoint } from "pixi.js";
import { Orientation } from "./models/Orientation";
import { Point } from "./models/Point";

export type Size = { x: number; y: number };

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

const LAYOUT_POINTY = new Orientation(
	Math.sqrt(3.0),
	Math.sqrt(3.0) / 2.0,
	0.0,
	3.0 / 2.0,
	Math.sqrt(3.0) / 3.0,
	-1.0 / 3.0,
	0.0,
	2.0 / 3.0,
	0.5,
);

const defaultSize = new Point(10, 10);
const defaultOrigin = new Point(0, 0);
const defaultSpacing = 1.0;

/**
 * Calculates the 6 corner points of a hexagon.
 */
function calculateCoordinates(
	circumradius: number,
	angle: number = 0,
	center: Point = new Point(0, 0),
): Point[] {
	const corners: Point[] = [];

	for (let i = 0; i < 6; i++) {
		const x = circumradius * Math.cos((2 * Math.PI * i) / 6 + angle);
		const y = circumradius * Math.sin((2 * Math.PI * i) / 6 + angle);
		corners.push(new Point(center.x + x, center.y + y));
	}

	return corners;
}

/**
 * PixiJS Layout container that replaces the React Layout component.
 * Holds layout configuration and precomputed hex corner points.
 */
export class Layout extends Container {
	public layout: LayoutDimension;
	public points: string;
	public cornerPoints: PixiPoint[];

	constructor(options?: {
		size?: Size;
		flat?: boolean;
		spacing?: number;
		origin?: Size;
	}) {
		super();

		const size = options?.size ?? defaultSize;
		const flat = options?.flat ?? true;
		const spacing = options?.spacing ?? defaultSpacing;
		const origin = options?.origin ?? defaultOrigin;

		const orientation = flat ? LAYOUT_FLAT : LAYOUT_POINTY;
		const angle = flat ? 0 : Math.PI / 6;

		const cornerCoords = calculateCoordinates(size.x, angle);

		this.points = cornerCoords.map((p) => `${p.x},${p.y}`).join(" ");
		this.cornerPoints = cornerCoords.map((p) => new PixiPoint(p.x, p.y));

		this.layout = {
			size,
			orientation,
			origin,
			spacing,
		};
	}
}

export default Layout;
