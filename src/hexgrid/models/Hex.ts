import { Graphics } from "pixi.js"

export interface HexCoordinates {
  q: number
  r: number
  s: number
}

export class Hex {
    q: number
    r: number
    s: number
    gfx: Graphics
    constructor(q: number, r: number, s: number) {
        this.q = q;
        this.r = r;
        this.s = s;
        this.gfx = new Graphics;
    }
    draw() {
        this.gfx.clear();
        
    }
}
export default Hex;