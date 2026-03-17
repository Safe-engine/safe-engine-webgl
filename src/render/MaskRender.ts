import { ClippingNode, Color, Node, Size, Sprite } from "safex-webgl"
import { LayerColor } from "safex-webgl/core/layers"
import { ComponentX } from "../core/decorator"
import { NodeComp } from "../core/NodeComp"
import { GameWorld } from "../gworld"
import { registerSystem } from "../helper"

interface MaskRenderProps {
  spriteFrame?: string
  cropSize?: Size
  alphaThreshold?: number
  inverted?: boolean
}
export class MaskRender extends ComponentX<MaskRenderProps, ClippingNode> {
  render() {
    const { inverted, spriteFrame, cropSize, alphaThreshold = 0.05 } = this.props
    let stencil: Node
    if (cropSize) {
      const { width, height } = cropSize
      stencil = new LayerColor(Color.WHITE, width, height)
    } else {
      stencil = new Sprite(spriteFrame)
    }
    const clipper = new ClippingNode(stencil)
    clipper.setAlphaThreshold(!spriteFrame ? 1 : alphaThreshold)
    clipper.setInverted(inverted)

    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(clipper, entity))
    const comp = entity.assign(this)
    return comp
  }
}
registerSystem(MaskRender)
