import { BaseComponentProps, ComponentX, registerSystem, render, Vec2 } from '..'
import { SkeletonAnimation } from './spine-cocos/CCSkeletonAnimation'

export interface SpineData {
  atlas: string
  skeleton: string
  texture?: string
}

interface SpineSkeletonProps {
  data: SpineData
  skin?: string
  animation?: string
  timeScale?: number
  loop?: boolean
  onAnimationComplete?: (animationName?: string, loopCount?: number) => void
}
export class SpineSkeleton extends ComponentX<SpineSkeletonProps & BaseComponentProps<SpineSkeleton>, SkeletonAnimation> {
  set scaleX(flip: number) {
    const skel = this.node.instance
    skel._skeleton.scaleX = flip
  }
  getAnimationName() {
    const skel = this.node.instance
    return skel.getState().getCurrent(0).animation.name
  }
  setAnimation(name: string, loop = false) {
    const skel = this.node.instance
    if (skel.setAnimation) {
      skel.setAnimation(0, name, loop)
    }
  }

  setSkeletonData(data: SpineData) {
    const skel = this.node.instance
    skel.initWithArgs(data.skeleton, data.atlas)
    if (this.props.onAnimationComplete) {
      skel.setCompleteListener((track, loopCount) => {
        this.props.onAnimationComplete(track.animation.name, loopCount)
      })
    }
  }
}

Object.defineProperty(SpineSkeleton.prototype, 'render', { value: render })

interface SpineBonesControlComponentProps extends BaseComponentProps<SpineBonesControlComponent> {
  posList: Vec2[]
  bonesName: string[]
}
export class SpineBonesControlComponent extends ComponentX<SpineBonesControlComponentProps, SkeletonAnimation> {
  start() {
    const skel = this.node.getComponent(SpineSkeleton)!.node.instance
    const { bonesName = [], posList = [] } = this.props
    bonesName.forEach((boneName: string, index: number) => {
      const bone = skel._skeleton.findBone(boneName)
      if (bone) {
        const pos = posList[index]
        bone.x = pos.x
        bone.y = pos.y
      }
    })
  }
}

registerSystem(SpineBonesControlComponent)
