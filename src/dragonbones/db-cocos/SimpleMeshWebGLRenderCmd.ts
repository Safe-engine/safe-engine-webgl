// ---------------------------------------------------------------------------
// Render command: draws the mesh geometry via a custom WebGL shader.
// It is called by the engine's rendering loop via cmd.rendering(ctx).

import { _renderContext, director, log, SpriteWebGLRenderCmd, view } from "safex-webgl"
import { SimpleMeshNode } from "./SimpleMeshNode"

// ---------------------------------------------------------------------------
export class SimpleMeshWebGLRenderCmd extends SpriteWebGLRenderCmd {
  _needDraw = true
  declare _node: SimpleMeshNode

  // GL objects – lazily initialised on first render
  _gl: WebGLRenderingContext | null = null
  _program: WebGLProgram | null = null
  _vbo: WebGLBuffer | null = null
  _uvbo: WebGLBuffer | null = null
  _ibo: WebGLBuffer | null = null

  constructor(node: SimpleMeshNode) {
    super(node)
  }

  // -----------------------------------------------------------------------
  // Stubs required by Sprite: it calls these on _renderCmd during init,
  // setTextureRect, setBatchNode, setTexture, etc.
  // SimpleMeshNode manages its own geometry, so these are safe no-ops.
  // -----------------------------------------------------------------------

  /** Called by Sprite.setTextureRect → we handle our own UVs, ignore. */
  _setTextureCoords(_rect: any, _needConvert?: boolean): void {}

  /** Called by Sprite when color changes. */
  _setColorDirty(): void {}

  /** Called by Sprite.setBlendFunc. */
  updateBlendFunc(_blendFunc: any): void {}

  /** Called by Sprite.setTextureRect to optionally swap the texture for rotated atlases. */
  _handleTextureForRotatedTexture(texture: any): any { return texture }

  /** Called by Sprite to validate texture rect boundaries. */
  _checkTextureBoundary(_texture: any, _rect: any, _rotated: boolean): void {}

  /** Called by Sprite.addChild when inside a SpriteBatchNode. */
  _setBatchNodeForAddChild(_child: any): boolean { return true }

  /** Called by Sprite.setTexture / setTextureRect to update the internal texture ref. */
  _setTexture(_texture: any): void {
    if (_texture !== undefined && _texture !== null) {
      this._node._texture = _texture
    }
  }

  /** Called by Sprite.isFrameDisplayed. */
  isFrameDisplayed(_frame: any): boolean { return false }

  /** Override: mesh is always drawable as long as it has geometry. */
  needDraw(): boolean {
    const node = this._node
    return !!(node._vertices && node._vertices.length > 0 && node._indices && node._indices.length > 0)
  }


  rendering(_ctx: any): void {
    const node = this._node
    if (!node._visible) return
    if (!node._vertices || !node._uvs || !node._indices) return
    if (node._vertices.length === 0 || node._indices.length === 0) return
    if (node._vertices.length / 2 !== node._uvs.length / 2) return

    const gl = _renderContext as WebGLRenderingContext
    this._ensureGL(gl)
    if (!this._program) return

    // ---------- save engine state ----------
    const prevProgram = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram

    gl.useProgram(this._program)

    // ---------- upload buffers if dirty ----------
    if (node._needsUpload) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo)
      gl.bufferData(gl.ARRAY_BUFFER, node._vertices, gl.DYNAMIC_DRAW)

