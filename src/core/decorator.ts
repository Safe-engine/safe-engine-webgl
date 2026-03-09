import { GameWorld } from '../gworld'
import { EnhancedComponent } from './EnhancedComponent'
import { NodeComp } from './NodeComp'

export class ComponentX<Props = object, C extends cc.Node = cc.Node> extends EnhancedComponent<Props, NodeComp<C>> {
  getRenderNode(): C {
    return this.node.instance
  }

  render?(): this
}

export function render() {
  const world = GameWorld.Instance
  const root = world.entities.create()
  const comp = root.assign(this)
  return comp
}
