import { EntityManager, EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '..'
import { RichTextComp } from './RichTextComp'

export class RichTextSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, RichTextComp, this.onAddRichTextComp)
  }

  private onAddRichTextComp: EventReceiveCallback<RichTextComp> = ({ entity, component: rich }) => {
    const { string = '', isAdaptWithSize } = rich.props
    const node = new ccui.RichText()
    // node.width = 500
    // node.height = 300
    node.ignoreContentAdaptWithSize(!isAdaptWithSize)
    rich.node = entity.assign(new NodeComp(node, entity))
    rich.string = string
  }

  update(entities: EntityManager, events: EventManager, dt: number)
  update() {
    // throw new Error('Method not implemented.');
  }
}
