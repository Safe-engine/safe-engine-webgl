import { BaseComponentProps, ComponentX, GameWorld, NodeComp, registerSystem } from '..'

interface RenderTextureCompProps extends BaseComponentProps<RenderTextureComp> {
  width: number
  height: number
}

export class RenderTextureComp extends ComponentX<RenderTextureCompProps, cc.RenderTexture> {
  render() {
    const { width, height } = this.props
    const rt = new cc.RenderTexture(width, height)

    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(rt, entity))
    const comp = entity.assign(this)
    return comp
  }
}
registerSystem(RenderTextureComp)
