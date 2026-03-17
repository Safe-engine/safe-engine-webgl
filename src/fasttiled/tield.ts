import { loader, Sprite, SpriteFrame } from 'safex-webgl'
import { rect } from '../../../safex-webgl/dist/src/core/cocoa/Geometry'
import { TiledMapContainer, TiledMapLayer } from './TiledMapContainer'

export function tileToPixel(map, tx, ty) {
  const tw = map.tilewidth
  const th = map.tileheight
  const { orientation, staggeraxis, staggerindex } = map

  // Cocos coordinate system: origin at bottom-left and sprites are centered by default
  // Convert Tiled (top-left origin) coordinates to Cocos (bottom-left, centered)
  switch (orientation) {
    case 'orthogonal': {
      const x = tx * tw + tw / 2
      const y = (map.height - ty - 1) * th + th / 2
      return { x, y }
    }

    case 'isometric': {
      // Standard isometric screen coordinates (top-left origin)
      const x0 = (tx - ty) * (tw / 2)
      const y0 = (tx + ty) * (th / 2)
      // full map size in pixels for isometric
      const mapW = (map.width + map.height) * (tw / 2)
      const mapH = (map.width + map.height) * (th / 2)
      const x = x0 + mapW / 2 // center horizontally
      const y = mapH - y0 - th / 2 // flip Y and center vertically
      return { x, y }
    }

    case 'staggered': {
      if (staggeraxis === 'x') {
        const odd = staggerindex === 'odd'
        const offset = tx % 2 === (odd ? 1 : 0) ? th / 2 : 0
        const x0 = tx * (tw / 2)
        const y0 = ty * th + offset
        const x = x0 + tw / 2
        const y = -y0 - th / 2
        return { x, y }
      } else {
        const odd = staggerindex === 'odd'
        const offset = ty % 2 === (odd ? 1 : 0) ? tw / 2 : 0
        const x0 = tx * tw + offset
        const y0 = ty * (th / 2)
        const x = x0 + tw / 2
        const y = -y0 - th / 2
        return { x, y }
      }
    }

    default:
      throw new Error(`Unknown map type: ${orientation}`)
  }
}

export function loadIsometricMap(mapUrl: string) {
  const mapData = loader.getRes(mapUrl)
  const tileset = mapData.tilesets[0]
  const baseDir = mapUrl.split('/').slice(0, -1).join('/')
  const tilesetImageUrl = `${baseDir}/${tileset.image}`
  const tilesetTexture = loader.getRes(tilesetImageUrl)

  const tileW = tileset.tilewidth
  const tileH = tileset.tileheight
  const cols = tileset.columns
  const firstGid = tileset.firstgid

  const tilemap = new TiledMapContainer()
  // tilemap.mapData = mapData
  for (const layer of mapData.layers) {
    if (layer.type !== 'tilelayer') continue
    const tileLayer = new TiledMapLayer()
    tileLayer.mapData = mapData
    tilemap.layers.set(layer.name, tileLayer)
    tilemap.addChild(tileLayer)
    const data = layer.data
    for (let i = 0; i < data.length; i++) {
      const gid = data[i]
      if (gid === 0) continue

      const tileId = gid - firstGid
      const frameX = (tileId % cols) * tileW
      const frameY = Math.floor(tileId / cols) * tileH

      const tx = i % mapData.width
      const ty = Math.floor(i / mapData.width)
      const { x, y } = tileToPixel(mapData, tx, ty)
      const frame = new SpriteFrame(tilesetTexture, rect(frameX, frameY, tileW, tileH))
      const sprite = new Sprite(frame)
      sprite.setPosition(x,y)
      // console.log('x,y', x, y)
      tileLayer.addChild(sprite)
    }
  }
  return tilemap
}
