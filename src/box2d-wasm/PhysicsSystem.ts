import Box2DFactory from 'box2d-wasm'
import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'
import { director, DrawNode, Vec2 } from 'safex-webgl'
import { NodeComp } from '../core/NodeComp'
import { GameWorld } from '../gworld'
import { makeContactListener } from './ContactListener'
import { makeDebugDraw } from './debugDraw'
import { createShape, RigidBody } from './PhysicsComponent'
import { PhysicsSprite } from './PhysicsSprite'

export const DynamicBody = 2
export const KinematicBody = 1
export const StaticBody = 0
export const PTM_RATIO = 32
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

class MyContactFilter extends Box2D.JSContactFilter {
  ShouldCollide(fixtureA, fixtureB) {
    const bodyA = fixtureA.GetBody()
    const bodyB = fixtureB.GetBody()
    const nodeThis: NodeComp = metadata[box2D.getPointer(bodyA)]
    const nodeOther = metadata[box2D.getPointer(bodyB)] as NodeComp
    const { colliderMatrix } = GameWorld.Instance.systems.get(PhysicsSystem)
    const a = nodeThis.getComponent(RigidBody).props.tag ?? 0
    const b = nodeOther.getComponent(RigidBody).props.tag ?? 0
    // console.log('shouldCollide', a, b, colliderMatrix)
    return !!colliderMatrix[a][b]
  }
}

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
    const { b2BodyDef, b2FixtureDef, b2Vec2, b2World, getPointer } = box2D as typeof Box2D
    const gravity = new b2Vec2(0, -10)
    this.world = new b2World(gravity)
    // console.log('configure PhysicsSystem world', this.world)
    const filter = new MyContactFilter()
    this.world.SetContactFilter(filter)
    const graphics = new DrawNode()
    this.graphics = graphics
    graphics.setLocalZOrder(1000)
    const scene = director.getRunningScene()
    scene.addChild(graphics)
    event_manager.subscribe(EventTypes.ComponentAdded, RigidBody, ({ entity, component: rigidBody }) => {
      // console.log('ComponentAddedEvent RigidBody', rigidBody)
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor, shapes } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const zero = new b2Vec2(0, 0)
      const position = new b2Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      // const { width, height } = node.contentSize
      // const { scaleX, scaleY, anchorX, anchorY } = node
      const bd = new b2BodyDef()
      bd.set_type(type)
      bd.set_position(zero)
      bd.set_gravityScale(gravityScale)
      const body = this.world.CreateBody(bd)
      // console.log('body', type, _dynamicBody, _staticBody, getPointer(body));
      // body.setMassData(1)
      const physicsNode = new PhysicsSprite(node.instance, body)
      const shapesArray = Array.isArray(shapes) ? shapes : [shapes]
      shapesArray.forEach((physicsShape) => {
        const shape = createShape(physicsShape)
        const fixtureDef = new b2FixtureDef()
        fixtureDef.set_shape(shape)
        fixtureDef.set_density(density)
        fixtureDef.set_isSensor(isSensor)
        fixtureDef.set_friction(friction)
        fixtureDef.set_restitution(restitution)
        body.CreateFixture(fixtureDef)
      })
      body.SetTransform(position, node.rotation)
      body.SetLinearVelocity(zero)
      body.SetAwake(true)
      body.SetEnabled(true)
      metadata[getPointer(body)] = node
      rigidBody.physicSprite = physicsNode
      rigidBody.body = body
      rigidBody.node = node
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
