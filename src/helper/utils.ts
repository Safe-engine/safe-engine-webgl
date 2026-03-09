import { Constructor, EntityManager, EventManager, EventReceive, EventTypes, System } from 'entityx-ts'

import { ComponentX } from '../core/decorator'
import { NodeComp } from '../core/NodeComp'
import { SceneComponent } from '../core/Scene'
import { GameWorld } from '../gworld'

export function registerSystem<T extends ComponentX>(component: Constructor<T>) {
  if (GameWorld.Instance.systems.isRegistered(`${component.name}System`)) {
    return
  }
  class NewSystem implements System {
    configure(event_manager: EventManager) {
      console.log('configure registerSystem', component.name)
      event_manager.subscribe(EventTypes.ComponentAdded, component, (event: EventReceive<T>) => {
        const ett = event.entity
        const newComp = event.component as any
        newComp.node = ett.getComponent(NodeComp)
      })
      event_manager.subscribe(EventTypes.ComponentRemoved, component, (event: EventReceive<T>) => {
        const newComp = event.component as any
        if (newComp.destroy) {
          newComp.destroy()
        }
      })
    }

    update(entities: EntityManager, events: EventManager, dt: number) {
      for (const entt of entities.entities_with_components(component)) {
        const comp = entt.getComponent(component)
        // console.log('comp', comp.constructor.name, typeof comp['update'] === 'function')
        if (comp.node.active && comp.enabled && typeof comp['update'] === 'function') {
          comp['update'](dt)
        }
      }
    }
  }
  Object.defineProperty(NewSystem, 'name', { value: `${component.name}System` })
  GameWorld.Instance.addSystemAndUpdate(NewSystem)
  return NewSystem
}

export type GetProps<T> = T extends ComponentX<infer P> ? P : never

export function instantiate<T extends ComponentX>(ComponentType: Constructor<T>, data?: GetProps<T>): T {
  const instance = new ComponentType(data)
  instance.init(data)
  if (!instance.render) {
    return instance
  }
  return instance.render()
}
export async function loadScene<T extends SceneComponent>(ComponentType: Constructor<T>) {
  const world = GameWorld.Instance
  world.entities.reset()
  const instance = new ComponentType()
  if (instance.preLoad) {
    await instance.preLoad()
  }
  instance.render()
}
