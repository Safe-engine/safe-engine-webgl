import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'
import { Body, BoxShape, CircleShape, Contact, Fixture, Manifold, PolygonShape, Vec2, World } from 'planck'
import { DrawNode, color, director, p } from 'safex-webgl'
import { NodeComp } from '../core/NodeComp'
import { GameWorld } from '../gworld'
import { instantiate } from '../helper'
import { PhysicsBoxCollider, PhysicsCircleCollider, PhysicsPolygonCollider, RigidBody } from './PhysicsComponent'
import { PhysicsSprite } from './PhysicsSprite'

export const DynamicBody = 'dynamic'
export const KinematicBody = 'kinematic'
export const StaticBody = 'static'
export const PTM_RATIO = 64

Fixture.prototype.shouldCollide = function (other: Fixture) {
  const nodeThis: NodeComp = this.getBody().getUserData()
  const nodeOther = other.getBody().getUserData() as NodeComp
  const { colliderMatrix } = GameWorld.Instance.systems.get(PhysicsSystem)
  const a = nodeThis.getComponent(RigidBody).props.tag ?? 0
  const b = nodeOther.getComponent(RigidBody).props.tag ?? 0
  // console.log('shouldCollide', a, b, colliderMatrix[a][b])
  return colliderMatrix[a][b]
}

export function setColliderMatrix(colliderMatrix = [[true]]) {
  const physicsSystem = GameWorld.Instance.systems.get(PhysicsSystem)
  physicsSystem.colliderMatrix = colliderMatrix
}
const maxTimeStep = 1 / 60
const velocityIterations = 8
const positionIterations = 3

export class PhysicsSystem implements System {
  world: World
  listRemoveBody: Body[] = []
  // listRemoveShape: Shape[] = []
  colliderMatrix = [[true]]
  debugNode: DrawNode

  addDebug() {
    const graphics = new DrawNode()
    this.debugNode = graphics
    const scene = director.getRunningScene()
    scene.addChild(graphics, 1001)
  }

