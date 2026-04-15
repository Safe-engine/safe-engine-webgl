import { _renderContext, NodeWebGLRenderCmd } from "safex-webgl"
import { DicedSprite } from "./DicedSprite"

export class DicedSpriteWebGLRenderCmd extends NodeWebGLRenderCmd {
  declare _node: DicedSprite

  rendering(ctx) {
    const node = this._node
    const gl = _renderContext

    if (!node._vertices) return

    gl.bindTexture(0, node._texture)

    // enable attrib
    gl.enableVertexAttribArray(0)
    gl.enableVertexAttribArray(1)

    // vertices
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, node._vertices)

    // uvs
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, node._uvs)

    gl.drawElements(
      gl.TRIANGLES,
      node._indices.length,
      gl.UNSIGNED_SHORT,
      node._indices
    )
  }
}
