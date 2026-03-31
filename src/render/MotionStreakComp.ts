import { Color, Color4B } from "safex-webgl"
import { MotionStreak } from "safex-webgl/motion-streak"
import { ComponentX } from "../core/decorator"
import { NodeComp } from "../core/NodeComp"
import { GameWorld } from "../gworld"
import { registerSystem } from "../helper"

interface MotionStreakProps {
  spriteFrame: string
  fade?: number
  minSeg?: number
  stroke?: number
  color?: Color4B
}
export class MotionStreakComp extends ComponentX<MotionStreakProps & { $ref?: MotionStreakComp }, MotionStreak> {

  render() {
    const { spriteFrame, fade, minSeg, stroke, color } = this.props
    const node = new MotionStreak(
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
registerSystem(MotionStreakComp)