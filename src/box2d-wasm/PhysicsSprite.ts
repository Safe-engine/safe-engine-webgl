import { Vec2 } from '../polyfills'
import { PTM_RATIO } from './PhysicsSystem'

export class PhysicsSprite {
  node: cc.Node
  physicsBody: Box2D.b2Body

  constructor(node: cc.Node, body: Box2D.b2Body) {
    this.node = node
    this.physicsBody = body
  }

  update(dt: number) {
    if (!this.physicsBody) {
      return
    }
    // const pos = this.physicsBody.GetPosition()
    // use cc.lerp to smooth the position update
    const pos = Vec2(
      cc.lerp(this.node.x, this.physicsBody.GetPosition().x * PTM_RATIO, dt * 10),
      cc.lerp(this.node.y, this.physicsBody.GetPosition().y * PTM_RATIO, dt * 10),
    )
    this.node.setPosition(pos.x, pos.y)
    // lerp the rotation
    this.node.setRotation(cc.lerp(this.node.rotation, cc.radiansToDegrees(-this.physicsBody.GetAngle()), dt * 10))
    // this.node.setRotation(cc.radiansToDegrees(this.physicsBody.GetAngle()))
    // this.node.setScale(1 / pixelsPerMeter)
    // this.node.setScale(1 / this.physicsBody.GetFixtureList().GetShape().GetRadius())
  }

  getBody() {
    return this.physicsBody
  }

  set position(val: Box2D.b2Vec2) {
    this.physicsBody.SetTransform(val, this.node.rotation)
  }

  // set x(val) {
  //   this.physicsBody.setPosition(Vec2(val, this.y))
  // }
  // set y(val) {
  //   this.physicsBody.setPosition(Vec2(this.x, val))
  // }

  get x() {
    return this.physicsBody.GetPosition().x
  }

  get y() {
    return this.physicsBody.GetPosition().y
  }

  // set angle(val: number) {
  //   this.physicsBody.setAngle(val)
  // }

  get angle() {
    return -this.physicsBody.GetAngle()
  }

  addChild(child: cc.Node) {
    this.node.addChild(child)
  }
}
