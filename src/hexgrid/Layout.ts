import { Orientation } from "./models/Orientation"

export type Size = { x: number; y: number }
export type LayoutDimension = {
  size: Size
  orientation: Orientation
  origin: Size
  spacing: number
}