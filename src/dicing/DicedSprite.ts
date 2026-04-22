import { _renderContext, Node, SHADER_POSITION_TEXTURE, Texture2D } from "safex-webgl";
import { GLProgram, shaderCache } from "safex-webgl/shaders";
import { Meta } from "./DicedSpriteComp";
import { DicedSpriteWebGLRenderCmd } from "./DicedSpriteWebGLRenderCmd";

type DicedAnimationFrame = {
  vertices: number[]
  uvs: number[]
  indices: number[]
}

type DicedAnimation = DicedAnimationFrame[]
//   name: string
//   fps: number
//   frames: { [key: string]: DicedAnimationFrame }
// }

type DicedSpriteAsset = {
  meta: Meta
  animations: DicedAnimation[]
}

export class DicedSprite extends Node {
  private _data: DicedSpriteAsset = null!

  private _currentAnim: DicedAnimation | null = null
  private _frameIndex = 0
  private _time = 0
  private _speed = 0.5
  private _loop = true
  private _playing = false

  declare vertices: Float32Array
  declare uvs: Float32Array
  declare indices: Uint16Array

  declare texture: Texture2D
  declare vertexBuffer: WebGLBuffer
  declare uvBuffer: WebGLBuffer
  declare indexBuffer: WebGLBuffer

  declare shaderProgram: GLProgram

  constructor(data: DicedSpriteAsset, texture: Texture2D) {
    super()
    this._data = data
    this.texture = texture
    this.initGL()
    this.updateMesh()
    this.scheduleUpdate()
  }

  private initGL() {
    const gl: WebGLRenderingContext = _renderContext

    // buffers
    this.vertexBuffer = gl.createBuffer()
    this.uvBuffer = gl.createBuffer()
    this.indexBuffer = gl.createBuffer()
    this.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE)
  }

  public updateBuffers() {
    const gl: WebGLRenderingContext = _renderContext

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
  }

  play(name: string, loop = true) {
    // console.log('play animation', name, this._data)
    const anim = this._data.animations[name]
    if (!anim) return

    this._currentAnim = anim
    this._frameIndex = 0
    this._time = 0
    this._loop = loop
    this._playing = true
    // this._speed = anim.fps / 60

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
    const frameTime = 1 / 30

    this._time += dt * this._speed

    while (this._time >= frameTime) {
      this._time -= frameTime
      this._frameIndex++

      if (this._frameIndex >= anim.length) {
        if (this._loop) {
          this._frameIndex = 0
        } else {
          this._frameIndex = anim.length - 1
          this.stop()
        }
      }

      this.updateMesh()
    }
  }
  private updateMesh() {
    if (!this._currentAnim) return
    // console.log('update mesh', this._currentAnim, this._frameIndex)
    const frame = this._currentAnim[this._frameIndex]
    this.vertices = new Float32Array(frame.vertices)
    this.uvs = new Float32Array(frame.uvs)
    this.indices = new Uint16Array(frame.indices)
    this.updateBuffers()
  }

  _createRenderCmd() {
    return new DicedSpriteWebGLRenderCmd(this)
  }
}
