import { Vec2 } from '../polyfills'

export function moveTo(t: number, to: Vec2) {
  return cc.moveTo(t, to)
}
export function moveBy(t: number, to: Vec2) {
  return cc.moveBy(t, to)
}

export function scaleTo(t: number, x: number, y?: number) {
  return cc.scaleTo(t, x, y)
}

export function scaleBy(t: number, x: number, y?: number) {
  return cc.scaleBy(t, x, y)
}

export function rotateBy(t: number, x: number, y?: number) {
  return cc.rotateBy(t, x, y)
}

export function rotateTo(t: number, x: number, y?: number) {
  return cc.rotateTo(t, x, y)
}

export function progressTo(t: number, p: number) {
  return cc.progressTo(t, p)
}

export function callFunc(cb: () => void, target?, data?) {
  return cc.callFunc(cb, target, data)
}

export function sequence(...actions: cc.FiniteTimeAction[]) {
  return cc.sequence(...actions)
}

export function repeatForever(action: cc.FiniteTimeAction) {
  return cc.repeatForever(action)
}

export function repeat(action: cc.FiniteTimeAction, times: Integer) {
  return cc.repeat(action, times)
}

export function delayTime(time: Float) {
  return cc.delayTime(time)
}

export function blink(time: Float, blinks: Integer) {
  return cc.blink(time, blinks)
}

export function fadeTo(time: Float, opacity: Integer) {
  return cc.fadeTo(time, opacity)
}

export function fadeIn(time: Float) {
  return cc.fadeIn(time)
}

export function fadeOut(time: Float) {
  return cc.fadeOut(time)
}

export function easeBackOut(action: cc.ActionInterval) {
  return action.easing(cc.easeBackOut())
}