  configure(event_manager: EventManager) {
    const gravity = new Vec2(0, -10)
    this.world = new World(gravity)
    // console.log('configure PhysicsSystem world', this.world)
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsBoxCollider, ({ entity, component: box }) => {
      // console.log('ComponentAddedEvent PhysicsBoxCollider', box)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor } = rigidBody.props
      const { width, height, offset = [] } = box.props
      const node = entity.getComponent(NodeComp)
      const zero = new Vec2(0, 0)
      const [x = 0, y = 0] = offset
      const body = this.world.createBody({
        // position: { x: node.posX / PTM_RATIO, y: node.posY / PTM_RATIO }, // the body's origin position.
        angle: 0.25 * Math.PI, // the body's angle in radians.
        userData: node,
        type,
        gravityScale,
      })
      rigidBody.body = body
      const physicsNode = new PhysicsSprite(node.instance, rigidBody.body)
      // console.log('body', rigidBody.props, type)
      // body.SetMassData(1)
      const position = new Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      const shape = new BoxShape(width / PTM_RATIO, height / PTM_RATIO)
      body.createFixture({
        shape,
        density,
        isSensor,
        friction,
        restitution,
      })
      body.setTransform(position, node.rotation)
      body.setLinearVelocity(zero)
      body.setAwake(true)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      box.node = node
    })
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsCircleCollider, ({ entity, component }) => {
      console.log('ComponentAddedEvent PhysicsCircleCollider', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const { radius, offset = [] } = component.props
      const [x = 0, y = 0] = offset
      const zero = new Vec2(0, 0)
      const position = new Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      const body = this.world.createBody({
        // position: { x: node.position.x + x, y: node.position.y + y }, // the body's origin position.
        angle: 0.25 * Math.PI, // the body's angle in radians.
        userData: node,
        type,
        gravityScale,
      })
      // console.log('body', type, _dynamicBody, _staticBody, getPointer(body));
      rigidBody.body = body
      const physicsNode = new PhysicsSprite(node.instance, body)
      const shape = new CircleShape(new Vec2(x / PTM_RATIO, y / PTM_RATIO), radius / PTM_RATIO)
      body.createFixture({
        shape,
        density,
        isSensor,
        friction,
        restitution,
      })
      // console.log(position instanceof Vec2, zero instanceof Vec2)
      body.setTransform(position, node.rotation)
      body.setLinearVelocity(zero)
      body.setAwake(true)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      component.node = node
    })
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsPolygonCollider, ({ entity, component }) => {
      // console.log('ComponentAddedEvent PhysicsPolygonCollider', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const { points, offset = [] } = component.props
      const [x = 0, y = 0] = offset
      const zero = new Vec2(0, 0)
      const position = new Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      const { width, height } = node.contentSize
      const { scaleX, scaleY, anchorX, anchorY } = node
      const body = this.world.createBody({
        // position: { x: node.position.x + x, y: node.position.y + y }, // the body's origin position.
        angle: 0.25 * Math.PI, // the body's angle in radians.
        userData: node,
        type,
        gravityScale,
      })
      // console.log('body', type, _dynamicBody, _staticBody, getPointer(body));
      // body.setMassData(1)
      rigidBody.body = body
      const physicsNode = new PhysicsSprite(node.instance, body)
      const fixedPoints = points.map((p) => {
        const px = p.x || p[0]
        const py = p.y || p[1]
        return new Vec2((px + x - width * anchorX * scaleX) / PTM_RATIO, (-py + y + height * scaleY * anchorY) / PTM_RATIO)
      })
      const shape = new PolygonShape(fixedPoints)
      body.createFixture({
        shape,
        density,
        isSensor,
        friction,
        restitution,
      })
      body.setTransform(position, node.rotation)
      body.setLinearVelocity(zero)
      body.setAwake(true)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      component.node = node
    })
    event_manager.subscribe(EventTypes.ComponentRemoved, RigidBody, ({ component }) => {
      // console.log('ComponentRemovedEvent NodeComp', component)
      if (component.physicSprite instanceof PhysicsSprite) {
        const body = component.physicSprite.getBody()
        // this.listRemoveShape.push(...body.shapeList)
        this.listRemoveBody.push(body)
      }
    })
    this.world.on('begin-contact', this.contactBegin.bind(this))
    this.world.on('end-contact', this.contactEnd.bind(this))
    // this.world.on('pre-solve', this.preSolve.bind(this))
    // this.world.on('post-solve', this.postSolve.bind(this))
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (this.world) {
      for (const entt of entities.entities_with_components(RigidBody)) {
        const comp = entt.getComponent(RigidBody)
        if (comp.node.active && comp.enabled) {
          comp.physicSprite.update(dt)
          if (this.debugNode) {
            this.debugNode.clear()
            const shape = comp.body.getFixtureList().getShape()
            if (shape instanceof BoxShape) {
              const { width, height } = comp.getComponent(PhysicsBoxCollider).props
              const { x, y } = comp.node.position
              // console.log('box', x, y, width, height)
              this.debugNode.drawRect(p(x, y), p(x + width, y + height), color(255, 0, 0, 50))
            } else if (shape instanceof CircleShape) {
              const { radius } = comp.getComponent(PhysicsCircleCollider).props
              const { x, y } = comp.node.position
              this.debugNode.drawCircle(p(x, y), radius, 0, 64, false, 0, color(255, 0, 0, 50))
            } else if (shape instanceof PolygonShape) {
              const { points } = comp.getComponent(PhysicsPolygonCollider).props
              const { x, y } = comp.node.position
              const fixedPoints = points.map((p) => {
                const px = p.x || p[0]
                const py = p.y || p[1]
                return new Vec2((px + x), (-py + y))
              })
              this.debugNode.drawPoly(fixedPoints, color(255, 0, 0, 50))
            }
          }
        }
      }
      // remove bodies and shapes
      this.listRemoveBody.forEach((body) => {
        if (body) {
          this.world.destroyBody(body)
        }
      })
      // this.listRemoveShape.forEach((shape) => {
      //   if (shape) {
      //     this.world.DestroyShape(shape)
      //   }
      // })
      this.listRemoveBody = []
      // this.listRemoveShape = []
      const clampedDelta = Math.min(dt, maxTimeStep)
      this.world.step(clampedDelta, velocityIterations, positionIterations)
    }
  }

  contactBegin(contact: Contact) {
    // console.log('contactBegin')
    const ett1 = contact.getFixtureA().getBody().getUserData() as NodeComp
    const ett2 = contact.getFixtureB().getBody().getUserData() as NodeComp
    // this.world.addPostStepCallback(() => {
    //   // log('addPostStepCallback');
    //   this.listRemoveShape.forEach((s) => this.world.removeShape(s))
    //   this.listRemoveBody.forEach((b) => this.world.removeBody(b))
    //   this.listRemoveBody = []
    //   this.listRemoveShape = []
    // })
    const phys1 = ett1.getComponent(RigidBody)
    const phys2 = ett2.getComponent(RigidBody)
    if (phys1 && phys2) {
      if (Object.prototype.hasOwnProperty.call(phys1, 'onBeginContact')) {
        phys1.props.onBeginContact(phys2)
      }
      if (Object.prototype.hasOwnProperty.call(phys2, 'onBeginContact')) {
        phys2.props.onBeginContact(phys1)
      }
    }
  }

  preSolve(contact: Contact, oldManifold: Manifold) {
    console.log('preSolve')
  }

  postSolve(contact: Contact, contactImpulse) {
    console.log('collisionPost')
  }

  contactEnd(contact: Contact) {
    // console.log('collisionSeparate')
    const ett1 = contact.getFixtureA().getBody().getUserData() as NodeComp
    const ett2 = contact.getFixtureB().getBody().getUserData() as NodeComp
    // const event1 = ett1.getComponent(NodeComp)
    const phys1 = ett1.getComponent(RigidBody)
    const phys2 = ett2.getComponent(RigidBody)
    // const event2 = ett2.getComponent(NodeComp)
    if (phys1 && phys2) {
      if (Object.prototype.hasOwnProperty.call(phys1, 'onEndContact')) {
        phys1.props.onEndContact(phys2)
      }
      if (Object.prototype.hasOwnProperty.call(phys2, 'onEndContact')) {
        phys2.props.onEndContact(phys1)
      }
    }
  }


  set gravity(val: Vec2) {
    this.world.setGravity(new Vec2(val.x, val.y))
    // this.world.iterations = 60
    // this.world.collisionSlop = 0.5
  }
}
