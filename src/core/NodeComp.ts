import { Constructor, Entity } from 'entityx-ts'

import { ClippingNode, Color, DrawNode, Node, p, Point, Size, sys, Vec2 } from 'safex-webgl'
import { ActionInterval } from '../../../safex-webgl/dist/actions/ActionInterval'
import { instantiate } from '../helper/utils'
import { EventRegister, ExtraDataComp } from '../norender'
import { ComponentType, EnhancedComponent } from './EnhancedComponent'

export type EventCallbackType<T = void> = (args?: T) => void
export class NodeComp<C extends Node = Node> {
  entity: Entity
  instance: C
  parent: NodeComp
  children: NodeComp[] = []
  private _active = true

  constructor(instance: C, entity: Entity) {
    this.entity = entity
    this.instance = instance
  }

  get uuid() {
    return this.entity.id
  }

  get position(): Readonly<Vec2> {
    return Vec2(this.instance.getPosition())
  }

  set position(val: Vec2) {
    this.instance.setPosition(val.x, val.y)
  }

  set xy(val: [number, number]) {
    this.instance.setPosition(val[0], val[1])
  }

  get posX() {
    return this.instance.getPositionX()
  }

  set posX(val: number) {
    this.instance.setPositionX(val)
  }

  get posY() {
    return this.instance.getPositionY()
  }

  set posY(val: number) {
    this.instance.setPositionY(val)
  }

  get scale() {
    return this.instance.getScale()
  }

  set scale(val: number) {
    this.instance.setScale(val, val)
  }

  get scaleX() {
    return this.instance.getScaleX()
  }

  set scaleX(val: number) {
    this.instance.setScaleX(val)
  }

  get scaleY() {
    return this.instance.getScaleY()
  }

  set scaleY(val: number) {
    this.instance.setScaleY(val)
  }

  get anchorX() {
    return this.instance._getAnchorX()
  }

  set anchorX(val: number) {
    this.instance._setAnchorX(val)
  }

  get anchorY() {
    return this.instance._getAnchorY()
  }

  set anchorY(val: number) {
    this.instance._setAnchorY(val)
  }
  /**
   * Returns the angle of the node in degrees. 0 is the default rotation angle. Positive values rotate node clockwise.
   * @function
   * @return {Number} The rotation of the node in degrees.
   */
  get rotation() {
    return this.instance.getRotation()
  }
  /**
   *
   *  Sets the X angle of the node in degrees which performs a horizontal rotational skew.
   *  (support only in WebGL rendering mode)
   *  0 is the default rotation angle.
   *  Positive values rotate node clockwise, and negative values for anti-clockwise.
   *
   * @param {Number} degrees The X rotation in degrees which performs a horizontal rotational skew.
   */
  set rotation(val: number) {
    this.instance.setRotation(val)
  }

  get color() {
    return this.instance.getColor()
  }

  set color(val: Color) {
    this.instance.setColor(val)
  }

  get opacity() {
    return this.instance.getOpacity()
  }

  set opacity(val: number) {
    this.instance.setOpacity(val)
  }

  get active() {
    if (!sys.isObjectValid(this.instance) || !this._active) return false
    let p = this.parent
    while (p) {
      if (!p.active) return false
      p = p.parent
    }
    return true
  }

  set active(val: boolean) {
    if (!sys.isObjectValid(this.instance)) {
      return
    }
    this._active = val
    // if (this.instance instanceof ccui.Widget) {
    //   this.instance.setEnabled(val)
    // }
    this.instance.setVisible(val)
  }

  get w() {
    return this.instance.width
  }

  set w(val) {
    this.instance.setContentSize(val, this.h)
  }

  get h() {
    return this.instance.height
  }

  set h(val) {
    this.instance.setContentSize(this.w, val)
  }

  get zIndex() {
    return this.instance.zIndex
  }

  set zIndex(val) {
    this.instance.zIndex = val
  }

  get name() {
    return this.instance.getName()
  }

  set name(val) {
    this.instance.setName(val)
  }

  get tag() {
    return this.instance.getTag()
  }

  set tag(val) {
    this.instance.setTag(val)
  }

  get childrenCount() {
    return this.children.length
  }

  destroy() {
    if (!sys.isObjectValid(this.instance)) {
      return
    }
    this.removeFromParent(true)
  }

  addComponent<T extends ComponentType>(instance: T & { render?: any; start?: () => void }): T {
    this.entity.assign(instance)
    if (!instance.render) {
      if (instance.start) instance.start()
    }
    return instance
  }

