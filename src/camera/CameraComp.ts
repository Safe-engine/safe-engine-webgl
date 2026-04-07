import { Camera, CameraFlag } from 'safex-webgl/camera'
import { BaseComponentProps, ComponentX, GameWorld, NodeComp, registerSystem } from '..'

interface CameraCompProps extends BaseComponentProps<CameraComp> {
  flag: CameraFlag
}

export class CameraComp extends ComponentX<CameraCompProps, Camera> {
  render() {
    const tiledMap = new Camera(this.props.flag)
    const world = GameWorld.Instance
    const entity = world.entities.create()
    entity.assign(new NodeComp(tiledMap, entity))
    const comp = entity.assign(this)
    return comp
  }
}

registerSystem(CameraComp)
