import { Vec2 } from '..'
import { ComponentX } from '../core/decorator'
import { PhysicsSprite } from './PhysicsSprite'
import { box2D, PTM_RATIO } from './PhysicsSystem'

interface RigidBodyProps {
  type?: 0 | 1 | 2 // 0: Static, 1: Kinematic, 2: Dynamic
  density?: Float
  restitution?: Float
  friction?: Float
  gravityScale?: Float
  isSensor?: boolean
  tag?: number
  onBeginContact?: (other: RigidBody) => void
  onEndContact?: (other: RigidBody) => void
  onPreSolve?: (other: RigidBody, impulse?) => void
  onPostSolve?: (other: RigidBody, oldManifold?) => void

  shapes: PhysicsShape | PhysicsShape[]
}

export class RigidBody extends ComponentX<RigidBodyProps> {
  body: Box2D.b2Body
  physicSprite: PhysicsSprite
  set linearVelocity(vel: Vec2) {
    // console.log('set linearVelocity(', vel)
    if (!this.node) {
      return
    }
    this.body.SetLinearVelocity(new box2D.b2Vec2(vel.x, vel.y))
  }

  get linearVelocity() {
    if (!this.node) {
      return Vec2.ZERO
    }
    const vel = this.body.GetLinearVelocity()
    return Vec2(vel)
  }

  applyForceTo(vel: Vec2, pos?: Vec2) {
    if (!this.node) {
      return
    }
    if (pos) {
      this.body.ApplyForce(new box2D.b2Vec2(vel.x, vel.y), new box2D.b2Vec2(pos.x, pos.y), true)
    } else {
      this.body.ApplyForceToCenter(new box2D.b2Vec2(vel.x, vel.y), true)
    }
  }

  applyLinearImpulse(vel: Vec2, pos?: Vec2) {
    if (!this.node) {
      return
    }
    // console.log('applyLinearImpulse', vel, pos)
    this.body.SetAwake(true)
    if (pos) {
      this.body.ApplyLinearImpulse(new box2D.b2Vec2(vel.x, vel.y), new box2D.b2Vec2(pos.x, pos.y), true)
    } else {
      this.body.ApplyLinearImpulseToCenter(new box2D.b2Vec2(vel.x, vel.y), true)
    }
  }

  applyTorque(torque: Float) {
    if (!this.node) {
      return
    }
    this.body.ApplyTorque(torque, true)
  }

  set position(pos: Vec2) {
    this.physicSprite.node.setPosition(pos.x, pos.y)
    const physicsPos = new box2D.b2Vec2(pos.x, pos.y)
    // console.log('SetTransform', pos, physicsPos)
    const body = this.body
    body.SetLinearVelocity(new box2D.b2Vec2(0, 0))
    body.SetAngularVelocity(0)
    body.SetAwake(true)
    body.SetTransform(physicsPos, this.node.rotation)
  }

  get position() {
    return Vec2(this.physicSprite.getBody().GetPosition())
  }
}

class _PhysicsBox {
  constructor(
    public width: number,
    public height: number,
    public offset?: [number, number],
  ) {}
}
export type PhysicsBox = _PhysicsBox
export function PhysicsBox(width: number, height: number, offset?: [number, number]) {
  return new _PhysicsBox(width, height, offset)
}

class _PhysicsCircle {
  constructor(
    public radius: number,
    public offset?: [number, number],
  ) {}
}
export type PhysicsCircle = _PhysicsCircle
export function PhysicsCircle(radius: number, offset?: [number, number]) {
  return new _PhysicsCircle(radius, offset)
}
class _PhysicsPolygon {
  constructor(
    public points: Array<Vec2> | [number, number][],
    public offset?: [number, number],
  ) {}
}
export type PhysicsPolygon = _PhysicsPolygon
export function PhysicsPolygon(points: Array<Vec2> | [number, number][], offset?: [number, number]) {
  return new _PhysicsPolygon(points, offset)
}
class _PhysicsEdge {
  constructor(
    public start: Vec2,
    public end: Vec2,
    public offset?: [number, number],
  ) {}
}
export type PhysicsEdge = _PhysicsEdge
export function PhysicsEdge(start: Vec2, end: Vec2, offset?: [number, number]) {
  return new _PhysicsEdge(start, end, offset)
}
class _PhysicsChain {
  constructor(
    public points: Array<Vec2> | [number, number][],
    public offset?: [number, number],
  ) {}
}
export type PhysicsChain = _PhysicsChain
export function PhysicsChain(points: Array<Vec2> | [number, number][], offset?: [number, number]) {
  return new _PhysicsChain(points, offset)
}
export type PhysicsShape = PhysicsPolygon | PhysicsBox | PhysicsCircle | PhysicsEdge | PhysicsChain

export function createShape(shape: PhysicsShape) {
  const { b2EdgeShape, b2ChainShape, b2PolygonShape, b2CircleShape, b2Vec2, pointsToVec2Array } = box2D as typeof Box2D
  const { offset = [] } = shape
  const [ox = 0, oy = 0] = offset
  const op = new b2Vec2(ox / PTM_RATIO, oy / PTM_RATIO)
  if (shape instanceof _PhysicsBox) {
    const { height, width } = shape
    const hh = height * 0.5
    const hw = width * 0.5
    const square = new b2PolygonShape()
    square.SetAsBox(hh / PTM_RATIO, hw / PTM_RATIO, op, 0)
    return square
  }
  if (shape instanceof _PhysicsCircle) {
    const { radius } = shape
    const circleShape = new b2CircleShape()
    circleShape.set_m_radius(radius / PTM_RATIO)
    circleShape.set_m_p(op)
    return circleShape
  }
  if (shape instanceof _PhysicsPolygon) {
    const { points } = shape
    const fixedPoints = points.map((p) => {
      const px = p.x || p[0]
      const py = p.y || p[1]
      return Vec2((px + ox) / PTM_RATIO, (py + oy) / PTM_RATIO)
    })
    const polygonShape = new b2PolygonShape()
    const [vecArr, destroyVecArr] = pointsToVec2Array(fixedPoints)
    // console.log('vecArr', vecArr, vecArr.Length())
    polygonShape.Set(vecArr, points.length)
    destroyVecArr()
    return polygonShape
  }
  if (shape instanceof _PhysicsEdge) {
    const { start, end } = shape
    const edge = new b2EdgeShape()
    const v1 = new b2Vec2(start.x, start.y)
    const v2 = new b2Vec2(end.x, end.y)
    edge.SetTwoSided(v1, v2)
    return edge
  }
  if (shape instanceof _PhysicsChain) {
    const { points } = shape
    const fixedPoints = points.map((p) => {
      const px = p.x || p[0]
      const py = p.y || p[1]
      return Vec2((px + ox) / PTM_RATIO, (py + oy) / PTM_RATIO)
    })
    const chainShape = new b2ChainShape()
    const [vecArr, destroyVecArr] = pointsToVec2Array(fixedPoints)
    // console.log('vecArr', vecArr, vecArr.Length())
    chainShape.CreateLoop(vecArr, points.length)
    destroyVecArr()
    return chainShape
  }
}
