import { Color, Color4B } from "safex-webgl"
import { ComponentX } from "../core/decorator"
import { NodeComp } from "../core/NodeComp"
import { GameWorld } from "../gworld"
import { registerSystem } from "../helper"
import { DicedSprite } from "./DicedSprite"

interface DicedSpriteProps {
  spriteFrame: string
  fade?: number
  minSeg?: number
  stroke?: number
  color?: Color4B
}
export class DicedSpriteComp extends ComponentX<DicedSpriteProps & { $ref?: DicedSpriteComp }, DicedSprite> {

  render() {
    const { spriteFrame, fade, minSeg, stroke, color } = this.props
    const node = new DicedSprite(
      fade || 0.4, // fade (vệt tồn tại 0.4s)
      minSeg || 1, // minSeg
      stroke || 20, // stroke (độ rộng vệt)
      color || Color.WHITE,
      spriteFrame,
    )

    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(node, entity))
    const comp = entity.assign(this)
    return comp
  }
}
registerSystem(DicedSpriteComp)