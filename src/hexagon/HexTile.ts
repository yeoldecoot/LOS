import Hex from "./models/Hex";

class HexTile extends Hex {
	intervening: boolean;
	woods: number;

	constructor(q: number, r: number, s: number) {
		super(q, r, s);
		this.intervening = false;
		this.woods = 0;
	}
}
export default HexTile;
