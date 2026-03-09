import { BaseComponentProps } from '..'
import { ComponentX } from '../core/decorator'
import { Vec2 } from '../polyfills'
import { PhysicsSprite } from './PhysicsSprite'

interface RigidBodyProps {
  type?: 0 | 1 | 2 // 0: Static, 1: Kinematic, 2: Dynamic
  density?: Float
  restitution?: Float
  friction?: Float
  // gravityScale?: Float
  isSensor?: boolean
  isLockRotate?: boolean
  tag?: number
  onBeginContact?: (other: RigidBody) => void
  onEndContact?: (other: RigidBody) => void
  onPreSolve?: (other: RigidBody, impulse?) => void
  onPostSolve?: (other: RigidBody, oldManifold?) => void
}

export class RigidBody extends ComponentX<RigidBodyProps> {
  body: cp.Body
  physicSprite: PhysicsSprite
  set linearVelocity(vel: Vec2) {
    // console.log('set linearVelocity(', vel)
    if (!this.node) {
      return
    }
    this.body.setVel(new cp.Vect(vel.x, vel.y))
  }

  get linearVelocity() {
    if (!this.node) {
      return Vec2.ZERO
    }
    const vel = this.body.getVel()
    return Vec2(vel)
  }

  applyForceTo(vel: Vec2, pos?: Vec2) {
    if (!this.node) {
      return
    }
    if (pos) {
      this.body.applyForce(new cp.Vect(vel.x, vel.y), new cp.Vect(pos.x, pos.y))
    } else {
      this.body.applyForce(new cp.Vect(vel.x, vel.y), new cp.Vect(0, 0))
    }
  }

  applyLinearImpulse(vel: Vec2, pos?: Vec2) {
    if (!this.node) {
      return
    }
    // console.log('applyLinearImpulse', vel, pos)
    // this.body.activate()
    if (pos) {
      this.body.applyImpulse(new cp.Vect(vel.x, vel.y), new cp.Vect(pos.x, pos.y))
    } else {
      this.body.applyImpulse(new cp.Vect(vel.x, vel.y), new cp.Vect(0, 0))
    }
  }

  applyTorque(torque: Float) {
    if (!this.node) {
      return
    }
    this.body.setAngVel(torque)
  }

  set position(pos: Vec2) {
    this.physicSprite.node.setPosition(pos.x, pos.y)
    const physicsPos = new cp.Vect(pos.x, pos.y)
    // console.log('SetTransform', pos, physicsPos)
    const body = this.body
    body.setVel(new cp.Vect(0, 0))
    body.setAngVel(0)
    // body.SetAwake(true)
    body.setPos(physicsPos)
  }

  get position() {
    return Vec2(this.physicSprite.getBody().getPos())
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
