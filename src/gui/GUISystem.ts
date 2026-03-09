import { EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'
import { NodeComp } from '../core/NodeComp'
import { Vec2 } from '../polyfills'
import { ButtonComp, FillType, GridLayoutComp, InputComp, LabelComp, ProgressTimerComp, ScrollViewComp, WidgetComp } from './GUIComponent'

export class GUISystem implements System {
  static defaultFont: string
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, ButtonComp, this.onAddButtonComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ProgressTimerComp, this.onAddProgressTimerComp)
    event_manager.subscribe(EventTypes.ComponentAdded, LabelComp, this.onAddLabelComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ScrollViewComp, this.onAddScrollViewComp)
    event_manager.subscribe(EventTypes.ComponentAdded, InputComp, this.onAddInputComp)
    event_manager.subscribe(EventTypes.ComponentAdded, WidgetComp, this.onAddWidgetComp)
    event_manager.subscribe(EventTypes.ComponentAdded, GridLayoutComp, this.onAddGridLayoutComp)
  }

  private onAddButtonComp: EventReceiveCallback<ButtonComp> = ({ entity, component: button }) => {
    const { zoomScale = 1.2, capInsets, spriteFrame, selectedImage, disableImage, onPress } = button.props
    const frame = cc.spriteFrameCache.getSpriteFrame(spriteFrame)
    const textureType = !frame ? ccui.Widget.LOCAL_TEXTURE : ccui.Widget.PLIST_TEXTURE
    // console.log('onAddButtonComp', spriteFrame, textureType, ccui.Widget.PLIST_TEXTURE)
    const node = new ccui.Button(spriteFrame, selectedImage, disableImage, textureType)
    node.setZoomScale(0)
    if (onPress) {
      let lastScale: number
      let startPos: cc.Point
      node.addTouchEventListener((sender, type) => {
        // console.log('Button touch event', lastScale)
        if (type === ccui.Widget.TOUCH_BEGAN) {
          lastScale = node.scale
          sender.setScale(zoomScale)
          startPos = sender.getTouchBeganPosition()
        } else if (type === ccui.Widget.TOUCH_ENDED || type === ccui.Widget.TOUCH_CANCELED) {
          const endPos = sender.getTouchEndPosition()
          const distance = cc.pDistance(startPos, endPos)
          sender.setScale(lastScale)
          if (distance < 10) {
            onPress(button)
          }
        }
      })
    }
    if (capInsets) {
      node.setScale9Enabled(true)
      node.setCapInsets(cc.rect(...capInsets))
    }
    button.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddProgressTimerComp: EventReceiveCallback<ProgressTimerComp> = ({ entity, component: bar }) => {
    const { spriteFrame, fillType = FillType.HORIZONTAL, fillRange = 1, fillCenter = Vec2(0, 0) } = bar.props
    const frame = cc.spriteFrameCache.getSpriteFrame(spriteFrame)
    const sprite = new cc.Sprite(frame || spriteFrame)
    const pTimer = new cc.ProgressTimer(sprite) as cc.ProgressTimer & cc.Node
    const ptt = fillType === FillType.RADIAL ? cc.ProgressTimer.TYPE_RADIAL : cc.ProgressTimer.TYPE_BAR
    pTimer.setType(ptt)
    if (fillType !== FillType.RADIAL) {
      const rate = fillType === FillType.HORIZONTAL ? cc.p(1, 0) : cc.p(0, 1)
      pTimer.setBarChangeRate(rate)
    }
    pTimer.setPercentage(fillRange * 100)
    pTimer.setMidpoint(fillCenter)
    bar.node = entity.assign(new NodeComp(pTimer, entity))
  }

  private onAddLabelComp: EventReceiveCallback<LabelComp> = ({ entity, component: label }) => {
    const { string = '', font = GUISystem.defaultFont, size = 64, outline, shadow, isAdaptWithSize } = label.props
    const fontName = cc.path.basename(font, '.ttf')
    const node = new ccui.Text(string, fontName, size)
    node.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
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
    const { viewSize, contentSize, isScrollToTop, isBounced, direction = cc.SCROLLVIEW_DIRECTION_VERTICAL, onScroll } = scrollView.props
    const node = new ccui.ScrollView()
    node.setContentSize(viewSize)
    node.setInnerContainerSize(contentSize)
    node.setDirection(direction as number)
    if (isScrollToTop) node.scrollToTop(0, true)
    // node.setTouchEnabled(false)
    node.setBounceEnabled(isBounced !== undefined)
    if (onScroll) {
      node.addEventListener((target: ccui.ScrollView, event: number) => {
        // console.log('ScrollView event', event, target)
        if (ccui.ScrollView.EVENT_CONTAINER_MOVED === event) {
          const offset = Vec2(target.getInnerContainerPosition())
          onScroll(offset)
        }
      })
    }
    scrollView.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddInputComp: EventReceiveCallback<InputComp> = ({ entity, component: textInput }) => {
    const { placeHolder = '', font = GUISystem.defaultFont, size = 64, maxLength = 20, isPassword = false } = textInput.props
    const textField = new ccui.TextField()
    textField.setPlaceHolder(placeHolder)
    textField.setFontName(font)
    textField.setFontSize(size)
    textField.setTextColor(cc.color(255, 255, 255))
    textField.setMaxLengthEnabled(true)
    textField.setMaxLength(maxLength)
    textField.setPasswordEnabled(isPassword)
    textInput.node = entity.assign(new NodeComp(textField, entity))
  }

  private onAddWidgetComp: EventReceiveCallback<WidgetComp> = ({ entity, component }) => {
    const { top, right, bottom, left } = component.props
    const nodeComp = entity.getComponent(NodeComp)
    if (top !== undefined) {
      nodeComp.instance.y = cc.winSize.height - top - nodeComp.instance.height * (1 - nodeComp.instance.anchorY)
    }
    if (right !== undefined) {
      nodeComp.instance.x = cc.winSize.width - right - nodeComp.instance.width * (1 - nodeComp.instance.anchorX)
    }
    if (bottom !== undefined) {
      nodeComp.instance.y = bottom + nodeComp.instance.height * nodeComp.instance.anchorY
    }
    if (left !== undefined) {
      nodeComp.instance.x = left + nodeComp.instance.width * nodeComp.instance.anchorX
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