  getComponent<T extends ComponentType>(component: Constructor<T>): T {
    return this.entity.getComponent(component)
  }

  getComponentsInChildren<T extends ComponentType>(component: Constructor<T>): T[] {
    if (!this.children.length) {
      return []
    }
    const listHave = this.children.filter((child) => {
      return child.getComponent(component)
    })
    return listHave.map((node) => node.getComponent(component))
  }

  getComponentInChildren<T extends ComponentType>(component: Constructor<T>): T {
    return this.getComponentsInChildren(component)[0]
  }

  hasComponentInChildren<T extends ComponentType>(component: Constructor<T>) {
    if (!this.children.length) {
      return false
    }
    return this.children.some((child) => {
      return child.getComponent(component)
    })
  }

  convertToNodeSpace(point: Point) {
    return Vec2(this.instance.convertToNodeSpace(point))
  }

  convertToNodeSpaceAR(point: Point) {
    return Vec2(this.instance.convertToNodeSpaceAR(point))
  }

  convertToWorldSpaceAR(point: Vec2) {
    return Vec2(this.instance.convertToWorldSpaceAR(point))
  }

  convertToWorldSpace(point: Vec2) {
    return Vec2(this.instance.convertToWorldSpace(point))
  }

  getBoundingBox() {
    const box = this.instance.getBoundingBox()
    box.contains = function (point) {
      return this.x <= point.x && this.x + this.width >= point.x && this.y <= point.y && this.y + this.height >= point.y
    }
    return box
  }

  get contentSize() {
    return this.instance.getContentSize()
  }

  set contentSize(size: Size) {
    this.instance.setContentSize(size)
    if (this.instance instanceof ClippingNode) {
      const hw = size.width * 0.5
      const hh = size.height * 0.5
      const stencil = new DrawNode()
      const rectangle = [p(-hw, -hh), p(hw, -hh), p(hw, hh), p(-hw, hh)]
      stencil.drawPoly(rectangle, Color.WHITE, 0, Color.WHITE)
      // stencil.drawDot(p(-height * 0.5, -height * 0.5), height, Color.WHITE);
      this.instance.stencil = stencil
    }
  }

  runAction(atc: ActionInterval) {
    this.instance.runAction(atc)
  }

  stopAllActions() {
    this.instance.stopAllActions()
  }

  pauseAllActionsAndSchedule() {
    this.instance.pause()
    this.instance.unscheduleUpdate()
  }

  resumeAllActionsAndSchedule() {
    this.instance.resume()
    this.instance.scheduleUpdate()
  }

  removeFromParent(cleanup?: boolean) {
    this.active = false
    if (this.parent) {
      this.parent.children = this.parent.children.filter(({ entity }) => entity.id !== this.entity.id)
    }
    if (cleanup) {
      this.children.forEach((child) => {
        child.destroy()
      })
      this.parent = null
      this.entity.destroy()
      this.stopAllActions()
      this.instance.removeFromParent(cleanup)
    } else {
      this.stopAllActions()
      this.instance.removeFromParent()
    }
  }
  addChild(child: NodeComp, zOrder?: number, tag?: number) {
    child._active = true
    child.parent = this
    this.children.push(child)
    this.instance.addChild(child.instance, zOrder, tag)
  }

  removeAllChildren(cleanup?: boolean) {
    this.children.forEach((child) => {
      child.removeFromParent(cleanup)
    })
  }

  getData<T>(key: string): T {
    const data = this.getComponent(ExtraDataComp)
    if (!data) throw Error('need add ExtraDataComp to Node')
    return data.getData(key)
  }

  setData<T extends Integer | Float | string>(key: string, value: T) {
    const data = this.getComponent(ExtraDataComp)
    if (!data) {
      this.addComponent(instantiate(ExtraDataComp, { key, value }))
    } else {
      data.setData(key, value)
    }
  }

  get event() {
    const _event = this.getComponent(EventRegister)
    if (!_event) {
      return this.addComponent(instantiate(EventRegister))
    }
    return _event
  }

  removeData(key: string) {
    const data = this.getComponent(ExtraDataComp)
    if (data) {
      data.removeData(key)
    }
  }

  resolveComponent(component: EnhancedComponent<object, NodeComp>) {
    if ((component as any).render) {
      this.addChild(component.node)
    } else {
      this.addComponent(component)
    }
  }
}
