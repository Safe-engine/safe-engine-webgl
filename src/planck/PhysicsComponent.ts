import { Body, BodyType, BoxShape, ChainShape, CircleShape, EdgeShape, PolygonShape, Vec2 } from 'planck'
import { Point } from '..'
import { ComponentX } from '../core/decorator'
import { PhysicsSprite } from './PhysicsSprite'
import { PTM_RATIO } from './PhysicsSystem'

interface RigidBodyProps {
  type?: BodyType
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
  body: Body
  physicSprite: PhysicsSprite
  set linearVelocity(vel: Vec2) {
    // console.log('set linearVelocity(', vel)
    if (!this.node) {
      return
    }
    this.body.setLinearVelocity(new Vec2(vel.x, vel.y))
  }

  get linearVelocity() {
    if (!this.node) {
      return Vec2.zero()
    }
    const vel = this.body.getLinearVelocity()
    return Vec2(vel)
  }

  applyForceTo(vel: Vec2, pos?: Vec2) {
    if (!this.node) {
      return
    }
    if (pos) {
      this.body.applyForce(new Vec2(vel.x, vel.y), new Vec2(pos.x, pos.y), true)
    } else {
      this.body.applyForceToCenter(new Vec2(vel.x, vel.y), true)
    }
  }

  applyLinearImpulse(vel: Point, pos?: Point) {
    if (!this.node) {
      return
    }
    // console.log('applyLinearImpulse', vel, pos)
    this.body.setAwake(true)
    if (pos) {
      this.body.applyLinearImpulse(new Vec2(vel.x, vel.y), new Vec2(pos.x, pos.y), true)
    } else {
      this.body.applyLinearImpulse(new Vec2(vel.x, vel.y), this.body.getLocalCenter(), true)
    }
  }

  applyTorque(torque: Float) {
    if (!this.node) {
      return
    }
    this.body.applyTorque(torque, true)
  }

  set position(pos: Vec2) {
    this.physicSprite.node.setPosition(pos.x, pos.y)
    const physicsPos = new Vec2(pos.x, pos.y)
    // console.log('SetTransform', pos, physicsPos)
    const body = this.body
    body.setLinearVelocity(new Vec2(0, 0))
    body.setAngularVelocity(0)
    body.setAwake(true)
    body.setTransform(physicsPos, this.node.rotation)
  }

  get position() {
    return this.physicSprite.getBody().getPosition()
  }
}

class _PhysicsBox {
  constructor(public width: number, public height: number, public offset?: [number, number]) { }
}
export type PhysicsBox = _PhysicsBox
export function PhysicsBox(width: number, height: number, offset?: [number, number]) {
  return new _PhysicsBox(width, height, offset)
}

class _PhysicsCircle {
  constructor(public radius: number, public offset?: [number, number]) { }
}
export type PhysicsCircle = _PhysicsCircle
export function PhysicsCircle(radius: number, offset?: [number, number]) {
  return new _PhysicsCircle(radius, offset)
}
class _PhysicsPolygon {
  constructor(public points: Array<Vec2> | [number, number][], public offset?: [number, number]) { }
}
export type PhysicsPolygon = _PhysicsPolygon
export function PhysicsPolygon(points: Array<Vec2> | [number, number][], offset?: [number, number]) {
  return new _PhysicsPolygon(points, offset)
}
class _PhysicsEdge {
  constructor(public start: Vec2, public end: Vec2, public offset?: [number, number]) { }
}
export type PhysicsEdge = _PhysicsEdge
export function PhysicsEdge(start: Vec2, end: Vec2, offset?: [number, number]) {
  return new _PhysicsEdge(start, end, offset)
}
class _PhysicsChain {
  constructor(public points: Array<Vec2> | [number, number][], public offset?: [number, number]) { }
}
export type PhysicsChain = _PhysicsChain
export function PhysicsChain(points: Array<Vec2> | [number, number][], offset?: [number, number]) {
  return new _PhysicsChain(points, offset)
}
export type PhysicsShape = PhysicsPolygon | PhysicsBox | PhysicsCircle | PhysicsEdge | PhysicsChain

export function createShape(shape: PhysicsShape) {
  const { offset = [] } = shape
  const [ox = 0, oy = 0] = offset
  const op = new Vec2(ox / PTM_RATIO, oy / PTM_RATIO)
  if (shape instanceof _PhysicsBox) {
    const { height, width } = shape
    const hh = height * 0.5
    const hw = width * 0.5
    return new BoxShape(hh / PTM_RATIO, hw / PTM_RATIO, op, 0)
  }
  if (shape instanceof _PhysicsCircle) {
    const { radius } = shape
    return new CircleShape(op, radius / PTM_RATIO)
  }
  if (shape instanceof _PhysicsPolygon) {
    const { points } = shape
    const fixedPoints = points.map((p) => {
      const px = p.x || p[0]
      const py = p.y || p[1]
      return new Vec2((px + ox) / PTM_RATIO, (py + oy) / PTM_RATIO)
    })
    return new PolygonShape(fixedPoints)
  }
  if (shape instanceof _PhysicsEdge) {
    const { start, end } = shape
    return new EdgeShape(new Vec2((start.x + ox) / PTM_RATIO, (start.y + oy) / PTM_RATIO),
    new Vec2((end.x + ox) / PTM_RATIO, (end.y + oy) / PTM_RATIO))
  }
  if (shape instanceof _PhysicsChain) {
    const { points } = shape
    const fixedPoints = points.map((p) => {
      const px = p.x || p[0]
      const py = p.y || p[1]
      return new Vec2((px + ox) / PTM_RATIO, (py + oy) / PTM_RATIO)
    })
    return new ChainShape(fixedPoints)
  }
}
