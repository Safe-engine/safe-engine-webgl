import { GameWorld, Vec2 } from '..'
import { PhysicsSystem } from './PhysicsSystem'

export * from './PhysicsComponent'
export * from './PhysicsSprite'
export * from './PhysicsSystem'

export function setupPhysics(colliderMatrix?, isDebugDraw = false, gravity = Vec2(0, -9.8)) {
  const world = GameWorld.Instance
  const physicsSystem = world.addSystemAndUpdate(PhysicsSystem)
  if (colliderMatrix) {
    physicsSystem.colliderMatrix = colliderMatrix
  }
  if (isDebugDraw) {
    physicsSystem.addDebug()
  }
  if (gravity) {
    physicsSystem.gravity = gravity
  }
}
