import { DrawNode, Size, Sprite } from 'safex-webgl'
import { BaseComponentProps, Color4B, ColorSource, Vec2 } from '..'
import { ComponentX, render } from '../core/decorator'

export class NodeRender extends ComponentX {
  nodeName: string
}
// enum SpriteTypes {
//   SIMPLE,
//   SLICED,
//   TILED,
//   FILLED,
//   MESH,
//   ANIMATION,
// }
interface SpriteRenderProps {
  spriteFrame: string
  // type?: SpriteTypes
  capInsets?: [number, number, number, number]
  tiledSize?: Size
}

export class SpriteRender extends ComponentX<SpriteRenderProps & BaseComponentProps<SpriteRender>, Sprite> {
  get spriteFrame() {
    return this.props.spriteFrame
  }

  set spriteFrame(frame) {
    this.props.spriteFrame = frame
    if (this.node && this.node.instance instanceof Sprite) {
      this.node.instance.setTexture(frame)
    }
  }
  updateTiled() {
    // effect to native only
    // createTiledSprite()
  }
}

interface GraphicsRenderProps {
  lineWidth?: number
  strokeColor?: ColorSource
  fillColor?: ColorSource
}

export class GraphicsRender extends ComponentX<GraphicsRenderProps & BaseComponentProps<GraphicsRender>, DrawNode> {
  drawDot(center: Vec2, r: number) {
    this.node.instance.drawDot(center, r, this.props.fillColor)
  }
  drawLine(origin: Vec2, destination: Vec2, thickness?: Float, color?: Color4B) {
    this.node.instance.drawSegment(origin, destination, thickness || this.props.lineWidth, color || this.props.strokeColor)
  }
  drawRect(origin: Vec2, destination: Vec2, color?: Color4B) {
    this.node.instance.drawRect(origin, destination, color || this.props.fillColor)
  }
  // drawSolidRect(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  drawCircle(center: Vec2, radius: Float, angle = 0, segments = 64, drawLineToCenter = true, lineWidth?: Float, color?: Color4B) {
    this.node.instance.drawCircle(
      center,
      radius,
      angle,
      segments,
      drawLineToCenter,
      lineWidth || this.props.lineWidth,
      color || this.props.fillColor,
    )
  }

  drawSolidCircle(center: Vec2, radius: Float, angle = 0, segments = 64, color?: Color4B) {
    this.node.instance.drawCircle(center, radius, angle, segments, true, this.props.lineWidth, color || this.props.fillColor)
    this.node.instance.drawDot(center, radius, this.props.fillColor)
  }
  // drawQuadBezier(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  // drawCubicBezier(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  // drawCardinalSpline(points: Vec2[], color: Color4B) {
  // }
  // drawCatmullRom(points: Vec2[], color: Color4B) {
  // }
  drawPoly(points: Vec2[], color?: Color4B, thickness?: Float) {
    this.node.instance.drawPoly(points, color || this.props.fillColor, thickness || this.props.lineWidth, this.props.strokeColor)
  }
  // drawSolidPoly(points: Vec2[], color: Color4B) {
  //   this.node.instance.drawPoly(points, color)
  // }
  // drawSegment(from: Vec2, to: Vec2, color: Color4B) {
  // }
  // drawTriangle(p1: Vec2, p2: Vec2, p3: Vec2, color: Color4B) {
  //   this.node.instance.poly([p1, p2, p3], true)
  //   this.node.instance.fill(color)
  // }

  visit() {
    this.node.instance.visit()
  }

  clear() {
    if (this.node.instance instanceof DrawNode) {
      this.node.instance.clear()
    }
  }
}

Object.defineProperty(NodeRender.prototype, 'render', { value: render })
Object.defineProperty(SpriteRender.prototype, 'render', { value: render })
Object.defineProperty(GraphicsRender.prototype, 'render', { value: render })
