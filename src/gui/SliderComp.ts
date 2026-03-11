import { spriteFrameCache } from 'safex-webgl'
import { Slider, Widget } from 'safex-webgl/ui'
import { BaseComponentProps, ComponentX, GameWorld, NodeComp, registerSystem } from '..'

interface SliderCompProps extends BaseComponentProps<SliderComp> {
  barBackground: string
  normalBall: string
  pressedBall?: string
  disabledBall?: string
  percent?: number
  onChange: (percent: number) => void
}

export class SliderComp extends ComponentX<SliderCompProps, Slider> {
  set percent(val: number) {
    this.node.instance.setPercent(val)
  }
  get percent(): number {
    return this.node.instance.getPercent()
  }
  render() {
    const { barBackground, normalBall, pressedBall, disabledBall, percent } = this.props
    const frame = spriteFrameCache.getSpriteFrame(normalBall)
    const textureType = !frame ? Widget.LOCAL_TEXTURE : Widget.PLIST_TEXTURE
    const slider = new Slider(barBackground, normalBall, textureType)
    slider.loadSlidBallTexturePressed(pressedBall || normalBall, textureType)
    slider.loadSlidBallTextureDisabled(disabledBall || normalBall, textureType)
    if (percent !== undefined) slider.setPercent(percent)
    slider.addEventListener((sender, type) => {
      // console.log('SliderComp onChange', type, sender)
      if (type === Slider.EVENT_PERCENT_CHANGED) {
        const percent = sender.getPercent()
        this.props.onChange(percent)
      }
    }, this)
    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(slider, entity))
    const comp = entity.assign(this)
    return comp
  }
}
registerSystem(SliderComp)
