import { GameWorld } from '../gworld'
import { AnimationSystem } from './AnimationSystem'

export function setupAnimation() {
  GameWorld.Instance.systems.addThenConfigure(AnimationSystem)
  GameWorld.Instance.listUpdate.push(AnimationSystem)
}
