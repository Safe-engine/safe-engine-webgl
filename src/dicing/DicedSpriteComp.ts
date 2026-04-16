import { textureCache } from "safex-webgl"
import { ComponentX } from "../core/decorator"
import { NodeComp } from "../core/NodeComp"
import { GameWorld } from "../gworld"
import { registerSystem } from "../helper"
import { DicedSprite } from "./DicedSprite"

interface DicedSpriteProps {
  texture: string
  data?: any
}
export class DicedSpriteComp extends ComponentX<DicedSpriteProps & { $ref?: DicedSpriteComp }, DicedSprite> {

  render() {
    const { data, texture } = this.props
    const tex = textureCache.getTextureForKey(texture)
    const node = new DicedSprite(data, tex)

    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(node, entity))
    const comp = entity.assign(this)
    return comp
  }
}
registerSystem(DicedSpriteComp)