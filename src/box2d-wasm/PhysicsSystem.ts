import Box2DFactory from 'box2d-wasm'
import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'
import { DrawNode, Vec2, director } from 'safex-webgl'
import { NodeComp } from '../core/NodeComp'
import { GameWorld } from '../gworld'
import { instantiate } from '../helper'
import { makeContactListener } from './ContactListener'
import { makeDebugDraw } from './debugDraw'
import { PhysicsBoxCollider, PhysicsCircleCollider, PhysicsPolygonCollider, RigidBody } from './PhysicsComponent'
import { PhysicsSprite } from './PhysicsSprite'

export const DynamicBody = 2
export const KinematicBody = 1
export const StaticBody = 0
export const PTM_RATIO = 64
export let box2D: typeof Box2D

export async function initBox2d(wasmUrl?: string) {
  if (wasmUrl) {
    box2D = await Box2DFactory({
      locateFile: () => {
        return wasmUrl
      },
    })
    return
  }
  box2D = await Box2DFactory()
}

// Box2D.b2Fixture.prototype.shouldCollide = function (other) {
//   const nodeThis: NodeComp = this.getBody().getUserData()
//   const nodeOther = other.getBody().getUserData() as NodeComp
//   const { colliderMatrix } = GameWorld.Instance.systems.get(PhysicsSystem)
//   return colliderMatrix[nodeOther.group][nodeThis.group]
// }

export function setColliderMatrix(colliderMatrix = [[true]]) {
  const physicsSystem = GameWorld.Instance.systems.get(PhysicsSystem)
  physicsSystem.colliderMatrix = colliderMatrix
}
const maxTimeStep = 1 / 60
const velocityIterations = 8
const positionIterations = 3
const metadata: { [key: number]: NodeComp } = {}
const pixelsPerMeter = 1

export class PhysicsSystem implements System {
  world: Box2D.b2World
  listRemoveBody: Box2D.b2Body[] = []
  // listRemoveShape: Box2D.b2Shape[] = []
  colliderMatrix = [[true]]
  graphics: DrawNode

  addDebug() {
    const debugDraw = makeDebugDraw(this.graphics, pixelsPerMeter, box2D)
    this.world.SetDebugDraw(debugDraw)
  }

  configure(event_manager: EventManager) {
    const { b2BodyDef, b2FixtureDef, b2PolygonShape, b2CircleShape, b2Vec2, b2World, pointsToVec2Array, getPointer } = box2D as typeof Box2D
    const gravity = new b2Vec2(0, -10)
    this.world = new b2World(gravity)
    // console.log('configure PhysicsSystem world', this.world)
    const graphics = new DrawNode()
    this.graphics = graphics
    graphics.zIndex = 1000
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
      const zero = new b2Vec2(0, 0)
      const bd = new b2BodyDef()
      bd.set_type(type)
      bd.set_position(zero)
      bd.set_gravityScale(gravityScale)
      const body = this.world.CreateBody(bd)
      rigidBody.body = body
      const physicsNode = new PhysicsSprite(node.instance, rigidBody.body)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      // console.log('body', rigidBody.props, type, b2_staticBody, b2_kinematicBody, b2_dynamicBody, getPointer(body))
      // body.SetMassData(1)
      const position = new b2Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      const square = new b2PolygonShape()
      const [x = 0, y = 0] = offset
      square.SetAsBox(width / 2 / PTM_RATIO, height / 2 / PTM_RATIO, new b2Vec2(x / PTM_RATIO, y / PTM_RATIO), 0)
      const fixtureDef = new b2FixtureDef()
      fixtureDef.set_shape(square)
      fixtureDef.set_density(density)
      fixtureDef.set_friction(friction)
      fixtureDef.set_restitution(restitution)
      fixtureDef.set_isSensor(isSensor)
      rigidBody.body.CreateFixture(fixtureDef)
      rigidBody.body.SetTransform(position, 0)
      rigidBody.body.SetLinearVelocity(zero)
      rigidBody.body.SetAwake(true)
      rigidBody.body.SetEnabled(true)
      metadata[getPointer(rigidBody.body)] = node
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
      const zero = new b2Vec2(0, 0)
      const position = new b2Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)

