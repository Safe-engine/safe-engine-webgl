import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'
import { Body, BoxShape, ChainShape, CircleShape, Contact, EdgeShape, Fixture, Manifold, PolygonShape, Vec2, World } from 'planck'
import { color, director, DrawNode, p } from 'safex-webgl'
import { NodeComp } from '../core/NodeComp'
import { GameWorld } from '../gworld'
import { createShape, RigidBody } from './PhysicsComponent'
import { PhysicsSprite } from './PhysicsSprite'

export const DynamicBody = 'dynamic'
export const KinematicBody = 'kinematic'
export const StaticBody = 'static'
export const PTM_RATIO = 32

function toPixels(vec) {
  return p(vec.x * PTM_RATIO, vec.y * PTM_RATIO)
}

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
  debugNode?: DrawNode

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
    event_manager.subscribe(EventTypes.ComponentAdded, RigidBody, ({ entity, component: rigidBody }) => {
      // console.log('ComponentAddedEvent RigidBody', rigidBody)
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor, shapes } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const zero = new Vec2(0, 0)
      const position = new Vec2(node.posX / PTM_RATIO, node.posY / PTM_RATIO)
      // const { width, height } = node.contentSize
      // const { scaleX, scaleY, anchorX, anchorY } = node
      const body = this.world.createBody({
        // position: { x: node.position.x + x, y: node.position.y + y }, // the body's origin position.
        angle: 0.25 * Math.PI, // the body's angle in radians.
        userData: node,
        type,
        gravityScale,
      })
      // console.log('body', type, _dynamicBody, _staticBody, getPointer(body));
      // body.setMassData(1)
      const physicsNode = new PhysicsSprite(node.instance, body)
      const shapesArray = Array.isArray(shapes) ? shapes : [shapes]
      shapesArray.forEach(physicsShape => {
        const shape = createShape(physicsShape)
        body.createFixture({
          shape,
          density,
          isSensor,
          friction,
          restitution,
        })
      })
      body.setTransform(position, node.rotation)
      body.setLinearVelocity(zero)
      body.setAwake(true)
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
    this.world.on('begin-contact', this.contactBegin.bind(this))
    this.world.on('end-contact', this.contactEnd.bind(this))
    // this.world.on('pre-solve', this.preSolve.bind(this))
    // this.world.on('post-solve', this.postSolve.bind(this))
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (this.world) {
      this.debugNode?.clear()
      for (const entt of entities.entities_with_components(RigidBody)) {
        const comp = entt.getComponent(RigidBody)
        if (comp.node?.active && comp.enabled) {
          comp.physicSprite.update(dt)
          if (this.debugNode) {
            const shape = comp.body.getFixtureList().getShape()
            if (shape instanceof BoxShape || shape instanceof PolygonShape) {
              const verts = shape.m_vertices.map(v => {
                const worldPoint = comp.body.getWorldPoint(v)
                return p(worldPoint.x * PTM_RATIO, worldPoint.y * PTM_RATIO)
              })
              this.debugNode.drawPoly(
                verts,
                color(0, 255, 0, 100),   // fill
                1,                          // line width
                color(0, 255, 0, 255)    // stroke
              )
            } else if (shape instanceof CircleShape) {
              const pos = comp.body.getWorldPoint(shape.m_p)
              const radius = shape.m_radius * PTM_RATIO
              this.debugNode.drawCircle(
                toPixels(pos),
                radius,
                0,
                20,
                false,
                1,
                color(255, 0, 0, 255)
              )
              this.debugNode.drawDot(toPixels(pos), radius, color(255, 0, 0, 50))
            } else if (shape instanceof EdgeShape) {
              const v1 = comp.body.getWorldPoint(shape.m_vertex1)
              const v2 = comp.body.getWorldPoint(shape.m_vertex2)
              this.debugNode.drawSegment(
                toPixels(v1),
                toPixels(v2),
                1,
                color(255, 255, 255, 255)
              )
            } else if (shape instanceof ChainShape) {
              const vertices = shape.m_vertices
              for (let i = 0; i < vertices.length - 1; i++) {
                const v1 = comp.body.getWorldPoint(vertices[i])
                const v2 = comp.body.getWorldPoint(vertices[i + 1])
                this.debugNode.drawSegment(
                  toPixels(v1),
                  toPixels(v2),
                  1,
                  color(200, 200, 200, 255)
                )
              }
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
