import { TMXTiledMap } from 'safex-webgl/tilemap'
import { BaseComponentProps, ComponentX, GameWorld, NodeComp } from '..'

interface TiledMapCompProps extends BaseComponentProps<TiledMapComp> {
  mapFile: string
}

export class TiledMapComp extends ComponentX<TiledMapCompProps, TMXTiledMap> {
  render() {
    const tiledMap = new TMXTiledMap(this.props.mapFile)
    const world = GameWorld.Instance
    const entity = world.entities.create()
    entity.assign(new NodeComp(tiledMap, entity))
    const comp = entity.assign(this)
    return comp
  }
}
