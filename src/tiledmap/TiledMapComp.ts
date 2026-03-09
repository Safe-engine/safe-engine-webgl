import { BaseComponentProps, ComponentX, GameWorld, NodeComp } from '..'

interface TiledMapCompProps extends BaseComponentProps<TiledMapComp> {
  mapFile: string
}

export class TiledMapComp extends ComponentX<TiledMapCompProps, cc.TMXTiledMap> {
  getLayer(layerName: string) {
    return this.node.instance.getLayer(layerName)
  }
  getObjectGroup(layerName: string) {
    return this.node.instance.getObjectGroup(layerName)
  }

  render() {
    const tiledMap = new cc.TMXTiledMap(this.props.mapFile)
    const world = GameWorld.Instance
    const entity = world.entities.create()
    entity.assign(new NodeComp(tiledMap, entity))
    const comp = entity.assign(this)
    return comp
  }
}
