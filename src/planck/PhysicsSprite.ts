import { Body } from 'planck'
import { Node, radiansToDegrees, Vec2 } from 'safex-webgl'
import { PTM_RATIO } from './PhysicsSystem'

export class PhysicsSprite {
  node: Node
  physicsBody: Body

  constructor(node: Node, body: Body) {
    this.node = node
    this.physicsBody = body
  }

  update(dt: number) {
    if (!this.physicsBody) {
      return
    }
    const pPos = this.physicsBody.getPosition()
    const pos = Vec2(
      pPos.x * PTM_RATIO,
      pPos.y * PTM_RATIO,
    )
    this.node.setPosition(pos.x, pos.y)
    //  the rotation
    this.node.setRotation(radiansToDegrees(-this.physicsBody.getAngle()))
    // this.node.setRotation(radiansToDegrees(this.physicsBody.GetAngle()))
    // this.node.setScale(1 / pixelsPerMeter)
    // this.node.setScale(1 / this.physicsBody.GetFixtureList().GetShape().GetRadius())
  }

  getBody() {
    return this.physicsBody
  }

  set position(val: Box2D.b2Vec2) {
    this.physicsBody.setTransform(val, this.node.getRotation())
  }

  // set x(val) {
  //   this.physicsBody.setPosition(Vec2(val, this.y))
  // }
  // set y(val) {
  //   this.physicsBody.setPosition(Vec2(this.x, val))
  // }

  get x() {
    return this.physicsBody.getPosition().x
  }

  get y() {
    return this.physicsBody.getPosition().y
  }

  // set angle(val: number) {
  //   this.physicsBody.setAngle(val)
  // }

  get angle() {
    return -this.physicsBody.getAngle()
  }

  addChild(child: Node) {
    this.node.addChild(child)
  }
}
