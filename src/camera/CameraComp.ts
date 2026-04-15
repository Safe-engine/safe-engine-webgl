import { Camera, CameraFlag } from 'safex-webgl/camera'
import { BaseComponentProps, ComponentX, GameWorld, NodeComp, registerSystem } from '..'

interface CameraCompProps extends BaseComponentProps<CameraComp> {
  flag: CameraFlag
}

export class CameraComp extends ComponentX<CameraCompProps, Camera> {
  render() {
    const camera = new Camera(this.props.flag)
    const world = GameWorld.Instance
    const entity = world.entities.create()
    entity.assign(new NodeComp(camera, entity))
    const comp = entity.assign(this)
    return comp
  }
}

registerSystem(CameraComp)
