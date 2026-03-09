import { Vec2 } from '../polyfills'

export class PhysicsSprite {
  node: cc.Node
  physicsBody: cp.Body

  constructor(node: cc.Node, body: cp.Body) {
    this.node = node
    this.physicsBody = body
  }

  update(dt: number) {
    if (!this.physicsBody) {
      return
    }
    const { x, y } = this.physicsBody.getPos()
    // use cc.lerp to smooth the position update
    // const pos = Vec2(cc.lerp(this.node.x, x, dt * 10), cc.lerp(this.node.y, y, dt * 10))
    this.node.setPosition(x, y)
    // lerp the rotation
    // this.node.setRotation(cc.lerp(this.node.rotation, -cc.radiansToDegrees(this.physicsBody.a), dt * 10))
    this.node.setRotation(-cc.radiansToDegrees(this.physicsBody.a))
    // this.node.setScale(1 / this.physicsBody.GetFixtureList().GetShape().GetRadius())
  }

  getBody() {
    return this.physicsBody
  }

  set position(val: cp.Vect) {
    this.physicsBody.setPos(val)
  }

  set x(val) {
    this.physicsBody.setPos(Vec2(val, this.y))
  }
  set y(val) {
    this.physicsBody.setPos(Vec2(this.x, val))
  }

  get x() {
    return this.physicsBody.getPos().x
  }

  get y() {
    return this.physicsBody.getPos().y
  }

  set rotation(val: number) {
    this.physicsBody.setAngle(-cc.degreesToRadians(val))
  }

  get rotation() {
    return -cc.radiansToDegrees(this.physicsBody.a)
  }

  addChild(child: cc.Node) {
    this.node.addChild(child)
  }
}
