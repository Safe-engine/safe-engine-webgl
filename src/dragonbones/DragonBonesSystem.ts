import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

import { EventObject } from 'dragonbones-es'
import { loader, textureCache } from 'safex-webgl'
import { NodeComp } from '../core/NodeComp'
import { DragonBonesComp } from './DragonBonesComp'
import { CocosFactory } from './db-cocos/CocosFactory'

export type DragonBonesEventData = { name: string }

export class DragonBonesSystem implements System {
  configure(event_manager: EventManager) {
    CocosFactory.newInstance()
    event_manager.subscribe(EventTypes.ComponentAdded, DragonBonesComp, async ({ entity, component: dbComp }) => {
      const { data, animation, playTimes = 0, timeScale = 1 } = dbComp.props
      // const texturePath = atlas.replace('.json', '.png')
      const { atlas, skeleton, texture } = data
      // textureCache.addImage(texture)
      const factory = CocosFactory.factory
      const dataSkel = loader.getRes(skeleton)
      const dataAtlas = loader.getRes(atlas)
      const tcache = textureCache.getTextureForKey(texture)
      // texture.initWithFile(texturePath)
      const skelData = factory.parseDragonBonesData(dataSkel)
      factory.parseTextureAtlasData(dataAtlas, tcache)
      // factory.loadDragonBonesData(skel)
      // console.log(skeleton, skelData)
      const node = factory.buildArmatureDisplay(skelData.armatureNames[0], skelData.name)
      // console.log('node', node)
      // armature.animation.gotoAndPlay('run', 0.2)
      node.armature.animation.timeScale = timeScale
      if (animation) {
        node.armature.animation.gotoAndPlayByTime(animation, 0, playTimes)
      }
      // console.log('state', state);
      // if (skin) {
      //   node.setSkin(skin)
      // }
      dbComp.node = entity.assign(new NodeComp(node, entity))
      if (dbComp.props.onAnimationStart)
        node.armature.eventDispatcher.addDBEventListener(
          EventObject.START,
          (event: EventObject) => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationStart(event.animationState?.name)
          },
          dbComp,
        )
      if (dbComp.props.onAnimationEnd)
        node.armature.eventDispatcher.addDBEventListener(
          EventObject.COMPLETE,
          (event: EventObject) => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationEnd(event.animationState?.name)
          },
          dbComp,
        )
      if (dbComp.props.onAnimationComplete)
        node.armature.eventDispatcher.addDBEventListener(
          EventObject.LOOP_COMPLETE,
          (event: EventObject) => {
            if (dbComp.node.active && dbComp.enabled)
              dbComp.props.onAnimationComplete(event.animationState?.name, event.animationState?.currentPlayTimes)
          },
          dbComp,
        )
    })
    event_manager.subscribe(EventTypes.ComponentRemoved, DragonBonesComp, ({ component }) => {
      const armature = component.node.instance
      armature.destroy()
      // console.log('remove dragonbones component', dbComp.node.entity.id)
    })
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    // update(entities: EntityManager) {
    // const animations = entities.entities_with_components(DragonBonesComp)
    // animations.forEach((ett) => {
    //   const dbComp = ett.getComponent(DragonBonesComp)
    //   if (dbComp.node && dbComp.node.active) {
    //     // console.log(' dragonbones updateTexture', dbComp.node.entity.id)
    //     dbComp.dragon.updateTexture()
    //   }
    // })
    CocosFactory.advanceTime(dt)
  }
}
