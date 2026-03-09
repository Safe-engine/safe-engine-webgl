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
    class BootScene extends cc.Scene {
      constructor() {
        super()
        super.ctor() // always call this for compatibility with cocos2dx JS Javascript class system
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

    cc._isContextMenuEnable = true
    cc.game.run(
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
        cc.view.enableRetina(cc.sys.os === cc.sys.OS_IOS)
        // Adjust viewport meta
        cc.view.adjustViewPort(true)
        // Setup the resolution policy and design resolution size
        const policy = width > height ? cc.ResolutionPolicy.FIXED_HEIGHT : cc.ResolutionPolicy.FIXED_WIDTH
        cc.view.setDesignResolutionSize(width, height, policy)
        // The game will be resized when browser size change
        cc.view.resizeWithBrowserSize(true)
        cc.director.runScene(new BootScene())
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
        name: cc.path.basename(value, '.ttf'),
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
    cc.loader.load(
      allAssets,
      function (result, count, loadedCount) {
        // console.log(result)
        if (result instanceof cc.Texture2D) {
          // cc.textureCache.addImage(result.url)
          const frame = new cc.SpriteFrame(result, cc.rect(0, 0, result.getPixelsWide(), result.getPixelsHigh()))
          // console.log('cc.Texture2D', result, frame)
          cc.spriteFrameCache.addSpriteFrame(frame, result.url)
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
    cc.loader.release(asset)
  })
}

export function loadJsonFromCache<T>(filePath: string): T {
  const res = cc.loader.getRes(filePath)
  // console.log(filePath, res)
  return res
}

export const audioEngine = cc.audioEngine
