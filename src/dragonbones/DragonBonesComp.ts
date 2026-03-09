import { BaseComponentProps } from '..'
import { ComponentX, render } from '../core/decorator'
import { CocosArmatureDisplay } from './db-cocos/CocosArmatureDisplay'

export interface DragonBonesData {
  atlas: string
  skeleton: string
  texture: string
}

interface DragonBonesProps {
  data: DragonBonesData
  skin?: string
  animation?: string
  playTimes?: Integer
  timeScale?: Float

  onAnimationStart?: (animationName?: string) => void
  onAnimationEnd?: (animationName?: string) => void
  onAnimationComplete?: (animationName?: string, loopCount?: number) => void
}

export class DragonBonesComp extends ComponentX<DragonBonesProps & BaseComponentProps<DragonBonesComp>, CocosArmatureDisplay> {
  setAnimation(name: string, playTimes = 0) {
    const armature = this.node.instance
    if (armature) {
      if (armature.animation.lastAnimationName === name) return
      armature.animation.gotoAndPlayByTime(name, 0, playTimes)
    }
  }

  getAnimationName() {
    const armature = this.node.instance
    return armature.animation.lastAnimationName
  }

  setSkeletonData(data: string) {
    const skel = this.node.instance
    const atlas = data.replace('.json', '.atlas')
    skel.armature.display.initWithArgs(data, atlas, this.node.scale)
  }

  setFLipX(isFlipX: boolean) {
    const armature = this.node.instance
    armature.armature.flipX = isFlipX
  }

  setTimeScale(timeScale: Float) {
    const armature = this.node.instance
    armature.animation.timeScale = timeScale
  }
}

Object.defineProperty(DragonBonesComp.prototype, 'render', { value: render })