      const bd = new b2BodyDef()
      bd.set_type(type)
      bd.set_position(zero)
      bd.set_gravityScale(gravityScale)
      const body = this.world.CreateBody(bd)
      rigidBody.body = body
      // console.log('body', type, b2_dynamicBody, b2_staticBody, getPointer(body));
      // body.SetMassData(1)
      const physicsNode = new PhysicsSprite(node.instance, body)
      const circleShape = new b2CircleShape()
      circleShape.set_m_radius(radius / PTM_RATIO)
      circleShape.set_m_p(new b2Vec2(x / PTM_RATIO, y / PTM_RATIO))
      const fixtureDef = new b2FixtureDef()
      fixtureDef.set_shape(circleShape)
      fixtureDef.set_density(density)
      fixtureDef.set_isSensor(isSensor)
      fixtureDef.set_friction(friction)
      fixtureDef.set_restitution(restitution)
      body.CreateFixture(fixtureDef)
      body.ResetMassData()
      body.SetTransform(position, 0)
      body.SetLinearVelocity(zero)
      body.SetAwake(true)
      body.SetEnabled(true)
      metadata[getPointer(body)] = node
      console.log('body type', body.GetType())
      // console.log(position instanceof b2Vec2, zero instanceof b2Vec2)
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
      const zero = new b2Vec2(0, 0)
      const position = new b2Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      const { width, height } = node.contentSize
      const { scaleX, scaleY, anchorX, anchorY } = node

      const bd = new b2BodyDef()
      bd.set_type(type)
      bd.set_position(zero)
      bd.set_gravityScale(gravityScale)
      const body = this.world.CreateBody(bd)
      rigidBody.body = body
      // console.log('body', type, b2_dynamicBody, b2_staticBody, getPointer(body));
      body.SetMassData(1)
      const physicsNode = new PhysicsSprite(node.instance, body)
      const polygonShape = new b2PolygonShape()
      const fixedPoints = points.map((p) => {
        const px = p.x || p[0]
        const py = p.y || p[1]
        return Vec2((px + x - width * anchorX * scaleX) / PTM_RATIO, (-py + y + height * scaleY * anchorY) / PTM_RATIO)
      })
      const [vecArr, destroyVecArr] = pointsToVec2Array(fixedPoints)
      // console.log('vecArr', vecArr, vecArr.Length())
      polygonShape.Set(vecArr, points.length)
      destroyVecArr()
      const fixtureDef = new b2FixtureDef()
      fixtureDef.set_shape(polygonShape)
      fixtureDef.set_density(density)
      fixtureDef.set_friction(friction)
      fixtureDef.set_restitution(restitution)
      fixtureDef.set_isSensor(isSensor)
      body.CreateFixture(fixtureDef)
      body.SetTransform(position, 0)
      // body.SetLinearVelocity(zero)
      body.SetAwake(true)
      body.SetEnabled(true)
      metadata[getPointer(body)] = node

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
    const listener = makeContactListener(this.world, metadata, box2D)
    this.world.SetContactListener(listener)
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (this.world) {
      const { getPointer } = box2D
      for (const entt of entities.entities_with_components(RigidBody)) {
        const comp = entt.getComponent(RigidBody)
        if (comp.node.active && comp.enabled) {
          comp.physicSprite.update(dt)
        }
      }
      // remove bodies and shapes
      this.listRemoveBody.forEach((body) => {
        if (body) {
          this.world.DestroyBody(getPointer(body))
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
      this.world.Step(clampedDelta, velocityIterations, positionIterations)
      this.graphics.clear()
      this.world.DebugDraw()
      // console.log('GetBodyCount', this.world.GetBodyCount())
    }
  }

  set gravity(val: Vec2) {
    this.world.SetGravity(new box2D.b2Vec2(val.x, val.y))
    // this.world.iterations = 60
    // this.world.collisionSlop = 0.5
  }
}
