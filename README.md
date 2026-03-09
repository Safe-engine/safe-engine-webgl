# Safex = JSX Game Engine

## Introduction

Safex is an game engine written in TypeScript, combining the power of JSX syntax with the renowned cocos2x html5 rendering library. This project aims to help mobile game developers build games quickly, easily, and intuitively.

## Key Features

- **JSX Syntax:** Write UI and game logic in a React-like style for better code organization and readability.
- **Powered by Cocos2x html5:** Utilize for high-performance 2D rendering.
- **Component-based Architecture:** Easily manage game elements such as scenes, sprites, events, actions and animations.
- **Asset Loading Support:** Quickly load images, sounds, and sprite sheets.
- All components must be extends from `ComponentX` or call `registerSystem(${className})`
- `node` property represent node, and can pass properties to assign
- Example `<SpriteRender node={{ xy: [5, 9] }} />`
- `$ref` bind component with current class property as string
- `$push` push component to list
- `$refNode` and `$pushNode` for `NodeComp` component from any component.
- `Array(2).map(_, i)` iteration repeat component 2 times
- `Loading.listItems.map(item, i = 1)` iteration in class static readonly property

## Benefits

- **Rapid Development:** JSX makes writing code clean and intuitive.
- **Extensibility:** Easily add new features and functionalities.
- **Web Developer Friendly:** If you're familiar with React, you'll quickly get up to speed with Safex.

## Installation

```sh
npm install @safe-engine/webgl
```

## Basic Example

```tsx GameScene.tsx
import { SceneComponent, LabelComp, ButtonComp, SpriteRender, instantiate, Touch } from '@safe-engine/webgl'
import ColliderSprite from './ColliderSprite'
import { sf_sprite } from '../assets'

export class GameScene extends SceneComponent {
  sprite: SpriteRender
  label: LabelComp

  onPress(target: ButtonComp) {
    this.sprite.spriteFrame = 'other.sprite.png'
    this.label.string = target.node.name
  }

  onTouchMove(event: Touch) {
    const {x,y} = event.getLocation()
    const sprite = instantiate(ColliderSprite)
    sprite.node.posX = x
    sprite.node.posY = y
    this.node.addChild(sprite)
  }

  render() {
    return (
      <SceneComponent>
        <TouchEventRegister
          onTouchMove={this.onTouchMove}
        />
        <LabelComp $ref={this.label} node={{ xy: [106, 240] }} string="Hello safex" font={defaultFont} />
        <ButtonComp $ref={this.sprite} node={{ xy: [500, 600], name: 'sf_sprite' }} spriteFrame={sf_sprite} onPress={this.onPress} >
        </ButtonComp>
      </SceneComponent>
    )
  }
}
```

## Collider Events

```tsx
import { ComponentX, SpriteRender } from '@safe-engine/webgl'
import { BoxCollider } from '@safe-engine/webgl/dist/collider'
import { sf_crash } from '../assets'

export class ColliderSprite extends ComponentX {
  onCollisionEnter(other: Collider) {
    console.log(other.props.tag)
  }

  render() {
    return (
      <SpriteRender node={{ xy: [640, 360] }} spriteFrame={sf_crash}>
        <BoxCollider height={100} width={100} onCollisionEnter={this.onCollisionEnter} tag={3} />
      </SpriteRender>
    )
  }
}
```

## Physics Events

```tsx
import { ComponentX, SpriteRender } from '@safe-engine/webgl'
import { DynamicBody, PhysicsBoxCollider, RigidBody } from '@safe-engine/webgl/dist/box2d-wasm'
import { sf_crash } from '../assets'

export class PhysicsCollider extends ComponentX {
  onBeginContact(other: RigidBody) {
    console.log('onBeginContact', other)
  }

  render() {
    return (
      <SpriteRender node={{ xy: [640, 360] }} spriteFrame={sf_crash}>
        <RigidBody type={DynamicBody} onBeginContact={this.onBeginContact} tag={2} isSensor ></RigidBody>
        <PhysicsBoxCollider height={100} width={100}></PhysicsBoxCollider>
      </SpriteRender>
    )
  }
}
```

## Contributing

We welcome all contributions! If you have ideas or want to improve the engine, feel free to create an issue or submit a pull request on GitHub.

## Contact
- [Discord](https://discord.com/channels/1344214207268388979/1344214208044208140)

Let's build a powerful and convenient game engine together! 🚀
