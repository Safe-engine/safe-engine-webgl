import { NodeComp } from './NodeComp'

export class NodePool {
  items: NodeComp[] = []

  put(node: NodeComp) {
    if (node) {
      node.removeFromParent()
      node.entity.immortal = true
      this.items.push(node)
    }
  }

  get(): NodeComp {
    const node = this.items.pop()
    node.entity.immortal = false
    node.active = true
    return node
  }

  size() {
    return this.items.length
  }

  clear() {
    this.items.forEach((node) => node.destroy())
    this.items.length = 0
  }
}
