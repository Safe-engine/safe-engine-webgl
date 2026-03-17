import { EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { Color, DrawNode, Node, Rect, Sprite, spriteFrameCache } from 'safex-webgl'
import { Scale9Sprite } from 'safex-webgl/ui'
import { NodeComp } from '../core/NodeComp'
import { GraphicsRender, NodeRender, SpriteRender } from './RenderComponent'
import { createTiledSprite } from './TiledSprite'

export enum SpriteTypes {
  SIMPLE,
  SLICED,
  TILED,
  FILLED,
  MESH,
  ANIMATION,
}

export class RenderSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, NodeRender, this.onAddNodeRender)
    event_manager.subscribe(EventTypes.ComponentAdded, SpriteRender, this.onAddSpriteRender)
    event_manager.subscribe(EventTypes.ComponentAdded, GraphicsRender, this.onAddGraphicsRender)
    event_manager.subscribe(EventTypes.ComponentRemoved, NodeComp, this.onRemovedNodeComp)
  }

  private onAddNodeRender: EventReceiveCallback<NodeRender> = ({ entity }) => {
    const nodeRenderComp = entity.getComponent(NodeRender)
    const node = new Node()
    const ett = entity
    nodeRenderComp.node = ett.assign(new NodeComp(node, ett))
  }

  private onAddSpriteRender: EventReceiveCallback<SpriteRender> = ({ entity, component: spriteComp }) => {
    const { spriteFrame, capInsets, tiledSize } = spriteComp.props
    const frame = spriteFrameCache.getSpriteFrame(spriteFrame)
    // console.log('frame', spriteFrame, frame)
    let node
    if (tiledSize) {
      node = createTiledSprite(spriteFrame, tiledSize.width, tiledSize.height)
    } else if (capInsets) {
      const rc = Rect(...capInsets)
      node = new Scale9Sprite(frame || spriteFrame, rc, rc)
      // console.log('Scale9Sprite', node)
    } else {
      node = new Sprite(frame || spriteFrame)
    }
    const ett = entity
    spriteComp.node = ett.assign(new NodeComp(node, ett))
  }

  private onAddGraphicsRender = ({ entity }) => {
    const graphicsComp = entity.getComponent(GraphicsRender)
    const { lineWidth = 5, strokeColor = Color.RED, fillColor = Color.BLUE } = graphicsComp.props
    const node = new DrawNode()
    node.setColor(strokeColor)
    node.setDrawColor(fillColor)
    node.setLineWidth(lineWidth)
    graphicsComp.node = entity.assign(new NodeComp(node, entity))
  }

  private onRemovedNodeComp = ({ component }) => {
    const node = component as NodeComp
    if (node.instance) {
      node.instance.removeFromParent(true)
    }
  }

  // update(entities: EntityManager, events: EventManager, dt: number)
  // update() {
  // }
}
