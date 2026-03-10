/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2018 DragonBones team and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { BaseObject, TextureAtlasData, TextureData } from '@cocos/dragonbones-js'

export class CocosTextureAtlasData extends TextureAtlasData {
  public static toString(): string {
    return '[class dragonBones.CocosTextureAtlasData]'
  }

  private _renderTexture: Texture2D | null = null // Initial value.

  protected _onClear(): void {
    super._onClear()

    if (this._renderTexture !== null) {
      // this._renderTexture.dispose();
    }

    this._renderTexture = null
  }
  /**
   * @inheritDoc
   */
  public createTexture(): TextureData {
    return BaseObject.borrowObject(CocosTextureData)
  }
  /**
   * - The CocosJS texture.
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - CocosJS 贴图。
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public get renderTexture(): Texture2D | null {
    return this._renderTexture
  }
  public set renderTexture(value: Texture2D | null) {
    if (this._renderTexture === value) {
      return
    }

    this._renderTexture = value

    if (this._renderTexture !== null) {
      for (const k in this.textures) {
        const textureData = this.textures[k] as CocosTextureData
        // if (textureData.renderTexture !== null) {
        //   textureData.renderTexture.destroy();
        // }
        // console.log('textureData', this._renderTexture, textureData)
        // console.log('this._renderTexture', this._renderTexture)
        const x = textureData.region.x
        const y = textureData.region.y
        const rotated = textureData.rotated
        const width = rotated ? textureData.region.height : textureData.region.width
        const height = rotated ? textureData.region.width : textureData.region.height
        const rect = rect(x, y, width, height)
        const offset = p(0, 0)
        const originSize = size(width, height)

        if (textureData.frame) {
          const px = -textureData.frame.x
          const py = -textureData.frame.y
          originSize.width = textureData.frame.width
          originSize.height = textureData.frame.height
          // offset = sprite center - trimed texture center
          const cx1 = px + rect.width / 2
          const cy1 = originSize.height - py - rect.height / 2
          const cx2 = originSize.width / 2
          const cy2 = originSize.height / 2
          offset.x = cx2 - cx1
          offset.y = cy2 - cy1
        }
        // sprite

        const spriteFrame = new SpriteFrame(this._renderTexture, rect, textureData.rotated, offset, originSize)
        // console.log('sf', sf)
        textureData.spriteFrame = spriteFrame
      }
    } else {
      for (const k in this.textures) {
        const textureData = this.textures[k] as CocosTextureData
        // if (textureData.renderTexture !== null) {
        //   textureData.renderTexture.destroy();
        // }
        textureData.spriteFrame = null
      }
    }
  }
}
/**
 * @internal
 */
export class CocosTextureData extends TextureData {
  public static toString(): string {
    return '[class dragonBones.CocosTextureData]'
  }

  public spriteFrame: SpriteFrame | null = null // Initial value.

  protected _onClear(): void {
    super._onClear()

    // if (this.spriteFrame !== null) {
    //   this.spriteFrame.destroy();
    // }

    this.spriteFrame = null
  }
}
