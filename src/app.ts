import { Rect, ResolutionPolicy, Scene, SpriteFrame, Texture2D, director, game, global, loader, spriteFrameCache, view } from 'safex-webgl'
import { path } from 'safex-webgl/helper'
import { GUISystem } from './gui'
import { GameWorld } from './gworld'
import { NoRenderSystem } from './norender'
import { RenderSystem } from './render'

export function initWorld(defaultFont?: string) {
  const world = GameWorld.Instance
  world.systems.addThenConfigure(RenderSystem)
  world.systems.addThenConfigure(GUISystem)
  world.systems.addThenConfigure(NoRenderSystem)
  if (defaultFont) {
    GUISystem.defaultFont = defaultFont
  }
}
interface RunOptions {
  debugMode: 1 | 0
  showFPS: boolean
  frameRate: number
  id: string
  renderMode: 0 | 1 | 2
}
export async function startGame(defaultFont: string, { width, height }, option?: Partial<RunOptions>) {
  return new Promise<void>((resolve) => {
    class BootScene extends Scene {
      constructor() {
        super()
        this.scheduleUpdate()
      }
      onEnter() {
        super.onEnter()
        initWorld(defaultFont)
        resolve()
      }

      update(dt) {
        GameWorld.Instance.update(dt)
      }
    }

    global._isContextMenuEnable = true
    game.run(
      {
        debugMode: 1,
        showFPS: false,
        frameRate: 60,
        id: 'gameCanvas',
        renderMode: 2,
        ...(option || {}),
      },
      function onStart() {
        // Pass true to enable retina display, disabled by default to improve performance
        view.enableRetina(true)
        // Adjust viewport meta
        view.adjustViewPort(true)
        // The game will be resized when browser size change
        view.resizeWithBrowserSize(true)
        // Setup the resolution policy and design resolution size
        const policy = width > height ? ResolutionPolicy.FIXED_HEIGHT : ResolutionPolicy.FIXED_WIDTH
        view.setDesignResolutionSize(width, height, policy)
        director.runScene(new BootScene())
      },
    )
  })
}

function getAllAssets(assets: any) {
  const allAssets = []
  Object.values(assets).forEach((value: any) => {
    if (value.skeleton) {
      allAssets.push(value.skeleton, value.atlas)
      if (value.texture) {
        if (Array.isArray(value.texture)) {
          allAssets.push(...value.texture)
        } else {
          allAssets.push(value.texture)
        }
      } else {
        allAssets.push(value.atlas.replace('.atlas', '.png'))
      }
    } else if (value.endsWith('.ttf')) {
      allAssets.push({
        type: 'font',
        name: path.basename(value, '.ttf'),
        srcs: [value],
      })
    } else {
      allAssets.push(value)
    }
  })
  return allAssets
}

export function loadAll(assets: any, cb?: (progress: number) => void) {
  const allAssets = getAllAssets(assets)
  return new Promise((resolve: any) => {
    loader.load(
      allAssets,
      function (result, count, loadedCount) {
        // console.log('loadAll', result, count, loadedCount)
        if (result instanceof Texture2D) {
          // textureCache.addImage(result.url)
          const frame = new SpriteFrame(result, Rect(0, 0, result.getPixelsWide(), result.getPixelsHigh()))
          // console.log('Texture2D', result, frame)
          spriteFrameCache.addSpriteFrame(frame, result.url)
        }
        let percent = loadedCount / count
        percent = Math.min(percent, 1)
        if (cb) cb(percent)
      },
      resolve,
    )
  })
}

export function unloadAll(assets: any) {
  const allAssets = getAllAssets(assets)
  allAssets.forEach((asset) => {
    loader.release(asset)
  })
}

export function loadJsonFromCache<T>(filePath: string): T {
  const res = loader.getRes(filePath)
  // console.log(filePath, res)
  return res
}
