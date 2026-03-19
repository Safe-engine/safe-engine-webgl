import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'
import { Body, BoxShape, CircleShape, Fixture, PolygonShape, Shape, Vec2, World } from 'planck'
import { DrawNode, director } from 'safex-webgl'
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
  // console.log('shouldCollide', a, b)
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
  listRemoveShape: Shape[] = []
  colliderMatrix = [[true]]
  graphics: DrawNode

  addDebug() {
    // const debugDraw = makeDebugDraw(this.graphics, pixelsPerMeter, box2D)
    // this.world.SetDebugDraw(debugDraw)
  }

  configure(event_manager: EventManager) {
    const gravity = new Vec2(0, -10)
    this.world = new World(gravity)
    // console.log('configure PhysicsSystem world', this.world)
    const graphics = new DrawNode()
    this.graphics = graphics
    graphics.setLocalZOrder(1000)
    const scene = director.getRunningScene()
    scene.addChild(graphics)
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
        position: { x: node.position.x + x, y: node.position.y + y }, // the body's origin position.
        angle: 0.25 * Math.PI, // the body's angle in radians.
        userData: node,
        type,
        gravityScale,
      })
      rigidBody.body = body
      const physicsNode = new PhysicsSprite(node.instance, rigidBody.body)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      // console.log('body', rigidBody.props, type, _staticBody, _kinematicBody, _dynamicBody, getPointer(body))
      // body.SetMassData(1)
      const position = new Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      const shape = new BoxShape(width, height)
      body.createFixture({
        shape,
        density,
        isSensor,
        friction,
        restitution,
      })
      // const debugBox = new Graphics()
      // debugBox.rect(x, y, width, height)
      // debugBox.fill({ color: 0xff0000, alpha: 0.3 })
      // node.instance.addChild(debugBox)
      rigidBody.body.setTransform(position, 0)
      rigidBody.body.setLinearVelocity(zero)
      rigidBody.body.setAwake(true)
      // rigidBody.body.SetEnabled(true)
      // metadata[getPointer(rigidBody.body)] = node
      box.node = node
    })
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsCircleCollider, ({ entity, component }) => {
      // console.log('ComponentAddedEvent PhysicsCircleCollider', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor = false } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const { radius, offset = [] } = component.props
      const [x = 0, y = 0] = offset
      const zero = new Vec2(0, 0)
      const position = new Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      const body = this.world.createBody({
        position: { x: node.position.x + x, y: node.position.y + y }, // the body's origin position.
        angle: 0.25 * Math.PI, // the body's angle in radians.
        userData: node,
        type,
        gravityScale,
      })
      rigidBody.body = body
      // console.log('body', type, _dynamicBody, _staticBody, getPointer(body));
      // body.SetMassData(1)
      const physicsNode = new PhysicsSprite(node.instance, body)
      const shape = new CircleShape(position, radius)
      body.createFixture({
        shape,
        density,
        isSensor,
        friction,
        restitution,
      })
      // metadata[getPointer(body)] = node
      console.log('body type', body.getType())
      // console.log(position instanceof Vec2, zero instanceof Vec2)
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
        position: { x: node.position.x + x, y: node.position.y + y }, // the body's origin position.
        angle: 0.25 * Math.PI, // the body's angle in radians.
        userData: node,
        type,
        gravityScale,
      })
      rigidBody.body = body
      // console.log('body', type, _dynamicBody, _staticBody, getPointer(body));
      // body.setMassData(1)
      const physicsNode = new PhysicsSprite(node.instance, body)
      const fixedPoints = points.map((p) => {
        const px = p.x || p[0]
        const py = p.y || p[1]
        return Vec2((px + x - width * anchorX * scaleX) / PTM_RATIO, (-py + y + height * scaleY * anchorY) / PTM_RATIO)
      })
      const shape = new PolygonShape(fixedPoints)
      body.createFixture({
        shape,
        density,
        isSensor,
        friction,
        restitution,
      })

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
    // const listener = makeContactListener(this.world, metadata, box2D)
    // this.world.SetContactListener(listener)
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (this.world) {
      for (const entt of entities.entities_with_components(RigidBody)) {
        const comp = entt.getComponent(RigidBody)
        if (comp.node.active && comp.enabled) {
          comp.physicSprite.update(dt)
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
      this.graphics.clear()
      // this.world.DebugDraw()
      // console.log('GetBodyCount', this.world.GetBodyCount())
    }
  }

  set gravity(val: Vec2) {
    this.world.setGravity(new Vec2(val.x, val.y))
    // this.world.iterations = 60
    // this.world.collisionSlop = 0.5
  }
}
