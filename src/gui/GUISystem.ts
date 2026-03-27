import { EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'
import { Node, p, pDistance, Point, Rect, Sprite, spriteFrameCache, Vec2, winSize } from 'safex-webgl'
import { VERTICAL_TEXT_ALIGNMENT_BOTTOM } from 'safex-webgl/core/platform'
import { path } from 'safex-webgl/helper'
import { ProgressTimer } from 'safex-webgl/progress-timer'
import { Button, ScrollView, Text, Widget } from 'safex-webgl/ui'
import { NodeComp } from '../core/NodeComp'
import { ButtonComp, FillType, GridLayoutComp, LabelComp, ProgressTimerComp, ScrollViewComp, ScrollViewDirection, WidgetComp } from './GUIComponent'

export class GUISystem implements System {
  static defaultFont: string
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, ButtonComp, this.onAddButtonComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ProgressTimerComp, this.onAddProgressTimerComp)
    event_manager.subscribe(EventTypes.ComponentAdded, LabelComp, this.onAddLabelComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ScrollViewComp, this.onAddScrollViewComp)
    event_manager.subscribe(EventTypes.ComponentAdded, WidgetComp, this.onAddWidgetComp)
    event_manager.subscribe(EventTypes.ComponentAdded, GridLayoutComp, this.onAddGridLayoutComp)
  }

  private onAddButtonComp: EventReceiveCallback<ButtonComp> = ({ entity, component: button }) => {
    const { zoomScale = 1.2, capInsets, spriteFrame, selectedImage, disableImage, onPress } = button.props
    const frame = spriteFrameCache.getSpriteFrame(spriteFrame)
    const textureType = !frame ? Widget.LOCAL_TEXTURE : Widget.PLIST_TEXTURE
    // console.log('onAddButtonComp', spriteFrame, textureType, Widget.PLIST_TEXTURE)
    const node = new Button(spriteFrame, selectedImage, disableImage, textureType)
    node.setZoomScale(0)
    if (onPress) {
      let lastScale: number
      let startPos: Point
      node.addTouchEventListener((sender, type) => {
        // console.log('Button touch event', lastScale)
        if (type === Widget.TOUCH_BEGAN) {
          lastScale = node.getScale()
          sender.setScale(zoomScale)
          startPos = sender.getTouchBeganPosition()
        } else if (type === Widget.TOUCH_ENDED || type === Widget.TOUCH_CANCELED) {
          const endPos = sender.getTouchEndPosition()
          const distance = pDistance(startPos, endPos)
          sender.setScale(lastScale)
          if (distance < 10) {
            onPress(button)
          }
        }
      })
    }
    if (capInsets) {
      node.setScale9Enabled(true)
      node.setCapInsets(Rect(...capInsets))
    }
    button.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddProgressTimerComp: EventReceiveCallback<ProgressTimerComp> = ({ entity, component: bar }) => {
    const { spriteFrame, fillType = FillType.HORIZONTAL, fillRange = 1, fillCenter = Vec2(0, 0) } = bar.props
    const frame = spriteFrameCache.getSpriteFrame(spriteFrame)
    const sprite = new Sprite(frame || spriteFrame)
    const pTimer = new ProgressTimer(sprite) as ProgressTimer & Node
    const ptt = fillType === FillType.RADIAL ? ProgressTimer.TYPE_RADIAL : ProgressTimer.TYPE_BAR
    pTimer.setType(ptt)
    if (fillType !== FillType.RADIAL) {
      const rate = fillType === FillType.HORIZONTAL ? p(1, 0) : p(0, 1)
      pTimer.setBarChangeRate(rate)
    }
    pTimer.setPercentage(fillRange * 100)
    pTimer.setMidpoint(fillCenter)
    bar.node = entity.assign(new NodeComp(pTimer, entity))
  }

  private onAddLabelComp: EventReceiveCallback<LabelComp> = ({ entity, component: label }) => {
    const { string = '', font = GUISystem.defaultFont, size = 64, outline, shadow, isAdaptWithSize } = label.props
    const fontName = path.basename(font, '.ttf')
    const node = new Text(string, fontName, size)
    node.setTextVerticalAlignment(VERTICAL_TEXT_ALIGNMENT_BOTTOM)
    if (outline) {
      const [color, width] = outline
      node.enableOutline(color, width)
    }
    if (shadow) {
      const [color, blur, offset] = shadow
      node.enableShadow(color, offset, blur)
    }
    node.ignoreContentAdaptWithSize(!isAdaptWithSize)
    label.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddScrollViewComp: EventReceiveCallback<ScrollViewComp> = ({ entity, component: scrollView }) => {
    const { viewSize, contentSize, isScrollToTop, isBounced, direction = ScrollViewDirection.VERTICAL, onScroll } = scrollView.props
    const node = new ScrollView()
    node.setContentSize(viewSize)
    node.setInnerContainerSize(contentSize)
    node.setDirection(direction as number)
    if (isScrollToTop) node.scrollToTop(0, true)
    // node.setTouchEnabled(false)
    node.setBounceEnabled(isBounced !== undefined)
    if (onScroll) {
      node.addEventListener((target: ScrollView, event: number) => {
        // console.log('ScrollView event', event, target)
        if (ScrollView.EVENT_CONTAINER_MOVED === event) {
          const offset = Vec2(target.getInnerContainerPosition())
          onScroll(offset)
        }
      })
    }
    scrollView.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddWidgetComp: EventReceiveCallback<WidgetComp> = ({ entity, component }) => {
    const { top, right, bottom, left } = component.props
    const nodeComp = entity.getComponent(NodeComp<Node>)
    if (top !== undefined) {
      nodeComp.posY = winSize.height - top - nodeComp.h * (1 - nodeComp.anchorY)
    }
    if (right !== undefined) {
      nodeComp.posX = winSize.width - right - nodeComp.w * (1 - nodeComp.anchorX)
    }
    if (bottom !== undefined) {
      nodeComp.posY = bottom + nodeComp.h * nodeComp.anchorY
    }
    if (left !== undefined) {
      nodeComp.posX = left + nodeComp.w * nodeComp.anchorX
    }
  }

  private onAddGridLayoutComp: EventReceiveCallback<GridLayoutComp> = ({ entity, component }) => {
    component.node = entity.getComponent(NodeComp)
    component.doLayout()
  }

  // update(entities: EntityManager, events: EventManager, dt: number)
  // update() {
  // }
}
