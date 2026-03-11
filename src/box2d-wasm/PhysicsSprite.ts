import { lerp, Node, Vec2 } from 'safex-webgl'
import { radiansToDegrees } from '../helper'
import { PTM_RATIO } from './PhysicsSystem'

export class PhysicsSprite {
  node: Node
  physicsBody: Box2D.b2Body

  constructor(node: Node, body: Box2D.b2Body) {
    this.node = node
    this.physicsBody = body
  }

  update(dt: number) {
    if (!this.physicsBody) {
      return
    }
    // const pos = this.physicsBody.GetPosition()
    // use lerp to smooth the position update
    const pos = Vec2(
      lerp(this.node.getPositionX(), this.physicsBody.GetPosition().x * PTM_RATIO, dt * 10),
      lerp(this.node.getPositionY(), this.physicsBody.GetPosition().y * PTM_RATIO, dt * 10),
    )
    this.node.setPosition(pos.x, pos.y)
    // lerp the rotation
    this.node.setRotation(lerp(this.node.getRotation(), radiansToDegrees(-this.physicsBody.GetAngle()), dt * 10))
    // this.node.setRotation(radiansToDegrees(this.physicsBody.GetAngle()))
    // this.node.setScale(1 / pixelsPerMeter)
    // this.node.setScale(1 / this.physicsBody.GetFixtureList().GetShape().GetRadius())
  }

  getBody() {
    return this.physicsBody
  }

  set position(val: Box2D.b2Vec2) {
    this.physicsBody.SetTransform(val, this.node.getRotation())
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

  addChild(child: Node) {
    this.node.addChild(child)
  }
}
