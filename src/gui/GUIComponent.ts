import { Node, Size, spriteFrameCache } from 'safex-webgl'
import { ProgressTimer } from 'safex-webgl/progress-timer'
import { Button, ScrollView, Text, Widget } from 'safex-webgl/ui'
import { BaseComponentProps, ColorSource, Vec2 } from '..'
import { ComponentX, render } from '../core/decorator'

export const FillType = {
  HORIZONTAL: 0,
  VERTICAL: 1,
  RADIAL: 2,
}
// type Keys = keyof typeof FillType
// type Values = (typeof FillType)[Keys]

interface ButtonCompProps {
  spriteFrame: string
  selectedImage?: string
  disableImage?: string
  zoomScale?: number
  capInsets?: [number, number, number, number]
  onPress?: (target: ButtonComp) => void
}
export class ButtonComp extends ComponentX<ButtonCompProps & BaseComponentProps<ButtonComp>, Button> {
  get spriteFrame() {
    return this.props.spriteFrame
  }

  set spriteFrame(spriteFrame) {
    this.props.spriteFrame = spriteFrame
    if (this.node && this.node.instance instanceof Button) {
      const frame = spriteFrameCache.getSpriteFrame(spriteFrame)
      const textureType = !frame ? Widget.LOCAL_TEXTURE : Widget.PLIST_TEXTURE
      this.node.instance.loadTextureNormal(spriteFrame, textureType)
    }
  }
}

interface ProgressTimerProps {
  spriteFrame: string
  fillType?: number
  fillRange?: number
  fillCenter?: Vec2
  isReverse?: boolean
}

export class ProgressTimerComp extends ComponentX<ProgressTimerProps & BaseComponentProps<ProgressTimerComp>, ProgressTimer & Node> {
  get fillRange() {
    if (this.node.instance instanceof ProgressTimer) {
      return this.node.instance.getPercentage() * 0.01
    }
  }

  set fillStart(val: number) {
    if (this.node.instance instanceof ProgressTimer) {
      this.node.instance.setMidpoint(Vec2(val, val))
    }
  }

  set fillRange(val: number) {
    if (this.node.instance instanceof ProgressTimer) {
      this.node.instance.setPercentage(val * 100)
    }
  }
}

interface LabelCompProps {
  font?: string
  string?: string
  size?: number
  outline?: [ColorSource, number]
  shadow?: [ColorSource, number, Size]
  isAdaptWithSize?: boolean
}

export class LabelComp extends ComponentX<LabelCompProps & BaseComponentProps<LabelComp>, Text> {
  get string() {
    return this.props.string
  }

  set string(val: string) {
    this.props.string = val
    if (this.node.instance instanceof Text) {
      this.node.instance.setString(val)
    }
  }
}

export enum ScrollViewDirection {
  NONE = ScrollView.DIR_NONE,
  HORIZONTAL = ScrollView.DIR_HORIZONTAL,
  VERTICAL = ScrollView.DIR_VERTICAL,
  BOTH = ScrollView.DIR_BOTH,
}
interface ScrollViewProps {
  viewSize: Size
  contentSize: Size
  direction?: ScrollViewDirection
  isScrollToTop?: boolean
  isBounced?: boolean
  onScroll?: (offset: Vec2) => void
}
export class ScrollViewComp extends ComponentX<ScrollViewProps & BaseComponentProps<ScrollViewComp>, ScrollView> {
  zoom(scale: number) {
    if (this.node.instance instanceof ScrollView) {
      ;(this.node.instance as any)._innerContainer.setScale(scale)
    }
  }
}

// interface InputCompProps {
//   placeHolder?: string
//   font?: string
//   size?: Integer
//   maxLength?: Integer
//   isPassword?: boolean
// }
// export class InputComp extends ComponentX<InputCompProps & BaseComponentProps<InputComp>, TextField> {
//   get string() {
//     return this.node.instance.getString()
//   }
// }
interface WidgetCompProps {
  top?: Integer
  right?: Integer
  bottom?: Integer
  left?: Integer
}
export class WidgetComp extends ComponentX<WidgetCompProps & BaseComponentProps<WidgetComp>, Node> {}

interface GridLayoutCompProps {
  top?: Integer
  left?: Integer
  spaceX?: Integer
  spaceY?: Integer
  columns?: Integer
}
export class GridLayoutComp extends ComponentX<GridLayoutCompProps & BaseComponentProps<GridLayoutComp>, Node> {
  start() {
    this.doLayout()
  }

  doLayout() {
    const { columns = 5, spaceX = 0, spaceY = 0, left = 0, top = 0 } = this.props
    const children = this.node.instance.getChildren()
    children.forEach((child, index) => {
      const row = Math.floor(index / columns)
      const column = index % columns
      const x = left + column * (child.width + spaceX) + child.width / 2
      const y = -top - row * (child.height + spaceY) - child.height / 2
      child.setPosition(x, y)
    })
  }
}

Object.defineProperty(ProgressTimerComp.prototype, 'render', { value: render })
Object.defineProperty(LabelComp.prototype, 'render', { value: render })
Object.defineProperty(ScrollViewComp.prototype, 'render', { value: render })
// Object.defineProperty(InputComp.prototype, 'render', { value: render })
Object.defineProperty(ButtonComp.prototype, 'render', { value: render })
