import { EnhancedComponent } from '../core/EnhancedComponent'
import { SpriteRender } from '../render'

export interface IEvent {
  frame: number
  func: string
  params: string[]
  isCalled: boolean
}

export enum WrapMode {
  Default = 0,
  Normal = 1,
  Loop = 2,
  PingPong = 22,
  Reverse = 36,
  LoopReverse = 38,
  PingPongReverse = 54,
}

interface AnimProp {
  frame: number
  value: number
}

interface SpriteFrameProp {
  frame: number
  value: string
}

interface CurveData {
  comps: { spriteFrame: SpriteFrameProp[]; nextFrame: number }
  props: { [key: string]: AnimProp[] }
}

export class AnimationClip {
  public static WrapMode = WrapMode
  public sample = 60
  public speed = 1
  public wrapMode = WrapMode.Normal
  public events: IEvent[] = []
  public duration = 0
  name: string
  curveData: CurveData
}

// cc.AnimationClip = AnimationClip;

export class AnimationComp extends EnhancedComponent {
  defaultClip: AnimationClip
  clips: AnimationClip[]
  playOnLoad: boolean
  private isPaused = true
  private elapsed = 0
  private currentClip: AnimationClip

  constructor(defaultClip: AnimationClip, clips: AnimationClip[], playOnLoad: boolean) {
    super()
    this.defaultClip = defaultClip
    this.clips = clips
    this.playOnLoad = playOnLoad
  }

  start() {
    if (this.playOnLoad) {
      setTimeout(() => {
        this.play()
      }, 0)
    }
    // cc.log(this.clips);
  }

  update(dt: Float) {
    if (this.isPaused || !this.node.active) {
      return
    }
    const { curveData, wrapMode, events, duration, speed } = this.currentClip
    this.elapsed += dt * speed
    const { spriteFrame, nextFrame } = curveData.comps
    const nextFrameTime = spriteFrame[nextFrame].frame
    events.forEach((evt) => {
      const { func, frame, params, isCalled } = evt
      if (!isCalled && this.elapsed >= frame) {
        evt.isCalled = true
        // this.node.emit(func, ...params)
      }
    })
    if (this.elapsed >= nextFrameTime) {
      const imageComp = this.node.getComponent(SpriteRender)
      if (imageComp) {
        imageComp.spriteFrame = spriteFrame[nextFrame].value
      }
      // cc.log(spriteFrame[nextFrame].value, nextFrameTime);
      curveData.comps.nextFrame += 1
      curveData.comps.nextFrame = cc.clampf(curveData.comps.nextFrame, 0, spriteFrame.length - 1)
      if (this.elapsed >= duration) {
        if (wrapMode === WrapMode.Loop) {
          curveData.comps.nextFrame = 0
          this.elapsed = 0
          events.forEach((evt) => {
            evt.isCalled = false
          })
        } else {
          this.isPaused = true
        }
      }
    }
  }

  getAnimationState(name: string) {
    return {
      isPlaying: !this.isPaused,
    }
  }

  public play(name?: string) {
    this.elapsed = 0
    // cc.log('play', name, this.defaultClip.name);
    if (!name) {
      if (!this.defaultClip) {
        return
      }
      name = this.defaultClip.name
    } else if (this.currentClip && name === this.currentClip.name) {
      return
    }
    this.currentClip = this.clips.find((clip) => clip.name === name)
    this.currentClip.curveData.comps.nextFrame = 0
    // cc.log('name', name, this.currentClip);
    this.currentClip.events.forEach((evt) => {
      evt.isCalled = false
    })
    this.isPaused = false
  }

  public pause() {
    this.node.instance.pause()
    this.isPaused = true
  }

  public resume() {
    this.node.instance.resume()
    this.isPaused = false
  }

  public stop(name?: string) {
    this.node.instance.unscheduleAllCallbacks()
    this.isPaused = true
  }
}
