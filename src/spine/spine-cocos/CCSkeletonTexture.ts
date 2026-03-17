import { Texture } from '@esotericsoftware/spine-core'
import { _renderContext } from 'safex-webgl'
import { glBindTexture2D } from 'safex-webgl/shaders'

export class SkeletonTexture extends Texture {
  // constructor(image) {
  //   super(image)
  // }
  name = 'SkeletonTexture'
  _texture = null

  setRealTexture(tex) {
    this._texture = tex
  }

  getRealTexture() {
    return this._texture
  }

  setFilters(minFilter, magFilter) {
    const gl = _renderContext
    this.bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter)
  }

  setWraps(uWrap, vWrap) {
    const gl = _renderContext
    this.bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, uWrap)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, vWrap)
  }

  dispose() { }

  bind() {
    glBindTexture2D(this._texture)
  }
}
