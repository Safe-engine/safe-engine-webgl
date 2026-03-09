import { Color4B, NodeComp } from '.'
export * from './app'
export * from './collider'
export * from './core/decorator'
export * from './core/EnhancedComponent'
export * from './core/NodeComp'
export * from './core/NodePool'
export * from './core/Scene'
export * from './gui'
export * from './gworld'
export * from './helper'
export * from './norender'
export * from './polyfills'
export { type Touch } from './polyfills'
export * from './render'
export * from './richtext'
export type ColorSource = ReturnType<typeof Color4B>

export interface BaseComponentProps<T> {
  $ref?: T
  $push?: T[]
  $refNode?: NodeComp
  $pushNode?: NodeComp[]
  node?: Partial<NodeComp>
  // [$key: `$${string}`]: string
}
