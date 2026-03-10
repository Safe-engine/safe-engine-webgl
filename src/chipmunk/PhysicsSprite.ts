import { Vec2 } from '../polyfills'

export class PhysicsSprite {
  node: Node
  physicsBody: cp.Body

  constructor(node: Node, body: cp.Body) {
    this.node = node
    this.physicsBody = body
  }

  update(dt: number) {
    if (!this.physicsBody) {
      return
    }
    const { x, y } = this.physicsBody.getPos()
    // use lerp to smooth the position update
    // const pos = Vec2(lerp(this.node.x, x, dt * 10), lerp(this.node.y, y, dt * 10))
    this.node.setPosition(x, y)
    // lerp the rotation
    // this.node.setRotation(lerp(this.node.rotation, -radiansToDegrees(this.physicsBody.a), dt * 10))
    this.node.setRotation(-radiansToDegrees(this.physicsBody.a))
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
    this.physicsBody.setAngle(-degreesToRadians(val))
  }

  get rotation() {
    return -radiansToDegrees(this.physicsBody.a)
  }

  addChild(child: Node) {
    this.node.addChild(child)
  }
}
