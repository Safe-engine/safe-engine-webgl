import { Node, Texture2D } from "safex-webgl"

type DicedAnimationFrame = {
  chunks: {
    frameIndex: number
    x: number
    y: number
  }[]
}

type DicedAnimation = {
  name: string
  fps: number
  frames: DicedAnimationFrame[]
}

type DicedSpriteAsset = {
  atlas: string
  atlasFrames: { x: number; y: number; w: number; h: number }[]
  animations: DicedAnimation[]
}

export class DicedSprite extends Node {
  private _data: DicedSpriteAsset = null!
  _texture: Texture2D = null!

  private _currentAnim: DicedAnimation | null = null
  private _frameIndex = 0
  private _time = 0
  private _speed = 1
  private _loop = true
  private _playing = false

  _vertices: Float32Array = null!
  _uvs: Float32Array = null!
  _indices: Uint16Array = null!

  constructor(data: DicedSpriteAsset, texture: Texture2D) {
    super()
    this._data = data
    this._texture = texture
  }

  play(name: string, loop = true) {
    const anim = this._data.animations.find(a => a.name === name)
    if (!anim) return

    this._currentAnim = anim
    this._frameIndex = 0
    this._time = 0
    this._loop = loop
    this._playing = true

    this.updateMesh()
  }

  stop() {
    this._playing = false
  }

  setSpeed(speed: number) {
    this._speed = speed
  }

  update(dt: number) {
    if (!this._playing || !this._currentAnim) return

    const anim = this._currentAnim
    const frameTime = 1 / anim.fps

    this._time += dt * this._speed

    while (this._time >= frameTime) {
      this._time -= frameTime
      this._frameIndex++

      if (this._frameIndex >= anim.frames.length) {
        if (this._loop) {
          this._frameIndex = 0
        } else {
          this._frameIndex = anim.frames.length - 1
          this.stop()
        }
      }

      this.updateMesh()
    }
  }
  private updateMesh() {
    if (!this._currentAnim) return

    const frame = this._currentAnim.frames[this._frameIndex]
    const atlasFrames = this._data.atlasFrames
    const texW = this._texture._getWidth()
    const texH = this._texture._getHeight()

    const verts = []
    const uvs = []
    const indices = []

    let idx = 0

    for (const chunk of frame.chunks) {
      const f = atlasFrames[chunk.frameIndex]

      const x = chunk.x
      const y = chunk.y
      const w = f.w
      const h = f.h

      // vertex
      verts.push(
        x, y,
        x + w, y,
        x + w, y + h,
        x, y + h
      )

      // UV
      const u0 = f.x / texW
      const v0 = f.y / texH
      const u1 = (f.x + f.w) / texW
      const v1 = (f.y + f.h) / texH

      uvs.push(
        u0, v0,
        u1, v0,
        u1, v1,
        u0, v1
      )

      indices.push(
        idx, idx + 1, idx + 2,
        idx, idx + 2, idx + 3
      )

      idx += 4
    }

    this._vertices = new Float32Array(verts)
    this._uvs = new Float32Array(uvs)
    this._indices = new Uint16Array(indices)
  }
}