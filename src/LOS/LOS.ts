import { HexUtils } from "../hexgrid/HexUtils";
import { Hex } from "../hexgrid/models/Hex";
import { Tile } from "./Tile";
import { layout } from "../hexgrid/Layout";

// dot product between hex A and B
function dot(a: Hex, b: Hex) {
	return a.q * b.q + a.r * b.r;
}

// Check if line AB crosses hex
function lineCrossesHex(A: Hex, B: Hex, hex: Tile) {
	// define the 6 vertices of the given hex
	const vertices = [];
	vertices.push(
		new Hex(hex.hex.q + 2 / 3, hex.hex.r - 1 / 3, hex.hex.s - 1 / 3),
	);
	vertices.push(
		new Hex(hex.hex.q + 1 / 3, hex.hex.r + 1 / 3, hex.hex.s - 2 / 3),
	);
	vertices.push(
		new Hex(hex.hex.q - 1 / 3, hex.hex.r + 2 / 3, hex.hex.s - 1 / 3),
	);
	vertices.push(
		new Hex(hex.hex.q - 2 / 3, hex.hex.r + 1 / 3, hex.hex.s + 1 / 3),
	);
	vertices.push(
		new Hex(hex.hex.q - 1 / 3, hex.hex.r - 1 / 3, hex.hex.s + 2 / 3),
	);
	vertices.push(
		new Hex(hex.hex.q + 1 / 3, hex.hex.r - 2 / 3, hex.hex.s + 1 / 3),
	);
	// define the line between hex A and hex B
	const V = new Hex(B.q - A.q, B.r - A.r, B.s - A.s);
	// define the line orthogonal to line AB
	const N = new Hex(-V.r, V.q, V.r - V.q);
	// test each vertex to see which half plane the vertex falls on
	let pos = 0,
		neg = 0;
	let count = 0;
	for (const P of vertices) {
		const D = dot(N, new Hex(P.q - A.q, P.r - A.r, P.s - A.s));
		const EPSILON = 1e-9;
		if (D > EPSILON) pos++;
		if (D < -EPSILON) neg++;
		if (Math.abs(D) <= EPSILON) {
			count++;
		}
	}
	if (count > 1) {
		pos++;
		neg++;
		hex.defendersChoice = true;
	}
	return pos > 0 && neg > 0;
}

export function updateLOS(tiles: Tile[], hexA: Tile, hexB: Tile) {
	tiles.forEach((hex) => {
		hex.blocked = false;
		hex.dcBlocked = false;
		hex.intervening = false;
		hex.partialCover = false;
		hex.inversePartialCover = false;
		hex.defendersChoice = false;
	});

	const a = HexUtils.hexToPixel(hexA.hex, layout);
	const b = HexUtils.hexToPixel(hexB.hex, layout);
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len2 = dx * dx + dy * dy;

	const minQ = Math.min(hexA.hex.q, hexB.hex.q);
	const maxQ = Math.max(hexA.hex.q, hexB.hex.q);
	const minR = Math.min(hexA.hex.r, hexB.hex.r);
	const maxR = Math.max(hexA.hex.r, hexB.hex.r);
	const candidates: Tile[] = [];
	for (let q = minQ; q <= maxQ; q++) {
		for (let r = minR; r <= maxR; r++) {
			const s = -q - r;

			if (
				(q === hexA.hex.q && r === hexA.hex.r) ||
				(q === hexB.hex.q && r === hexB.hex.r)
			)
				continue;

			const hex = tiles.find(
				(h) => h.hex.q === q && h.hex.r === r && h.hex.s === s,
			);
			if (hex) {
				if (lineCrossesHex(hexA.hex, hexB.hex, <Tile>hex)) {
					candidates.push(<Tile>hex);
				}
			}
		}
	}
	candidates.sort((h1, h2) => {
		const p1 = HexUtils.hexToPixel(h1.hex, layout);
		const p2 = HexUtils.hexToPixel(h2.hex, layout);

		const t1 = ((p1.x - a.x) * dx + (p1.y - a.y) * dy) / len2;
		const t2 = ((p2.x - a.x) * dx + (p2.y - a.y) * dy) / len2;

		return t1 - t2;
	});
	let blocked = false;
	if (candidates.some((candidate) => candidate.defendersChoice)) {
		const lineOne: Tile[] = [];
		const lineTwo: Tile[] = [];
		let blockedOne = false;
		let blockedTwo = false;
		let count = 0;
		candidates.forEach((candidate) => {
			count++;
			if (count === 1) lineOne.push(candidate);
			if (count === 2) lineTwo.push(candidate);
			if (count === 3) {
				count = 0;
				lineOne.push(candidate);
				lineTwo.push(candidate);
			}
		});
		if (losLogic(hexA, hexB, lineOne)) blockedOne = true;
		if (losLogic(hexA, hexB, lineTwo)) blockedTwo = true;
		if (blockedOne && blockedTwo) blocked = true;
		else if (blockedOne || blockedTwo) {
			if (blockedOne) {
				lineOne.forEach((candidate) => {
					candidate.dcBlocked = true;
				});
			}
			if (blockedTwo) {
				lineTwo.forEach((candidate) => {
					if (blockedTwo) candidate.dcBlocked = true;
				});
			}
			hexA.dcBlocked = true;
			hexB.dcBlocked = true;
		}
	} else {
		if (losLogic(hexA, hexB, candidates)) blocked = true;
	}
	candidates.forEach((candidate) => {
		candidate.blocked = blocked;
	});
	hexA.blocked = blocked;
	hexB.blocked = blocked;
}

