import { director } from 'safex-webgl'
import { GameWorld } from '../gworld'
import { EnhancedComponent } from './EnhancedComponent'
import { NodeComp } from './NodeComp'

export class SceneComponent extends EnhancedComponent {
  preLoad: () => Promise<void>
  render() {
    const world = GameWorld.Instance
    world.entities.reset()
    const root = world.entities.create()
    const scene = director.getRunningScene()
    scene.unscheduleAllCallbacks()
    scene.stopAllActions()
    scene.scheduleUpdate()
    const node = root.assign(new NodeComp(scene, root))
    const sceneComponent = root.assign(this)
    sceneComponent.node = node
    return sceneComponent
  }
}
