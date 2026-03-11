import { DrawNode, pMult } from 'safex-webgl'
import { Color4B, Vec2 } from '../../../safex-webgl/src/polyfills'
import { PTM_RATIO } from './PhysicsSystem'

export const makeDebugDraw = (graphics: DrawNode, pixelsPerMeter, box2D: typeof Box2D) => {
  const {
    b2Color,
    b2Draw: { e_shapeBit },
    b2Transform,
    b2Vec2,
    JSDraw,
    wrapPointer,
  } = box2D

  /**
   * to replace original C++ operator =
   * @param {Box2D.b2Vec2} vec
   * @returns {Box2D.b2Vec2}
   */
  // const copyVec2 = (vec: Box2D.b2Vec2) => new b2Vec2(vec.get_x(), vec.get_y())

  /**
   * to replace original C++ operator *= (float)
   * @param {Box2D.b2Vec2} vec
   * @param {number} scale
   * @returns {Box2D.b2Vec2}
   */
  // const scaledVec2 = (vec: Box2D.b2Vec2, scale: number) => new b2Vec2(scale * vec.get_x(), scale * vec.get_y())

  /**
   * @param {Box2D.b2Color} color
   * @returns {string}
   */
  const getRgbStr = (color: Box2D.b2Color) => {
    const red = (color.get_r() * 255) | 0
    const green = (color.get_g() * 255) | 0
    const blue = (color.get_b() * 255) | 0
    return Color4B(red, green, blue, 100)
  }

  /**
   * @param {string} rgbStr
   * @returns {void}
   */
  const setCtxColor = (rgbStr: Color4B) => {
    // console.log('setCtxColor', rgbStr)
    graphics.setColor(rgbStr)
    // graphics.strokeStyle = { color: rgbStr }
  }

  /**
   * @param {Box2D.b2Vec2[]} vertices
   * @param {boolean} fill
   * @returns {void}
   */
  const drawPolygon = (vertices, fill) => {
    const fixed = vertices.map(Vec2).map((v) => v.mul(PTM_RATIO))
    // console.log('drawPolygon', fixed, fill)
    if (fill) graphics.drawPoly(fixed, Color4B(255, 0, 0, 50), 2, Color4B(255, 0, 0, 250))
    else graphics.drawPoly(fixed, Color4B(255, 0, 0, 0), 2, Color4B(255, 255, 255, 150))
    // graphics.drawPoly(vertices[vertices.length - 1].x * pixelsPerMeter, vertices[vertices.length - 1].y * pixelsPerMeter)
    // vertices.forEach((v) => {
    //   graphics.lineTo(v.x * pixelsPerMeter, v.y * pixelsPerMeter)
    // })
    // graphics.fill()
  }

  /**
   * @param {Box2D.b2Vec2} center
   * @param {number} radius
   * @param {Box2D.b2Vec2} axis
   * @param {boolean} fill
   * @returns {void}
   */
  const drawCircle = (center, radius, axis, fill) => {
    graphics.drawCircle(pMult(center, PTM_RATIO), radius * PTM_RATIO, 0, 32, fill, 2, Color4B(255, 0, 0, 150))
  }

  /**
   * @param {Box2D.b2Vec2} vert1
   * @param {Box2D.b2Vec2} vert2
   * @returns {void}
   */
  const drawSegment = (vert1, vert2) => {
    // console.log("drawSegment", vert1, vert2)
    graphics.drawSegment(Vec2(vert1.get_x(), vert1.get_y()), Vec2(vert2.get_x(), vert2.get_y()))
  }

  /**
   * @param {Box2D.b2Vec2} vertex
   * @param {number} sizeMetres
   * @returns {void}
   */
  const drawPoint = (vertex, sizeMetres) => {
    const sizePixels = sizeMetres / pixelsPerMeter
    graphics.drawDot(Vec2(vertex.get_x() - sizePixels / 2, vertex.get_y() - sizePixels / 2), sizePixels)
  }

  /**
   * @param {Box2D.b2Transform} transform
   * @param {number} sizeMetres
   * @returns {void}
   */
  const drawTransform = (transform: Box2D.b2Transform) => {
    const pos = transform.get_p()
    const rot = transform.get_q()
    graphics.drawSegment(Vec2(pos.get_x(), pos.get_y()), Vec2(pos.get_x() + rot.GetXAxis().get_x(), pos.get_y() + rot.GetXAxis().get_y()))
    // graphics.setTransform()
    // graphics.save()
    // graphics.translateTransform(pos.get_x(), pos.get_y())
    // graphics.scaleTransform(0.5, 0.5)
    // graphics.rotateTransform(rot.GetAngle())
    // graphics.lineWidth *= 2;
    // graphics.restore()
  }

  /** {@link Box2D.b2Vec2} is a struct of `float x, y` */
  const sizeOfB2Vec = Float32Array.BYTES_PER_ELEMENT * 2

  /**
   * @param {number} array_p pointer to {@link Box2D.b2Vec2}
   * @param {number} numElements length of array
   * @param {number} sizeOfElement size of an instance of the array element
   * @param {typeof Box2D.b2Vec2} ctor constructor for the array element
   * @return {Box2D.b2Vec2[]}
   */
  const reifyArray = (array_p, numElements, sizeOfElement, ctor) =>
    Array(numElements)
      .fill(undefined)
      .map((_, index) => wrapPointer(array_p + index * sizeOfElement, ctor))

  const debugDraw = Object.assign(new JSDraw(), {
    /**
     * @param {number} vert1_p pointer to {@link Box2D.b2Vec2}
     * @param {number} vert2_p pointer to {@link Box2D.b2Vec2}
     * @param {number} color_p pointer to {@link Box2D.b2Color}
     * @returns {void}
     */
    DrawSegment(vert1_p, vert2_p, color_p) {
      const color = wrapPointer(color_p, b2Color)
      setCtxColor(getRgbStr(color))
      const vert1 = wrapPointer(vert1_p, b2Vec2)
      const vert2 = wrapPointer(vert2_p, b2Vec2)
      drawSegment(vert1, vert2)
    },
    /**
     * @param {number} vertices_p pointer to Array<{@link Box2D.b2Vec2}>
     * @param {number} vertexCount
     * @param {number} color_p pointer to {@link Box2D.b2Color}
     * @returns {void}
     */
    DrawPolygon(vertices_p, vertexCount, color_p) {
      const color = wrapPointer(color_p, b2Color)
      setCtxColor(getRgbStr(color))
      const vertices = reifyArray(vertices_p, vertexCount, sizeOfB2Vec, b2Vec2)
      drawPolygon(vertices, color)
      // console.log(`DrawPolygon`, getRgbStr(color).green, vertices[0].y)
    },
    /**
     * @param {number} vertices_p pointer to Array<{@link Box2D.b2Vec2}>
     * @param {number} vertexCount
     * @param {number} color_p pointer to {@link Box2D.b2Color}
     * @returns {void}
     */
    DrawSolidPolygon(vertices_p, vertexCount, color_p) {
      const color = wrapPointer(color_p, b2Color)
      setCtxColor(getRgbStr(color))
      const vertices = reifyArray(vertices_p, vertexCount, sizeOfB2Vec, b2Vec2)
      drawPolygon(vertices, true)
    },
    /**
     * @param {number} center_p pointer to {@link Box2D.b2Vec2}
     * @param {number} radius
     * @param {number} color_p pointer to {@link Box2D.b2Color}
     * @returns {void}
     */
    DrawCircle(center_p, radius, color_p) {
      const color = wrapPointer(color_p, b2Color)
      setCtxColor(getRgbStr(color))
      const center = wrapPointer(center_p, b2Vec2)
      const dummyAxis = new b2Vec2(0, 0)
      drawCircle(center, radius, dummyAxis, false)
    },
    /**
     * @param {number} center_p pointer to {@link Box2D.b2Vec2}
     * @param {number} radius
     * @param {number} axis_p pointer to {@link Box2D.b2Vec2}
     * @param {number} color_p pointer to {@link Box2D.b2Color}
     * @returns {void}
     */
    DrawSolidCircle(center_p, radius, axis_p, color_p) {
      const color = wrapPointer(color_p, b2Color)
      setCtxColor(getRgbStr(color))
      const center = wrapPointer(center_p, b2Vec2)
      const axis = wrapPointer(axis_p, b2Vec2)
      drawCircle(center, radius, axis, true)
    },
    /**
     * @param {number} transform_p pointer to {@link Box2D.b2Transform}
     * @returns {void}
     */
    DrawTransform(transform_p) {
      const transform = wrapPointer(transform_p, b2Transform)
      drawTransform(transform)
    },
    /**
     * @param {number} vertex_p pointer to {@link Box2D.b2Vec2}
     * @param {number} sizeMetres
     * @param {number} pointer to {@link Box2D.b2Color}
     * @returns {void}
     */
    DrawPoint(vertex_p, sizeMetres, color_p) {
      const color = wrapPointer(color_p, b2Color)
      setCtxColor(getRgbStr(color))
      const vertex = wrapPointer(vertex_p, b2Vec2)
      drawPoint(vertex, sizeMetres)
    },
  })
  debugDraw.SetFlags(e_shapeBit)
  return debugDraw
}
