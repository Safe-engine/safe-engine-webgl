import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'
import { NodeComp } from '../core/NodeComp'
import { GameWorld } from '../gworld'
import { instantiate } from '../helper'
import { PhysicsBoxCollider, PhysicsCircleCollider, PhysicsPolygonCollider, RigidBody } from './PhysicsComponent'
import { PhysicsSprite } from './PhysicsSprite'

export const DynamicBody = 2
export const KinematicBody = 1
export const StaticBody = 0

export function setColliderMatrix(colliderMatrix = [[true]]) {
  const physicsSystem = GameWorld.Instance.systems.get(PhysicsSystem)
  physicsSystem.colliderMatrix = colliderMatrix
}

export class PhysicsSystem implements System {
  space: cp.Space
  _debugNode: PhysicsDebugNode
  listRemoveBody: cp.Body[] = []
  listRemoveShape: cp.Shape[] = []
  colliderMatrix = [[true]]

  configure(event_manager: EventManager) {
    this.space = new cp.Space()
    this.space.gravity = cp.v(0, -98)
    this.space.iterations = 60
    this.space.collisionSlop = 0.5
    this.space.setDefaultCollisionHandler(
      this.collisionBegin.bind(this),
      this.collisionPre.bind(this),
      this.collisionPost.bind(this),
      this.collisionSeparate.bind(this),
    )
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsBoxCollider, ({ entity, component: box }) => {
      // console.log('ComponentAddedEvent PhysicsBoxCollider', box)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = DynamicBody, density = 1, friction = 0.5, restitution = 0.3, isSensor, isLockRotate, tag = 0 } = rigidBody.props
      const { width, height, offset = [] } = box.props
      const [x = 0, y = 0] = offset
      const node = entity.getComponent(NodeComp)
      const hw = width * 0.5
      const hh = height * 0.5
      let shape: cp.Shape
      let body: cp.Body
      if (type === DynamicBody) {
        body = new cp.Body(density, isLockRotate ? Infinity : cp.momentForBox(density, width, height))
        shape = new cp.BoxShape2(body, new cp.BB(-hw + x, -hh + y, hw + x, hh + y))
        body.setPos(node.position)
        this.space.addShape(shape)
        this.space.addBody(body)
      } else {
        body = new cp.Body(Infinity, Infinity)
        body.nodeIdleTime = Infinity
        shape = new cp.BoxShape2(body, new cp.BB(-hw + x, -hh + y, hw + x, hh + y))
        this.space.addStaticShape(shape)
        body.setPos(node.position)
        this.space.reindexStatic()
      }
      shape.setElasticity(restitution)
      shape.setFriction(friction)
      shape.setSensor(isSensor)
      const physicsNode = new PhysicsSprite(node.instance, body)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      rigidBody.body = body
      body.data = node
      shape.group = tag
      box.node = node
    })
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsCircleCollider, ({ entity, component }) => {
      // console.log('ComponentAddedEvent PhysicsCircleCollider', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const {
        type = DynamicBody,
        isLockRotate,
        density = 1,
        friction = 0.5,
        restitution = 0.3,
        isSensor = false,
        tag = 0,
      } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const { radius, offset = [] } = component.props
      const [x = 0, y = 0] = offset
      const { width, height } = node.contentSize
      const { scaleX, scaleY, anchorX, anchorY } = node
      const offVect = new cp.Vect(x - width * anchorX * scaleX, y - height * scaleY * anchorY)
      let shape: cp.Shape
      let body: cp.Body
      if (type === DynamicBody) {
        body = new cp.Body(density, isLockRotate ? Infinity : cp.momentForCircle(density, radius, radius, offVect))
        shape = new cp.CircleShape(body, radius, offVect)
        body.setPos(node.position)
        this.space.addShape(shape)
        this.space.addBody(body)
      } else {
        body = new cp.Body(Infinity, Infinity)
        body.nodeIdleTime = Infinity
        shape = new cp.CircleShape(body, radius, offVect)
        this.space.addStaticShape(shape)
        body.setPos(node.position)
        this.space.reindexStatic()
      }
      shape.setElasticity(restitution)
      shape.setFriction(friction)
      shape.setSensor(isSensor)
      const physicsNode = new PhysicsSprite(node.instance, body)
      // console.log(position instanceof b2Vec2, zero instanceof b2Vec2)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      rigidBody.body = body
      body.data = node
      shape.group = tag
      component.node = node
    })
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsPolygonCollider, ({ entity, component }) => {
      // console.log('ComponentAddedEvent PhysicsPolygonCollider', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = DynamicBody, isLockRotate, density = 1, friction = 0.5, restitution = 0.3, isSensor, tag = 0 } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const { points, offset = [] } = component.props
      const [x = 0, y = 0] = offset
      const { width, height } = node.contentSize
      const { scaleX, scaleY, anchorX, anchorY } = node
      const offVect = new cp.Vect(x - width * anchorX * scaleX, y - height * scaleY * anchorY)
      const fixedPoints = []
      points.forEach((p) => {
        const px = p.x || p[0]
        const py = p.y || p[1]
        fixedPoints.push(px)
        fixedPoints.push(py)
      })
      let shape: cp.Shape
      let body: cp.Body
      if (type === DynamicBody) {
        body = new cp.Body(density, isLockRotate ? Infinity : cp.momentForPoly(density, fixedPoints, offVect))
        shape = new cp.PolyShape(body, fixedPoints, offVect)
        body.setPos(node.position)
        this.space.addShape(shape)
        this.space.addBody(body)
      } else {
        body = new cp.Body(Infinity, Infinity)
        body.nodeIdleTime = Infinity
        shape = new cp.PolyShape(body, fixedPoints, offVect)
        this.space.addStaticShape(shape)
        body.setPos(node.position)
        this.space.reindexStatic()
      }
      shape.setElasticity(restitution)
      shape.setFriction(friction)
      shape.setSensor(isSensor)
      const physicsNode = new PhysicsSprite(node.instance, body)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      rigidBody.body = body
      body.data = node
      shape.group = tag
      component.node = node
    })
    event_manager.subscribe(EventTypes.ComponentRemoved, RigidBody, ({ component }) => {
      // console.log('ComponentRemovedEvent RigidBody', component)
      if (component.enabled && component.physicSprite instanceof PhysicsSprite) {
        const body = component.physicSprite.getBody()
        if (body && (this.space.containsBody(body) || body.isStatic())) {
          body.shapeList.forEach((shape) => {
            if (shape && this.space.containsShape(shape)) {
              if (!this.listRemoveShape.includes(shape)) {
                this.listRemoveShape.push(shape)
              }
            }
          })
          this.listRemoveBody.push(body)
        }
      }
    })
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (this.space) {
      this.space.step(dt)
    }
    // this.space.addPostStepCallback(() => {
    // log('addPostStepCallback');
    this.listRemoveShape.forEach((shape) => {
      if (shape && this.space.containsShape(shape)) {
        this.space.removeShape(shape)
      }
    })
    this.listRemoveBody.forEach((body) => {
      if (body && this.space.containsBody(body)) {
        this.space.removeBody(body)
      }
    })
    this.listRemoveBody = []
    this.listRemoveShape = []
    // })
    for (const entt of entities.entities_with_components(RigidBody)) {
      const comp = entt.getComponent(RigidBody)
      if (comp.node && comp.node.active && comp.enabled) {
        comp.physicSprite.update(dt)
      }
    }
  }

  collisionBegin(arbiter: cp.Arbiter, space: cp.Space) {
    const shapes = arbiter.getShapes()
    // log(arbiter);
    const node1: NodeComp = arbiter.body_a.data
    const node2: NodeComp = arbiter.body_b.data
    const groupA = shapes[0].group
    const groupB = shapes[1].group
    // log(groupA, groupB, this.colliderMatrix[groupA][groupB])
    if (!this.colliderMatrix[groupA][groupB]) {
      return false
    }

    const phys1 = node1.getComponent(RigidBody)
    const phys2 = node2.getComponent(RigidBody)
    if (node1 && node1.active) {
      if (phys1 && phys2 && phys1.props.onBeginContact) {
        phys1.props.onBeginContact(phys2)
      }
    }
    if (node2 && node2.active) {
      if (phys1 && phys2 && phys2.props.onBeginContact) {
        phys2.props.onBeginContact(phys1)
      }
    }
    return true
  }

  collisionPre(arbiter: cp.Arbiter, space: cp.Space) {
    // log('collisionPre');
    return true
  }

  collisionPost(arbiter: cp.Arbiter, space: cp.Space) {
    // log('collisionPost');
    return true
  }

  collisionSeparate(arbiter: cp.Arbiter, space: cp.Space) {
    // log('collisionSeparate');
    const node1: NodeComp = arbiter.body_a.data
    const node2: NodeComp = arbiter.body_b.data
    const phys1 = node1.getComponent(RigidBody)
    const phys2 = node2.getComponent(RigidBody)
    if (node1 && node1.active) {
      if (phys1 && phys2 && phys1.props.onEndContact) {
        phys1.props.onEndContact(phys2)
      }
    }
    if (node2 && node2.active) {
      if (phys1 && phys2 && phys2.props.onEndContact) {
        phys2.props.onEndContact(phys1)
      }
    }
    return true
  }
  addDebug() {
    const currentScene = director.getRunningScene()
    this._debugNode = new PhysicsDebugNode(this.space)
    this._debugNode.visible = true
    currentScene.addChild(this._debugNode, 100)
  }
}
