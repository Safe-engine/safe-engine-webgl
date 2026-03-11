import { Vec2 } from '../../../safex-webgl/src/polyfills'
import { tileToPixel } from './tield'

export class TiledMapContainer extends Node {
  layers: Map<string, TiledMapLayer> = new Map()
  objectGroups: Map<string, any> = new Map()

  getLayer(layerName: string) {
    return this.layers.get(layerName)
  }

  getObjectGroup(layerName: string) {
    return this.objectGroups.get(layerName)
  }
}

export class TiledMapLayer extends Node {
  mapData: any
  getPositionAt(tx: number, ty: number) {
    // Use zero-based tile coordinates (no +1) and convert local tile position to world space
    const pos = tileToPixel(this.mapData, tx, ty)
    return Vec2(pos.x, pos.y)
  }

  getTileAt(tx: number, ty: number) {
    const idx = 0 | (tx + ty * this.mapData.width)
    return this.children[idx]
  }
}
