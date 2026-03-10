import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '../core/NodeComp'
import { GameWorld } from '../gworld'
import { instantiate } from '../helper'
import { BoxCollider, CircleCollider, Collider, CollisionType, Contract, PolygonCollider } from './CollideComponent'

export function shouldCollider(colA: Collider, colB: Collider) {
  const groupA = colA.props.tag
  const groupB = colB.props.tag
  if (groupA === undefined || groupB === undefined) {
    return true
  }
  const { colliderMatrix } = GameWorld.Instance.systems.get(CollideSystem)
  return colliderMatrix[groupA][groupB]
}

export class CollideSystem implements System {
  static debugWidth = 3
  static debugColor = Color.DEBUG_BORDER_COLOR
  listColliders: Collider[] = []
  _contracts: Contract[] = []
  removeColliders = []
  debugGraphics: DrawNode
  enabledDebugDraw = false
  enabled = true
  colliderMatrix = [[true]]

  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, BoxCollider, this.onAddCollider.bind(this))
    event_manager.subscribe(EventTypes.ComponentAdded, CircleCollider, this.onAddCollider.bind(this))
    event_manager.subscribe(EventTypes.ComponentAdded, PolygonCollider, this.onAddCollider.bind(this))
    event_manager.subscribe(EventTypes.ComponentRemoved, BoxCollider, this.onRemoveCollider.bind(this))
    event_manager.subscribe(EventTypes.ComponentRemoved, CircleCollider, this.onRemoveCollider.bind(this))
    event_manager.subscribe(EventTypes.ComponentRemoved, PolygonCollider, this.onRemoveCollider.bind(this))
  }

  private onAddCollider = ({ entity, component }) => {
    let collider = entity.getComponent(Collider)
    if (!collider) {
      collider = entity.assign(instantiate(Collider))
    }
    // console.log('onAddCollider', component, collider)
    collider.node = entity.getComponent(NodeComp)
    component.node = entity.getComponent(NodeComp)
    this.addCollider(component)
  }

  private onRemoveCollider = ({ component }) => {
    this.removeColliders.push(component.getComponent(Collider))
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (!this.enabled) {
      return
    }
    this.listColliders.forEach((collider) => {
      if (!sys.isObjectValid(collider.node.instance)) {
        this.removeColliders.push(collider)
      }
    })
    // this.removeColliders.forEach(comp => {
    //   this.listColliders = this.listColliders.filter(col => !col.isEqual(comp)
    //     && sys.isObjectValid(col.node.instance));
    //   this._contracts = this._contracts.filter(contract => {
    //     const col1 = contract._collider1;
    //     const col2 = contract._collider2;
    //     if (col1.isEqual(comp) || !sys.isObjectValid(col1.node.instance)) {
    //       if (contract._touching) {
    //         col2.node.emit('onCollisionExit', col1, col2);
    //       }
    //       return false;
    //     }
    //     if (col2.isEqual(comp) || !sys.isObjectValid(col2.node.instance)) {
    //       if (contract._touching) {
    //         col1.node.emit('onCollisionExit', col2, col1);
    //       }
    //       return false;
    //     }
    //     return true;
    //   }
    //   );
    // });
    this.removeColliders = []
    let draw
    const { enabledDebugDraw, debugGraphics } = this
    if (enabledDebugDraw) {
      draw = debugGraphics
      draw.clear()
      //   this.listColliders.forEach(collider => {
      //     if (collider.node && collider.node.active) {
      //       collider.update(dt, draw);
      //     }
      //   });
      // } else {
      //   this.listColliders.forEach(collider => {
      //     if (collider.node && collider.node.active) {
      //       collider.update(dt);
      //     }
      //   });
    }
    for (const entt of entities.entities_with_components(BoxCollider)) {
      const comp = entt.getComponent(BoxCollider)
      comp.update(dt, draw)
    }
    for (const entt of entities.entities_with_components(CircleCollider)) {
      const comp = entt.getComponent(CircleCollider)
      comp.update(dt, draw)
    }
    for (const entt of entities.entities_with_components(PolygonCollider)) {
      const comp = entt.getComponent(PolygonCollider)
      comp.update(dt, draw)
    }
    this._contracts.forEach((contract) => {
      const col1 = contract._collider1
      const col2 = contract._collider2
      if (
        !sys.isObjectValid(col1.node.instance) ||
        !sys.isObjectValid(col2.node.instance) ||
        !col1.node ||
        !col2.node ||
        !col1.node.active ||
        !col2.node.active
      ) {
        return
      }
      const type = contract.updateState()
      switch (type) {
        case CollisionType.ENTER: {
          if (col1.props.onCollisionEnter) {
            col1.props.onCollisionEnter(col2)
          }
          if (col2.props.onCollisionEnter) {
            col2.props.onCollisionEnter(col1)
          }
          break
        }
        case CollisionType.STAY:
          if (col1.props.onCollisionStay) {
            col1.props.onCollisionStay(col2)
          }
          if (col2.props.onCollisionStay) {
            col2.props.onCollisionStay(col1)
          }
          break
        case CollisionType.EXIT:
          if (col1.props.onCollisionExit) {
            col1.props.onCollisionExit(col2)
          }
          if (col2.props.onCollisionExit) {
            col2.props.onCollisionExit(col1)
          }
          break

        default:
          break
      }
    })
  }
  addCollider(collider: Collider) {
    this.listColliders.forEach((col) => {
      if (shouldCollider(col, collider)) {
        this._contracts.push(new Contract(col, collider))
      }
    })
    this.listColliders.push(collider)
  }

  removeCollider(collider: Collider) {
    this.removeColliders.push(collider)
  }

  addDebugNode(root: Scene) {
    this.debugGraphics = new DrawNode()
    root.addChild(this.debugGraphics, 1000)
  }
  toggleDebugDraw(enable = true) {
    this.enabledDebugDraw = enable
    this.addDebugNode(director.getRunningScene())
  }
}
