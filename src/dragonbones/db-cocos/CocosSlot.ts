import { BaseObject, BinaryOffset, BoneType, Slot, Transform } from '@cocos/dragonbones-js'
import { color, MeshNode, Node, Sprite } from 'safex-webgl'
import { CocosArmatureDisplay } from './CocosArmatureDisplay'
import { CocosTextureAtlasData, CocosTextureData } from './CocosTextureAtlasData'

export class CocosSlot extends Slot {
  _updateGlueMesh(): void { }
  public static toString(): string {
    return '[class dragonBones.CocosSlot]'
  }

  private _textureScale: number
  private _renderDisplay: Node
  declare _displayData

  protected _onClear(): void {
    super._onClear()

    this._textureScale = 1.0
    this._renderDisplay = null as any
    // this._updateTransform = cc[0] === '3' ? this._updateTransformV3 : this._updateTransformV4;
  }

  protected _initDisplay(): void { }

  protected _disposeDisplay(value: Node, isRelease: boolean): void {
    if (!isRelease) {
      value.release()
    }
  }

  protected _onUpdateDisplay(): void {
    this._renderDisplay = this._display ? this._display : this._rawDisplay
  }

  protected _addDisplay(): void {
    const container = this._armature.display as CocosArmatureDisplay
    container.addChild(this._renderDisplay, this._zOrder)
  }
  protected _replaceDisplay(value: Node): void {
    const container = this._armature.display as Node
    const prevDisplay = value

    if (this._renderDisplay && this._renderDisplay.getParent() !== container) {
      container.addChild(this._renderDisplay, prevDisplay ? prevDisplay.getLocalZOrder() : this._zOrder)
    }

    if (prevDisplay && prevDisplay !== this._renderDisplay) {
      prevDisplay.setVisible(false)
    }

    if (this._renderDisplay) {
      this._textureScale = 1.0
      this._renderDisplay.setVisible(true)
    }
  }

  protected _removeDisplay(): void {
    this._renderDisplay.getParent().removeChild(this._renderDisplay, false)
  }

  protected _updateZOrder(): void {
    if (this._renderDisplay.getLocalZOrder() === this._zOrder) {
      return
    }

    this._renderDisplay.setLocalZOrder(this._zOrder)
  }
  /**
   * @internal
   */
  public _updateVisible(): void {
    this._renderDisplay.setVisible(this._parent.visible && this._visible)
  }

  protected _updateBlendMode(): void {
    if (this._childArmature) {
      const childSlots = this._childArmature.getSlots()
      for (let i = 0, l = childSlots.length; i < l; i++) {
        const slot = childSlots[i] as CocosSlot
        slot._blendMode = this._blendMode
        slot._updateBlendMode()
      }
    }
  }

  protected _updateColor(): void {
    const c = color(
      Math.round(this._colorTransform.redMultiplier * 255),
      Math.round(this._colorTransform.greenMultiplier * 255),
      Math.round(this._colorTransform.blueMultiplier * 255),
      Math.round(this._colorTransform.alphaMultiplier * 255),
    )
    this._renderDisplay.setColor(c)
  }

