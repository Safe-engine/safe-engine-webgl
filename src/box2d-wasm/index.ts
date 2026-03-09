import { GameWorld, Vec2 } from '..'
import { PhysicsSystem } from './PhysicsSystem'

export * from './PhysicsComponent'
export * from './PhysicsSprite'
export * from './PhysicsSystem'

export function setupPhysics(world = GameWorld.Instance, isDebugDraw = false, gravity = Vec2(0, -9.8)) {
  const physicsSystem = world.addSystemAndUpdate(PhysicsSystem)
  if (isDebugDraw) {
    physicsSystem.addDebug()
  }
  if (gravity) {
    physicsSystem.gravity = gravity
  }
}
