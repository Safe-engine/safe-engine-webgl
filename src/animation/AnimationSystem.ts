import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '../core/NodeComp'
import { AnimationComp } from './AnimationComponent'

export class AnimationSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, AnimationComp, ({ entity }) => {
      const animation = entity.getComponent(AnimationComp)
      animation.node = entity.getComponent(NodeComp)
      setTimeout(animation.start.bind(animation), 0)
    })
  }

  update(entities: EntityManager, events: EventManager, dt: Float) {
    const animations = entities.entities_with_components(AnimationComp)
    // cc.log(animations);
    animations.forEach((ett) => {
      const animation = ett.getComponent(AnimationComp)
      if (animation.node && animation.node.active) {
        animation.update(dt)
      }
    })
  }
}