  protected _updateFrame(): void {
    let currentTextureData = this._textureData as CocosTextureData | null

    if (this._displayIndex >= 0 && this._display !== null && currentTextureData !== null) {
      let currentTextureAtlasData = currentTextureData.parent as CocosTextureAtlasData

      if (this._armature.replacedTexture !== null) {
        // Update replaced texture atlas.
        if (this._armature._replaceTextureAtlasData === null) {
          currentTextureAtlasData = BaseObject.borrowObject(CocosTextureAtlasData)
          currentTextureAtlasData.copyFrom(currentTextureData.parent)
          currentTextureAtlasData.renderTexture = this._armature.replacedTexture
          this._armature._replaceTextureAtlasData = currentTextureAtlasData
        } else {
          currentTextureAtlasData = this._armature._replaceTextureAtlasData as CocosTextureAtlasData
        }

        currentTextureData = currentTextureAtlasData.getTexture(currentTextureData.name) as CocosTextureData
      }

      const renderTexture = currentTextureData.spriteFrame
      if (renderTexture !== null) {
        if (this._displayData.vertices) {
          // Mesh.
          const data = this._displayData.vertices.data
          const intArray = data.intArray
          const floatArray = data.floatArray
          const vertexCount = intArray[this._displayData.vertices.offset + BinaryOffset.MeshVertexCount]
          const triangleCount = intArray[this._displayData.vertices.offset + BinaryOffset.MeshTriangleCount]
          let vertexOffset = intArray[this._displayData.vertices.offset + BinaryOffset.MeshFloatOffset]

          if (vertexOffset < 0) {
            vertexOffset += 65536 // Fixed out of bounds bug.
          }

          const uvOffset = vertexOffset + vertexCount * 2
          const scale = this._armature._armatureData.scale

          const textureAtlasSize = renderTexture.getTexture().getContentSizeInPixels();
          const textureAtlasWidth = currentTextureAtlasData.width > 0.0 ? currentTextureAtlasData.width : textureAtlasSize.width;
          const textureAtlasHeight = currentTextureAtlasData.height > 0.0 ? currentTextureAtlasData.height : textureAtlasSize.height;
          const region = currentTextureData.region;
          const meshDisplay = this._renderDisplay as MeshNode

          const vertices = new Float32Array(vertexCount * 2)
          const uvs = new Float32Array(vertexCount * 2)
          const indices = new Uint16Array(triangleCount * 3)
          for (let i = 0, l = vertexCount * 2; i < l; i += 2) {
            vertices[i] = floatArray[vertexOffset + i] * scale
            vertices[i + 1] = -floatArray[vertexOffset + i + 1] * scale
          }

          for (let i = 0; i < triangleCount * 3; ++i) {
            indices[i] = intArray[this._displayData.vertices.offset + BinaryOffset.MeshVertexIndices + i]
          }

          for (let i = 0, l = vertexCount * 2; i < l; i += 2) {
            const u = floatArray[uvOffset + i]
            const v = floatArray[uvOffset + i + 1]

            if (currentTextureData.rotated) {
              const backU = u;
              uvs[i] = (region.x + (1.0 - v) * region.width) / textureAtlasWidth;
              uvs[i + 1] = (region.y + backU * region.height) / textureAtlasHeight;
            } else {
              uvs[i] = (region.x + u * region.width) / textureAtlasWidth;
              uvs[i + 1] = (region.y + v * region.height) / textureAtlasHeight;
            }
          }

          this._textureScale = 1.0
          // console.log('meshDisplay.initMesh(', renderTexture._texture.url, vertices, uvs, indices.join(), this._displayData)
          meshDisplay.initMesh(renderTexture._texture.url, vertices, uvs, indices)

          const isSkinned = this._displayData.vertices.weight !== null
          const isSurface = this._parent._boneData.type !== BoneType.Bone
          if (isSkinned || isSurface) {
            this._identityTransform()
          }
        } else {
          // Normal texture.
          this._textureScale = currentTextureData.parent.scale * this._armature._armatureData.scale
          const normalDisplay = this._renderDisplay as Sprite
          // console.log(normalDisplay, renderTexture)
          normalDisplay.setSpriteFrame(renderTexture)
        }

        this._visibleDirty = true

        return
      }
    }

    const normalDisplay = this._renderDisplay as Sprite
    normalDisplay.setTexture(null)
    normalDisplay.setPositionX(0)
    normalDisplay.setPositionY(0)
    normalDisplay.setVisible(false)
  }

