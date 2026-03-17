import { ParticleSystem } from "safex-webgl/particle"
import { ComponentX } from "../core/decorator"
import { NodeComp } from "../core/NodeComp"
import { GameWorld } from "../gworld"
import { registerSystem } from "../helper"

interface ParticleCompProps {
  plistFile: string
}

export class ParticleComp extends ComponentX<ParticleCompProps, ParticleSystem> {
  render() {
      const { plistFile } = this.props
      const node = new ParticleSystem(plistFile)

    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(node, entity))
    const comp = entity.assign(this)
    return comp
  }
}
registerSystem(ParticleComp)
