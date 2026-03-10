import { ComponentX } from '../core/decorator'
import { EventCallbackType, NodeComp } from '../core/NodeComp'
import { Touch } from '../polyfills'

type TouchEVentCallback = (touch?: Touch, node?: NodeComp) => void

export interface EventMap {
  [key: string]: [EventCallbackType]
}

export class EventRegister extends ComponentX {
  private events: EventMap = {}

  on<T>(name: string, callback: EventCallbackType<T>, target?: any) {
    const bound = target ? callback.bind(target) : callback
    if (this.events[name]) {
      this.events[name].push(bound)
    } else {
      this.events[name] = [bound]
    }
  }

  off(name: string, callback?: EventCallbackType, target?: any)
  off(name: string) {
    this.events[name] = undefined
  }

  emit(name: string, ...params: any) {
    // if (!this.node || !this.node.active || !this.enabled) return
    if (this.events[name]) {
      this.events[name].forEach((fc) => fc(...params))
    }
  }
}

interface TouchEventProps {
  onTouchStart?: TouchEVentCallback
  onTouchMove?: TouchEVentCallback
  onTouchEnd?: TouchEVentCallback
  onTouchCancel?: TouchEVentCallback
}
export class TouchEventRegister extends ComponentX<TouchEventProps> {
  listener: EventListener
  touch: Touch
  setEnabled(enabled: boolean) {
    this.listener.setEnabled(enabled)
  }
}

interface ExtraDataProps {
  key: string
  value: Integer | Float | string
}
export class ExtraDataComp extends ComponentX<ExtraDataProps> {
  data: { [key: string]: any } = {}
  getData<T>(key: string): T {
    return this.data[key]
  }
  setData<T>(key: string, val: T) {
    this.data[key] = val
  }
  removeData(key: string) {
    delete this.data[key]
  }
}
