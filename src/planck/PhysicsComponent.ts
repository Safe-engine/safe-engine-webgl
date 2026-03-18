import { Body, BodyType, Vec2 } from 'planck'
import { BaseComponentProps, Point } from '..'
import { ComponentX } from '../core/decorator'
import { PhysicsSprite } from './PhysicsSprite'

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
    return Vec2(this.physicSprite.getBody().getPosition())
  }
}

interface BoxColliderPhysicsProps {
  width: number
  height: number
  offset?: [number, number]
}
export class PhysicsBoxCollider extends ComponentX<BoxColliderPhysicsProps & BaseComponentProps<PhysicsBoxCollider>> {
  // set onCollisionEnter(val) {
  //   const phys1 = this.getComponent(PhysicsCollider)
  //   phys1._onCollisionEnter = val
  // }
  // get onCollisionEnter() {
  //   const phys1 = this.getComponent(PhysicsCollider)
  //   return phys1._onCollisionEnter
  // }
}
interface CircleColliderPhysicsProps {
  radius: number
  offset?: [number, number]
}
export class PhysicsCircleCollider extends ComponentX<CircleColliderPhysicsProps & BaseComponentProps<PhysicsCircleCollider>> {}
interface PolygonColliderPhysicsProps {
  points: Array<Vec2> | [number, number][]
  offset?: [number, number]
}
export class PhysicsPolygonCollider extends ComponentX<PolygonColliderPhysicsProps & BaseComponentProps<PhysicsPolygonCollider>> {}
