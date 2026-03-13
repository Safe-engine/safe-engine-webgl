import { ATTRIBUTE_NAME_COLOR, ATTRIBUTE_NAME_POSITION, ATTRIBUTE_NAME_TEX_COORD, Sprite, VERTEX_ATTRIB_COLOR, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TEX_COORDS } from 'safex-webgl'
import { GLProgram } from 'safex-webgl/shaders'
import { tieldFsh, tiledVsh } from './shader'

export class TiledSpriteNode extends Sprite {
  _program: GLProgram
  _tileScaleLoc: WebGLUniformLocation
  _texSizeLoc: WebGLUniformLocation
  _texLoc: WebGLUniformLocation
  _scaleLoc: WebGLUniformLocation
  _sizeLoc: WebGLUniformLocation

  constructor(file) {
    super(file)
    this.initShader()
  }

  initShader() {
    const program = new GLProgram()
    program.initWithVertexShaderByteArray(tiledVsh, tieldFsh)
    program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
    program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
    program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
    program.link()
    program.updateUniforms()

    program.use()
    this._program = program
    this.setShaderProgram(program)

    // Lưu lại uniform location để update nhanh
    this._tileScaleLoc = program.getUniformLocationForName('u_tileScale')
    this._texSizeLoc = program.getUniformLocationForName('u_texSize')
    this._texLoc = program.getUniformLocationForName('u_texture')
    this._scaleLoc = program.getUniformLocationForName('u_scale')
    this._sizeLoc = program.getUniformLocationForName('u_size')
    // this.scheduleUpdate()
  }

  updateShaderUniforms() {
    if (!this._program || !this.getTexture() || !this.getTexture().isLoaded()) return

    const texW = this.getTexture()._getWidth()
    const texH = this.getTexture()._getHeight()
    const { height, width } = this.getContentSize()
    // console.log('TiledSprite updateShaderUniforms', { height, width }, texW, texH)
    const scaleX = width / texW
    const scaleY = height / texH

    this._program.use()
    this._program.setUniformLocationWith2f(this._tileScaleLoc, scaleX, scaleY)
    this._program.setUniformLocationWith2f(this._texSizeLoc, texW, texH)
    this._program.setUniformLocationWith1i(this._texLoc, 0)
    this._program.setUniformLocationWith2f(this._scaleLoc, scaleX, scaleY)
    this._program.setUniformLocationWith2f(this._sizeLoc, width, height)
  }

  setContentSize(w, h) {
    super.setContentSize(w, h)
    this.updateShaderUniforms()
  }
}

export function createTiledSprite(src: string, totalW: number, totalH: number) {
  const tileSprite = new Sprite(src)
  // lấy kích thước gốc của texture
  const tileW = tileSprite.getTexture()._getWidth()
  const tileH = tileSprite.getTexture()._getHeight()
  const program = new GLProgram()
  program.initWithString(tiledVsh, tieldFsh)
  // program.initWithVertexShaderByteArray(vert, frag);
  program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
  program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
  program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
  if (!program.link()) {
    console.error('Failed to link shader program')
    return
  }
  program.updateUniforms()
  program.setUniformLocationWith1i(program.getUniformLocationForName('u_texture'), 0)
  const tileScaleLoc = program.getUniformLocationForName('u_tileScale')
  const texSizeLoc = program.getUniformLocationForName('u_texSize')
  const scaleX = totalW / tileW
  const scaleY = totalH / tileH
  if (tileSprite.getTexture().isLoaded()) afterLoaded()
  else tileSprite.getTexture().addLoadedEventListener(afterLoaded)

  function afterLoaded() {
    // program.use()
    program.setUniformLocationWith2f(texSizeLoc, tileW, tileH)
    program.setUniformLocationWith2f(tileScaleLoc, scaleX, scaleY)
    tileSprite.setShaderProgram(program)
    // nếu dùng batch node hoặc spriteframe atlas, đảm bảo texture unit đúng
  }
  // tileSprite.setContentSize(totalW, totalH)
  tileSprite.setScale(scaleX, scaleY)
  return tileSprite
}
