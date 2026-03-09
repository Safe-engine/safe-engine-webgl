import { EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '../core/NodeComp'
import { Touch } from '../polyfills'
import { ExtraDataComp, TouchEventRegister } from './NoRenderComponent'

export class NoRenderSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, ExtraDataComp, this.onAddExtraDataComp)
    event_manager.subscribe(EventTypes.ComponentAdded, TouchEventRegister, this.onAddTouchEventRegister)
    event_manager.subscribe(EventTypes.ComponentRemoved, TouchEventRegister, this.onRemovedTouchEventRegister)
  }

  onAddTouchEventRegister: EventReceiveCallback<TouchEventRegister> = ({ entity, component: touchComp }) => {
    const nodeComp = entity.getComponent(NodeComp)
    touchComp.node = nodeComp
    touchComp.listener = cc.eventManager.addListener(
      {
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function (touch: Touch) {
          const { onTouchStart } = touchComp.props
          if (!nodeComp.active || !touchComp.enabled) return false
          // console.log('onTouchBegan', onTouchStart)
          if (!nodeComp.parent) {
            if (onTouchStart) {
              onTouchStart(touch, nodeComp)
            }
            return true
          }
          const p = touch.getLocation()
          const rect = nodeComp.getBoundingBox()
          const nodeSpaceLocation = nodeComp.parent.convertToNodeSpace(p)
          if (rect.contains(nodeSpaceLocation)) {
            if (onTouchStart) {
              onTouchStart(touch, nodeComp)
            }
            return true
          }
        },
        onTouchMoved: function (touch) {
          const { onTouchMove } = touchComp.props
          if (!onTouchMove) return false
          onTouchMove(touch, nodeComp)
          return true
        },
        onTouchEnded: function (touch) {
          const { onTouchEnd } = touchComp.props
          if (!onTouchEnd) return false
          onTouchEnd(touch, nodeComp)
          return true
        },
        onTouchCancelled: function (touch) {
          const { onTouchCancel } = touchComp.props
          if (!onTouchCancel) return false
          onTouchCancel(touch, nodeComp)
          return true
        },
      },
      nodeComp.instance,
    )
  }

  onAddExtraDataComp = ({ component }) => {
    const extra = component as ExtraDataComp
    const { key, value } = extra.props
    extra.data[key] = value
  }

  onRemovedTouchEventRegister = ({ component }) => {
    const touchComp = component as TouchEventRegister
    if (touchComp.listener) {
      cc.eventManager.removeListener(touchComp.listener)
      touchComp.listener = null
    }
  }

  // update(entities: EntityManager, events: EventManager, dt: number)
  // update() {
  // }
}