      gl.bindBuffer(gl.ARRAY_BUFFER, this._uvbo)
      gl.bufferData(gl.ARRAY_BUFFER, node._uvs, gl.STATIC_DRAW)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, node._indices, gl.STATIC_DRAW)

      node._needsUpload = false
    }

    // ---------- attrib pointers ----------
    const aPosLoc = gl.getAttribLocation(this._program, 'a_position')
    const aUVLoc = gl.getAttribLocation(this._program, 'a_texcoord')

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo)
    gl.enableVertexAttribArray(aPosLoc)
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvbo)
    gl.enableVertexAttribArray(aUVLoc)
    gl.vertexAttribPointer(aUVLoc, 2, gl.FLOAT, false, 0, 0)

    // ---------- texture ----------
    gl.activeTexture(gl.TEXTURE0)
    const tex = node._texture as any
    if (tex && tex._webTextureObj) {
      gl.bindTexture(gl.TEXTURE_2D, tex._webTextureObj)
    } else if (tex && typeof tex.getHtmlElementObj === 'function') {
      const img = tex.getHtmlElementObj()
      if (img) {
        const tmp = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tmp)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      } else {
        gl.bindTexture(gl.TEXTURE_2D, null)
      }
    } else {
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
    gl.uniform1i(gl.getUniformLocation(this._program, 'u_texture'), 0)

    // ---------- resolution ----------
    const viewAny = view as any
    const sz = viewAny.getFrameSize ? viewAny.getFrameSize() : director.getWinSize()
    gl.uniform2f(gl.getUniformLocation(this._program, 'u_resolution'), sz.width, sz.height)

    // ---------- model matrix from _worldTransform (set by engine transform pass) ----------
    // _worldTransform is { a, b, c, d, tx, ty } — 2D affine.
    // Build a column-major mat3 for GLSL:
    //   col0: [wt.a, wt.b, 0]
    //   col1: [wt.c, wt.d, 0]
    //   col2: [wt.tx, wt.ty, 1]
    const wt = (this as any)._worldTransform
    let ma = 1, mb = 0, mc = 0, md = 1, mtx = 0, mty = 0
    if (wt) { ma = wt.a; mb = wt.b; mc = wt.c; md = wt.d; mtx = wt.tx; mty = wt.ty }
    const modelMat = new Float32Array([ma, mb, 0, mc, md, 0, mtx, mty, 1])
    gl.uniformMatrix3fv(gl.getUniformLocation(this._program, 'u_model'), false, modelMat)

    // ---------- alpha ----------
    gl.uniform1f(gl.getUniformLocation(this._program, 'u_alpha'), node._alpha ?? 1.0)

    // ---------- blending ----------
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // ---------- draw ----------
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo)
    gl.drawElements(gl.TRIANGLES, node._indices.length, gl.UNSIGNED_SHORT, 0)

    // ---------- cleanup ----------
    gl.disableVertexAttribArray(aPosLoc)
    gl.disableVertexAttribArray(aUVLoc)

    // Restore the engine's previous program so subsequent drawing is correct
    if (prevProgram) gl.useProgram(prevProgram)
  }

  // ---------- helpers ----------

  _ensureGL(gl: WebGLRenderingContext): void {
    if (this._program) return   // already done
    this._gl = gl

    const vsSrc = [
      'attribute vec2 a_position;',
      'attribute vec2 a_texcoord;',
      'uniform mat3 u_model;',
      'uniform vec2 u_resolution;',
      'varying vec2 v_uv;',
      'void main() {',
      '  vec2 pos = (u_model * vec3(a_position, 1.0)).xy;',
      '  vec2 clipSpace = (pos / u_resolution) * 2.0 - 1.0;',
      '  gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);',
      '  v_uv = a_texcoord;',
      '}',
    ].join('\n')

    const fsSrc = [
      'precision mediump float;',
      'varying vec2 v_uv;',
      'uniform sampler2D u_texture;',
      'uniform float u_alpha;',
      'void main() {',
      '  vec4 c = texture2D(u_texture, v_uv);',
      '  gl_FragColor = vec4(c.rgb, c.a * u_alpha);',
      '}',
    ].join('\n')

    const compileShader = (src: string, type: number): WebGLShader | null => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        log(`SimpleMesh shader compile error:\n${gl.getShaderInfoLog(s)}`)
        gl.deleteShader(s)
        return null
      }
      return s
    }

    const vs = compileShader(vsSrc, gl.VERTEX_SHADER)
    const fs = compileShader(fsSrc, gl.FRAGMENT_SHADER)
    if (!vs || !fs) return

    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      log(`SimpleMesh program link error:\n${gl.getProgramInfoLog(prog)}`)
      gl.deleteProgram(prog)
      return
    }
    this._program = prog
    this._vbo = gl.createBuffer()
    this._uvbo = gl.createBuffer()
    this._ibo = gl.createBuffer()
  }

  // Called by onExit – release GPU resources
  destroy(): void {
    if (!this._gl) return
    try {
      if (this._vbo) this._gl.deleteBuffer(this._vbo)
      if (this._uvbo) this._gl.deleteBuffer(this._uvbo)
      if (this._ibo) this._gl.deleteBuffer(this._ibo)
      if (this._program) this._gl.deleteProgram(this._program)
    } catch (e) {
      console.warn('SimpleMeshWebGLRenderCmd.destroy', e)
    }
    this._gl = null
    this._program = null
    this._vbo = null
    this._uvbo = null
    this._ibo = null
  }
}