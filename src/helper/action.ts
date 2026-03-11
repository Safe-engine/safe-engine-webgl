import { Vec2 } from '../../../safex-webgl/src/polyfills'

export function moveTo(t: number, to: Vec2) {
  return moveTo(t, to)
}
export function moveBy(t: number, to: Vec2) {
  return moveBy(t, to)
}

export function scaleTo(t: number, x: number, y?: number) {
  return scaleTo(t, x, y)
}

export function scaleBy(t: number, x: number, y?: number) {
  return scaleBy(t, x, y)
}

export function rotateBy(t: number, x: number, y?: number) {
  return rotateBy(t, x, y)
}

export function rotateTo(t: number, x: number, y?: number) {
  return rotateTo(t, x, y)
}

export function progressTo(t: number, p: number) {
  return progressTo(t, p)
}

export function callFunc(cb: () => void, target?, data?) {
  return callFunc(cb, target, data)
}

export function sequence(...actions: FiniteTimeAction[]) {
  return sequence(...actions)
}

export function repeatForever(action: FiniteTimeAction) {
  return repeatForever(action)
}

export function repeat(action: FiniteTimeAction, times: Integer) {
  return repeat(action, times)
}

export function delayTime(time: Float) {
  return delayTime(time)
}

export function blink(time: Float, blinks: Integer) {
  return blink(time, blinks)
}

export function fadeTo(time: Float, opacity: Integer) {
  return fadeTo(time, opacity)
}

export function fadeIn(time: Float) {
  return fadeIn(time)
}

export function fadeOut(time: Float) {
  return fadeOut(time)
}

export function easeBackOut(action: ActionInterval) {
  return action.easing(easeBackOut())
}
