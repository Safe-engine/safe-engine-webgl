import { GameWorld } from '../gworld'
import { CollideSystem } from './CollideSystem'

export * from './CollideComponent'

export function setupCollider(colliderMatrix?, debug = false) {
  const collideSystem = GameWorld.Instance.addSystemAndUpdate(CollideSystem)
  if (colliderMatrix) {
    collideSystem.colliderMatrix = colliderMatrix
  }
  collideSystem.toggleDebugDraw(debug)
}
