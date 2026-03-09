import { EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '../core/NodeComp'
import { SpineSkeleton } from './SpineSkeleton'
import { SkeletonAnimation } from './spine-cocos/CCSkeletonAnimation'

export class SpineSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, SpineSkeleton, this.onAddSpineSkeleton)
  }
  private onAddSpineSkeleton: EventReceiveCallback<SpineSkeleton> = async ({ entity, component: spineComp }) => {
    const { data, skin, animation, loop = true, timeScale = 1, onAnimationComplete } = spineComp.props
    const { atlas: argAtlasFile, skeleton } = data
    // console.log('spineComp', data)
    let node: SkeletonAnimation
    if (skeleton.endsWith('.json')) {
      node = SkeletonAnimation.createWithJsonFile(skeleton, argAtlasFile, timeScale)
    } else {
      node = SkeletonAnimation.createWithBinaryFile(skeleton, argAtlasFile, timeScale)
    }
    if (skin) {
      node.setSkin(skin)
    }
    if (animation) {
      node.setAnimation(0, animation, loop)
    }
    spineComp.node = entity.assign(new NodeComp(node, entity))
    if (onAnimationComplete) {
      node.setCompleteListener((track, loopCount) => {
        // console.log(track, loopCount)
        onAnimationComplete(track.animation.name, loopCount)
      })
    }
  }
  // update(entities: EntityManager) {
  //   const animations = entities.entities_with_components(SpineSkeleton)
  //   animations.forEach((ett) => {
  //     const spine = ett.getComponent(SpineSkeleton)
  //     if (spine.node && spine.node.active) {
  //       spine.spine.updateTexture()
  //     }
  //   })
  // }
}
