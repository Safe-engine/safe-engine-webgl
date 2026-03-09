import { GameWorld, Vec2 } from '..'
import { PhysicsSystem } from './PhysicsSystem'

export * from './PhysicsComponent'
export * from './PhysicsSprite'
export * from './PhysicsSystem'

export function setupPhysics(colliderMatrix = [[true]], isDebugDraw = false, gravity = Vec2(0, -98)) {
  const physicsSystem = GameWorld.Instance.addSystemAndUpdate(PhysicsSystem)
  if (isDebugDraw) {
    physicsSystem.addDebug()
  }
  physicsSystem.colliderMatrix = colliderMatrix
  physicsSystem.space.gravity = gravity
}
