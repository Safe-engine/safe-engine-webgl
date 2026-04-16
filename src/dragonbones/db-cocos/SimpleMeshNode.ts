// SimpleMesh as a Node for Cocos2d-html5 (WebGL primary).
import { Sprite, Texture2D } from 'safex-webgl'
import { SimpleMeshWebGLRenderCmd } from './SimpleMeshWebGLRenderCmd'

// ---------------------------------------------------------------------------
// SimpleMeshNode – a Sprite subclass that renders an arbitrary indexed mesh.
// ---------------------------------------------------------------------------
export class SimpleMeshNode extends Sprite {
  _vertices: Float32Array
  _uvs: Float32Array
  _indices: Uint16Array

  _needsUpload = true
  _alpha = 1.0

  constructor(texture?: Texture2D, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array) {
    super()

    this._texture = texture
    this._vertices = vertices || new Float32Array(0)
    this._uvs = uvs || new Float32Array(0)
    this._indices = indices || new Uint16Array(0)

    this._updateContentSizeFromVertices()
  }
  // _createRenderCmd is patched on prototype below (bypasses TS Sprite._renderCmd type conflict)
  // Estimate contentSize from vertex bounds so the node has a rough bounding box
  _updateContentSizeFromVertices(): void {
    if (!this._vertices || this._vertices.length < 2) return
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity
    for (let i = 0; i < this._vertices.length; i += 2) {
      const x = this._vertices[i], y = this._vertices[i + 1]
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
    if (!isFinite(minX)) return
    this.setContentSize(maxX - minX, maxY - minY)
  }

  // -----------------------------------------------------------------------
  // Geometry setters – mark upload dirty so rendering() re-uploads to GPU
  // -----------------------------------------------------------------------

  setVertices(verts: Float32Array): void {
    this._vertices = verts
    this._needsUpload = true
    this._updateContentSizeFromVertices()
  }

  setUVs(uvs: Float32Array): void {
    this._uvs = uvs
    this._needsUpload = true
  }

  setIndices(inds: Uint16Array): void {
    this._indices = inds
    this._needsUpload = true
  }

  setTexture(tex: Texture2D): void {
    this._texture = tex
  }

  setSpriteFrame(spriteFrame: any): void {
    if (!spriteFrame) return
    // spriteFrame may be a SpriteFrame with ._texture or a raw Texture2D
    if (spriteFrame._texture) {
      this._texture = spriteFrame._texture
    } else if (typeof (spriteFrame as any)._webTextureObj !== 'undefined') {
      this._texture = spriteFrame as any
    }
  }

  // set alpha multiplier
  setAlpha(a: number): void {
    this._alpha = a
  }

  // cleanup GL buffers on exit
  onExit(): void {
    super.onExit()
    const cmd = this._renderCmd as any
    if (cmd && typeof cmd.destroy === 'function') {
      cmd.destroy()
    }
  }

  _createRenderCmd() {
    return new SimpleMeshWebGLRenderCmd(this)
  }

  // convenience static to create a quad mesh
  static createQuad(x: number, y: number, w: number, h: number, u0: number, v0: number, uw: number, vh: number) {
    const verts = new Float32Array([x, y, x + w, y, x + w, y + h, x, y + h])
    const u1 = u0 + uw, v1 = v0 + vh
    const uvs = new Float32Array([u0, v0, u1, v0, u1, v1, u0, v1])
    const inds = new Uint16Array([0, 1, 2, 0, 2, 3])
    return { vertices: verts, uvs, indices: inds }
  }
}
