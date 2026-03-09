import { BaseComponentProps, ComponentX, GameWorld, NodeComp, registerSystem } from '..'

interface SliderCompProps extends BaseComponentProps<SliderComp> {
  barBackground: string
  normalBall: string
  pressedBall?: string
  disabledBall?: string
  percent?: number
  onChange: (percent: number) => void
}

export class SliderComp extends ComponentX<SliderCompProps, ccui.Slider> {
  set percent(val: number) {
    this.node.instance.setPercent(val)
  }
  get percent(): number {
    return this.node.instance.getPercent()
  }
  render() {
    const { barBackground, normalBall, pressedBall, disabledBall, percent } = this.props
    const frame = cc.spriteFrameCache.getSpriteFrame(normalBall)
    const textureType = !frame ? ccui.Widget.LOCAL_TEXTURE : ccui.Widget.PLIST_TEXTURE
    const slider = new ccui.Slider(barBackground, normalBall, textureType)
    slider.loadSlidBallTexturePressed(pressedBall || normalBall, textureType)
    slider.loadSlidBallTextureDisabled(disabledBall || normalBall, textureType)
    if (percent !== undefined) slider.setPercent(percent)
    slider.addEventListener((sender, type) => {
      // console.log('SliderComp onChange', type, sender)
      if (type === ccui.Slider.EVENT_PERCENT_CHANGED) {
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
