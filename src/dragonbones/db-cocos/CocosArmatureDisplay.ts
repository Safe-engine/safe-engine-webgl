import {
  Animation,
  Armature,
  BoundingBoxType,
  DragonBones,
  EventObject,
  EventStringType,
  IArmatureProxy,
  PolygonBoundingBoxData,
} from '@cocos/dragonbones-js'
import { DrawNode, Sprite, color, p } from 'safex-webgl'
import { EventCustom } from 'safex-webgl/core/event-manager'

export type EventCallbackType = (...args) => void
export interface EventMap {
  [key: string]: [EventCallbackType]
}
export class CocosArmatureDisplay extends Sprite implements IArmatureProxy {
  /**
   * @private
   */
  public debugDraw = false
  private _debugDraw = false
  // private _disposeProxy: boolean = false;
  private _armature: Armature = null as any
  private _debugDrawer: Sprite | null = null
  // eventDispatcher: EventManager = null as any;
  listenerCount = {}
  events: EventMap = {}

  constructor() {
    super()
    // this.eventDispatcher = eventManager;
  }

  hasEvent(type: EventStringType): boolean {
    return this.hasDBEventListener(type as any)
  }

  addEvent(type: EventStringType, listener: Function, thisObject: any): void {
    // console.log('addEvent', type, listener, thisObject);
    this.addDBEventListener(type as any, listener as any, thisObject)
  }
  removeEvent(type: EventStringType, listener: Function, thisObject: any): void {
    this.removeDBEventListener(type as any, listener as any, thisObject)
  }
  /**
   * @inheritDoc
   */
  public dbInit(armature: Armature): void {
    this._armature = armature
  }
  /**
   * @inheritDoc
   */
  public dbClear(): void {
    if (this._debugDrawer !== null) {
      this._debugDrawer.removeFromParent()
    }

    this._armature = null as any
    this._debugDrawer = null

    super.removeFromParent()
  }
  /**
   * @inheritDoc
   */
  public dbUpdate(): void {
    const drawed = DragonBones.debugDraw || this.debugDraw
    if (drawed || this._debugDraw) {
      this._debugDraw = drawed
      if (this._debugDraw) {
        if (this._debugDrawer === null) {
          this._debugDrawer = new Sprite()
          const boneDrawer = new DrawNode()
          this._debugDrawer.addChild(boneDrawer)
        }

        this.addChild(this._debugDrawer)
        const boneDrawer = this._debugDrawer.getChildren()[0] as DrawNode
        boneDrawer.clear()

        const bones = this._armature.getBones()
        for (let i = 0, l = bones.length; i < l; ++i) {
          const bone = bones[i]
          const boneLength = bone.boneData.length
          const startX = bone.globalTransformMatrix.tx
          const startY = bone.globalTransformMatrix.ty
          const endX = startX + bone.globalTransformMatrix.a * boneLength
          const endY = startY + bone.globalTransformMatrix.b * boneLength

          boneDrawer.setLineWidth(2.0)
          boneDrawer.setColor(color('0x00FFFF'))
          boneDrawer.drawSegment(p(startX, startY), p(endX, endY))
          // boneDrawer.lineStyle(0.0, 0, 0.0);
          // boneDrawer.beginFill(0x00FFFF, 0.7);
          boneDrawer.drawCircle(p(startX, startY), 3.0, Math.PI * 2, 64)
          // boneDrawer.endFill();
        }

        const slots = this._armature.getSlots()
        for (let i = 0, l = slots.length; i < l; ++i) {
          const slot = slots[i]
          const boundingBoxData = slot.boundingBoxData

          if (boundingBoxData) {
            let child = this._debugDrawer.getChildByName(slot.name) as DrawNode
            if (!child) {
              child = new DrawNode()
              child.setName(slot.name)
              this._debugDrawer.addChild(child)
            }

            child.clear()
            child.setLineWidth(2.0)
            child.setColor(color('0xFF00FF'))
            child.setOpacity(0.7)
            // child.lineStyle(2.0, 0xff00ff, 0.7);

            switch (boundingBoxData.type) {
              case BoundingBoxType.Rectangle:
                child.drawRect(
                  p(-boundingBoxData.width * 0.5, -boundingBoxData.height * 0.5),
                  p(boundingBoxData.width * 0.5, boundingBoxData.height * 0.5),
                )
                break

              case BoundingBoxType.Ellipse:
                child.drawCircle(p(0.0, 0.0), boundingBoxData.width * 0.5, 0, 64)
                //   -boundingBoxData.width * 0.5,
                //   -boundingBoxData.height * 0.5,
                //   boundingBoxData.width,
                //   boundingBoxData.height
                // );
                break

              case BoundingBoxType.Polygon: {
                const { vertices } = boundingBoxData as PolygonBoundingBoxData
                const points = []
                for (let i = 0, l = vertices.length; i < l; i += 2) {
                  const x = vertices[i]
                  const y = vertices[i + 1]

                  // if (i === 0) {
                  //   child.moveTo(x, y);
                  // } else {
                  //   child.lineTo(x, y);
                  // }
                  // child.drawSegment(p(x, y), p(vertices[i + 2], vertices[i + 3]));
                  points.push(p(x, y))
                }

                // child.lineTo(vertices[0], vertices[1]);
                child.drawPoly(points)
                break
              }
              default:
                break
            }

            // child.endFill();
            slot.updateTransformAndMatrix()
            slot.updateGlobalTransform()

            const transform = slot.global
            // child.setTransform(
            //   transform.x,
            //   transform.y,
            //   transform.scaleX,
            //   transform.scaleY,
            //   transform.rotation,
            //   transform.skew,
            //   0.0,
            //   slot._pivotX,
            //   slot._pivotY,
            // )
          } else {
            const child = this._debugDrawer.getChildByName(slot.name)
            if (child) {
              this._debugDrawer.removeChild(child)
            }
          }
        }
      } else if (this._debugDrawer !== null && this._debugDrawer.getParent() === this) {
        this.removeChild(this._debugDrawer)
      }
    }
  }
  /**
   * @inheritDoc
   */
  public dispose(disposeProxy = true): void {
    // disposeProxy;
    if (this._armature !== null) {
      this._armature.dispose()
      this._armature = null as any
    }
  }
  /**
   * @inheritDoc
   */
  public destroy(): void {
    this.dispose()
  }
  /**
   * @private
   */
  public dispatchDBEvent(type: EventStringType, eventObject: EventObject): void {
    // console.log('dispatchDBEvent', type, eventObject);
    // this.eventDispatcher.dispatchCustomEvent(type, eventObject);
    if (this.events[type]) {
      const ev = new EventCustom(type)
      ev.setUserData(eventObject)
      this.events[type].forEach((fc) => fc(ev))
    }
  }
  /**
   * @inheritDoc
   */
  public hasDBEventListener(type: EventStringType): boolean {
    // console.log('hasDBEventListener', type);
    return (this.listenerCount[type] || 0) > 0
    // return this.eventDispatcher.isEnabled();
  }
  /**
   * @inheritDoc
   */
  public addDBEventListener(type: EventStringType, listener: (event: EventObject) => void, target: any): void {
    // console.log('addDBEventListener', type);
    this.listenerCount[type] = (this.listenerCount[type] || 0) + 1
    // this.eventDispatcher.addCustomListener(type, listener.bind(target));
    const bound = target ? listener.bind(target) : listener
    if (this.events[type]) {
      this.events[type].push(bound)
    } else {
      this.events[type] = [bound]
    }
  }
  /**
   * @inheritDoc
   */
  public removeDBEventListener(type: EventStringType, listener: (event: EventObject) => void, target: any): void {
    this.listenerCount[type] = (this.listenerCount[type] || 0) - 1
    // this.eventDispatcher.removeCustomListeners(type);
    this.events[type] = undefined
  }
  /**
   * @inheritDoc
   */
  public get armature(): Armature {
    return this._armature
  }
  /**
   * @inheritDoc
   */
  public get animation(): Animation {
    return this._armature.animation
  }
}