function losLogic(hexA: Tile, hexB: Tile, candidates: Tile[]) {
	const firingHeight = Math.max(hexA.elevation, hexB.elevation) + 2;
	let totalWoods = 0;
	let blocked = false;
	let count = 0;
	//LOS is blocked if one mech is fully submerged and the other isn't
	if (losWater(hexA, hexB)) blocked = true;
	//LOS is blocked if the adjacent hex of either mechs is level 2 or more
	if (candidates.length > 0) {
		if (candidates[0].elevation - hexA.elevation >= 2) blocked = true;
		if (
			candidates[0].elevation - hexA.elevation === 1 &&
			firingHeight <= hexA.elevation + 2
		)
			hexA.partialCover = true;
		if (candidates[candidates.length - 1].elevation - hexB.elevation >= 2)
			blocked = true;
		if (
			candidates[candidates.length - 1].elevation - hexB.elevation ===
				1 &&
			firingHeight <= hexB.elevation + 2
		)
			hexB.partialCover = true;
	}
	for (const candidate of candidates) {
		candidate.intervening = true;
		count++;
		if (count >= 2) {
			count = 0;
			candidate.defendersChoice = false;
		}
		// elevation based LOS
		if (candidate.elevation >= firingHeight) blocked = true;
		// if there are too many woods in the way block LOS
		if (candidate.woods && candidate.elevation >= firingHeight - 2)
			totalWoods += candidate.woods;
		if (totalWoods >= 3) blocked = true;
	}
	return blocked;
}

function losWater(attacker: Tile, defender: Tile) {
	//get the state of attacker and defender
	const attackerSubmerged = attacker.elevation <= -2 && attacker.water;
	const attackerPartiallySubmerged =
		attacker.elevation === -1 && attacker.water && !attackerSubmerged;
	const defenderSubmerged = defender.elevation <= -2 && defender.water;
	const defenderPartiallySubmerged =
		defender.elevation === -1 && defender.water && !defenderSubmerged;
	//if only one mech is partially submerged, add partial cover
	if (attackerPartiallySubmerged && !defender.water)
		attacker.partialCover = true;
	if (defenderPartiallySubmerged && !attacker.water)
		attacker.partialCover = true;
	//if one mech is partially submerged and the other is fully submerged, add inverse partial cover
	if (attackerPartiallySubmerged && defenderSubmerged)
		attacker.inversePartialCover = true;
	if (defenderPartiallySubmerged && attackerSubmerged)
		defender.inversePartialCover = true;

	if (
		attackerSubmerged != defenderSubmerged &&
		!defenderPartiallySubmerged &&
		!attackerPartiallySubmerged
	)
		return true;
	return false;
}
