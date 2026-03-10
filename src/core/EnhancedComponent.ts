import { Constructor } from 'entityx-ts'

import { BaseComponentProps } from '..'
import { NodeComp } from './NodeComp'

export class EnhancedComponent<Props = object, N extends NodeComp<any> = NodeComp<any>> {
  props: Props = {} as any
  node: N
  enabled = true
  constructor(data?: BaseComponentProps<EnhancedComponent> & Props) {
    this.init(data)
  }
  init(data?: Props) {
    if (data) {
      // console.log('constructor', this.constructor.name, data)
      Object.keys(data).forEach((key) => {
        this.props[key] = data[key]
      })
    }
  }

  addComponent<T extends EnhancedComponent>(instance: T): T {
    return this.node.addComponent(instance)
  }
  getComponent<T extends EnhancedComponent>(component: Constructor<T>): T {
    return this.node.getComponent(component)
  }
  schedule(callback: (arg: any) => void, interval: number, repeat: number = REPEAT_FOREVER, delay = 0) {
    this.node.instance.schedule(callback.bind(this), interval, repeat, delay)
  }
  unschedule(callback: (arg: any) => void) {
    this.node.instance.unschedule(callback.bind(this))
  }
  unscheduleAllCallbacks() {
    this.node.instance.unscheduleAllCallbacks()
  }
  scheduleOnce(callback: (arg: any) => void, delay: number, key?: string) {
    this.node.instance.scheduleOnce(callback, delay, key)
  }
  getComponentsInChildren<T extends ComponentType>(component: Constructor<T>): T[] {
    return this.node.getComponentsInChildren(component)
  }
  getComponentInChildren<T extends ComponentType>(component: Constructor<T>): T {
    return this.node.getComponentInChildren(component)
  }
  isEqual(other: EnhancedComponent) {
    return this.node.entity.id === other.node.entity.id
  }
}

export type ComponentType = EnhancedComponent | NodeComp