  protected _updateMesh(): void {
    const scale = this._armature._armatureData.scale
    const deformVertices = this._deformVertices.vertices
    const bones = this._deformVertices.bones
    const geometryData = this._displayData.vertices

    if (!geometryData) {
      return
    }

    const weightData = this._deformVertices.verticesData.weight
    const hasDeform = deformVertices.length > 0 && this._deformVertices.verticesData.inheritDeform

    const meshDisplay = this._renderDisplay as MeshNode

    const data = geometryData.data
    const intArray = data.intArray
    const floatArray = data.floatArray
    const vertexCount = intArray[geometryData.offset + BinaryOffset.MeshVertexCount]

    // Build updated vertex positions
    const newVertices = new Float32Array(vertexCount * 2)

    if (weightData !== null) {
      // Skinned mesh: compute weighted bone-space positions
      let weightFloatOffset = intArray[weightData.offset + BinaryOffset.WeigthFloatOffset]
      if (weightFloatOffset < 0) weightFloatOffset += 65536

      let iB = weightData.offset + BinaryOffset.WeigthBoneIndices + bones.length
      let iV = weightFloatOffset
      let iF = 0

      for (let i = 0; i < vertexCount; ++i) {
        const boneCount = intArray[iB++]
        let xG = 0.0, yG = 0.0

        for (let j = 0; j < boneCount; ++j) {
          const boneIndex = intArray[iB++]
          const bone = bones[boneIndex]
          if (bone !== null) {
            const matrix = bone.globalTransformMatrix
            const weight = floatArray[iV++]
            let xL = floatArray[iV++] * scale
            let yL = floatArray[iV++] * scale
            if (hasDeform) {
              xL += deformVertices[iF++]
              yL += deformVertices[iF++]
            }
            xG += (matrix.a * xL + matrix.c * yL + matrix.tx) * weight
            yG += (matrix.b * xL + matrix.d * yL + matrix.ty) * weight
          }
        }
        newVertices[i * 2] = xG
        newVertices[i * 2 + 1] = yG
      }

      meshDisplay.updateVertices(newVertices)
      this._identityTransform()
    } else {
      // Non-skinned: may be surface or plain bone
      const isSurface = this._parent._boneData.type !== BoneType.Bone
      let vertexOffset = intArray[geometryData.offset + BinaryOffset.MeshFloatOffset]
      if (vertexOffset < 0) vertexOffset += 65536

      for (let i = 0, l = vertexCount * 2; i < l; i += 2) {
        let x = floatArray[vertexOffset + i] * scale
        let y = floatArray[vertexOffset + i + 1] * scale
        if (hasDeform) {
          x += deformVertices[i]
          y += deformVertices[i + 1]
        }
        if (isSurface) {
          const matrix = this._parent._getGlobalTransformMatrix(x, y)
          x = matrix.a * x + matrix.c * y + matrix.tx
          y = matrix.b * x + matrix.d * y + matrix.ty
        } else {
          y = -y
        }
        newVertices[i] = x
        newVertices[i + 1] = y
      }

      meshDisplay.updateVertices(newVertices)

      const transform = this.global
      const globalTransformMatrix = this.globalTransformMatrix
      const x = transform.x - (globalTransformMatrix.a * this._pivotX - globalTransformMatrix.c * this._pivotY)
      const y = transform.y - (globalTransformMatrix.b * this._pivotX - globalTransformMatrix.d * this._pivotY)
      this._renderDisplay.setPosition(x, y)
      this._renderDisplay.setRotationX(-(transform.rotation + transform.skew) * Transform.RAD_DEG)
      this._renderDisplay.setRotationY(-transform.rotation * Transform.RAD_DEG)
      this._renderDisplay.setScaleX(transform.scaleX * this._textureScale)
      this._renderDisplay.setScaleY(-transform.scaleY * this._textureScale)
    }
  }

  protected _updateTransform(): void {
    this.updateGlobalTransform()

    const transform = this.global
    // const globalTransformMatrix = this.globalTransformMatrix;

    // if (this._renderDisplay === this._rawDisplay || this._renderDisplay === this._meshDisplay) {
    //   this._renderDisplay.x = transform.x - (globalTransformMatrix.a * this._pivotX - globalTransformMatrix.c * this._pivotY);
    //   this._renderDisplay.y = transform.y - (globalTransformMatrix.b * this._pivotX - globalTransformMatrix.d * this._pivotY);
    // }
    // else {
    this._renderDisplay.setPosition(transform.x, transform.y)
    // }

    this._renderDisplay.setRotationX(-(transform.rotation + transform.skew) * Transform.RAD_DEG)
    this._renderDisplay.setRotationY(-transform.rotation * Transform.RAD_DEG)
    this._renderDisplay.setScaleX(transform.scaleX * this._textureScale)
    this._renderDisplay.setScaleY(-transform.scaleY * this._textureScale)
  }

  protected _updateTransformV3(): void {
    this.updateGlobalTransform() // Update transform.

    const transform = this.global

    if (this._renderDisplay === this._rawDisplay || this._renderDisplay === this._meshDisplay) {
      const x = transform.x - (this.globalTransformMatrix.a * this._pivotX + this.globalTransformMatrix.c * this._pivotY)
      const y = transform.y - (this.globalTransformMatrix.b * this._pivotX + this.globalTransformMatrix.d * this._pivotY)
      // this._renderDisplay.transform = new AffineTransform(
      //   x, y,
      //   transform.scaleX * this._textureScale, transform.scaleY * this._textureScale,
      //   transform.rotation,
      //   transform.skew, 0.0,
      // );
      this._renderDisplay.setPosition(x, y)
    } else {
      this._renderDisplay.setPosition(transform.x, transform.y)
      this._renderDisplay.setRotation(transform.rotation)
      this._renderDisplay.setSkewX(transform.skew)
      this._renderDisplay.setScale(transform.scaleX, transform.scaleY)
    }
  }

  protected _identityTransform(): void {
    // const helpMatrix = TransformObject._helpMatrix;
    // helpMatrix.a = 1.0;
    // helpMatrix.b = 0.0;
    // helpMatrix.c = -0.0;
    // helpMatrix.d = -1.0;
    // helpMatrix.tx = 0.0;
    // helpMatrix.ty = 0.0;
    // (this._renderDisplay as any)._renderCmd.setNodeToParentTransform(helpMatrix);

    this._renderDisplay.setPosition(0, 0)
    this._renderDisplay.setRotationX(0)
    this._renderDisplay.setRotationY(0)
    this._renderDisplay.setScaleX(1)
    this._renderDisplay.setScaleY(1)
  }
}
