import { BaseObject, BinaryOffset, BoneType, Slot, Transform } from '@cocos/dragonbones-js'
import { color, Node, Rect, Size, Sprite } from 'safex-webgl'
import { CocosArmatureDisplay } from './CocosArmatureDisplay'
import { CocosTextureAtlasData, CocosTextureData } from './CocosTextureAtlasData'
import { SimpleMeshNode } from './SimpleMeshNode'

export class CocosSlot extends Slot {
  _updateGlueMesh(): void {}
  public static toString(): string {
    return '[class dragonBones.CocosSlot]'
  }

  private _ccMeshDirty = false
  private _textureScale: number
  private _renderDisplay: Node
  _geometryData
  _geometryBones

  protected _onClear(): void {
    super._onClear()

    this._textureScale = 1.0
    this._renderDisplay = null as any
    // this._updateTransform = cc[0] === '3' ? this._updateTransformV3 : this._updateTransformV4;
  }

  protected _initDisplay(): void {}

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

    if (this._renderDisplay.getParent() !== container) {
      container.addChild(this._renderDisplay, prevDisplay.getLocalZOrder())
    }

    // container.removeChild(prevDisplay, false);
    // this._renderDisplay.active = true
    // prevDisplay.active = false

    this._textureScale = 1.0
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
        if (this._geometryData) {
          // Mesh.
          const data = this._geometryData.data
          const intArray = data.intArray
          const floatArray = data.floatArray
          const vertexCount = intArray[this._geometryData.offset + BinaryOffset.MeshVertexCount]
          const triangleCount = intArray[this._geometryData.offset + BinaryOffset.MeshTriangleCount]
          let vertexOffset = intArray[this._geometryData.offset + BinaryOffset.MeshFloatOffset]

          if (vertexOffset < 0) {
            vertexOffset += 65536 // Fixed out of bouds bug.
          }

          const uvOffset = vertexOffset + vertexCount * 2
          const scale = this._armature._armatureData.scale

          const meshDisplay = this._renderDisplay as SimpleMeshNode

          const vertices = new Float32Array(vertexCount * 2) as any
          const uvs = new Float32Array(vertexCount * 2) as any
          const indices = new Uint16Array(triangleCount * 3) as any
          for (let i = 0, l = vertexCount * 2; i < l; ++i) {
            vertices[i] = floatArray[vertexOffset + i] * scale
          }

          for (let i = 0; i < triangleCount * 3; ++i) {
            indices[i] = intArray[this._geometryData.offset + BinaryOffset.MeshVertexIndices + i]
          }

          for (let i = 0, l = vertexCount * 2; i < l; i += 2) {
            const u = floatArray[uvOffset + i]
            const v = floatArray[uvOffset + i + 1]

            if (currentTextureData.rotated) {
              uvs[i] = 1 - v
              uvs[i + 1] = u
            } else {
              uvs[i] = u
              uvs[i + 1] = v
            }
          }

          this._textureScale = 1.0
          meshDisplay.setTexture(renderTexture as any)
          meshDisplay.setVertices(vertices)
          // meshDisplay.uvBuffer.update(uvs)
          // meshDisplay.geometry.addIndex(indices)

          const isSkinned = this._geometryData.weight !== null
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

    // if (this._geometryData) {
    //   const meshDisplay = this._renderDisplay as SimpleMeshNode
    //   meshDisplay.setTexture(null)
    //   meshDisplay.setPositionX(0)
    //   meshDisplay.setPositionY(0)
    //   meshDisplay.setVisible(false)
    // } else {
      const normalDisplay = this._renderDisplay as Sprite
      normalDisplay.setTexture(null)
      normalDisplay.setPositionX(0)
      normalDisplay.setPositionY(0)
      normalDisplay.setVisible(false)
    // }
    // this._renderDisplay.setPosition(0.0, 0.0)
  }

  protected _updateMesh(): void {
    const scale = this._armature._armatureData.scale
    // console.log(this._renderDisplay)
    const deformVertices = this._deformVertices
    const bones = this._geometryBones
    const geometryData = this._geometryData
    const weightData = deformVertices.verticesData.weight

    const hasDeform = deformVertices.vertices.length > 0 && deformVertices.verticesData.inheritDeform
    // const meshDisplay = (this._renderDisplay.getComponent(Sprite) as any)._sgNode; // as Scale9Sprite;
    const polygonInfo = this._meshDisplay._polygonInfo
    if (!polygonInfo) {
      return
    }

    const verticesAndUVs = polygonInfo.triangles.verts as { x: number; y: number; u: number; v: number }[]
    const boundsRect = Rect(999999.0, 999999.0, -999999.0, -999999.0)

    if (weightData !== null) {
      const data = geometryData.data
      const intArray = data.intArray
      const floatArray = data.floatArray
      const vertexCount = intArray[geometryData.offset + BinaryOffset.MeshVertexCount]
      let weightFloatOffset = intArray[weightData.offset + BinaryOffset.WeigthFloatOffset]

      if (weightFloatOffset < 0) {
        weightFloatOffset += 65536 // Fixed out of bouds bug.
      }

      for (
        let i = 0, iB = weightData.offset + BinaryOffset.WeigthBoneIndices + bones.length, iV = weightFloatOffset, iF = 0;
        i < vertexCount;
        ++i
      ) {
        const boneCount = intArray[iB++]
        let xG = 0.0,
          yG = 0.0

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

        const vertex = verticesAndUVs[i]
        vertex.x = xG
        vertex.y = yG

        if (boundsRect.x > xG) {
          boundsRect.x = xG
        }

        if (boundsRect.width < xG) {
          boundsRect.width = xG
        }

        if (boundsRect.y > yG) {
          boundsRect.y = yG
        }

        if (boundsRect.height < yG) {
          boundsRect.height = yG
        }
      }
    } else {
      const isSurface = this._parent._boneData.type !== BoneType.Bone
      const data = geometryData.data
      const intArray = data.intArray
      const floatArray = data.floatArray
      const vertexCount = intArray[geometryData.offset + BinaryOffset.MeshVertexCount]
      let vertexOffset = intArray[geometryData.offset + BinaryOffset.MeshFloatOffset]

      if (vertexOffset < 0) {
        vertexOffset += 65536 // Fixed out of bouds bug.
      }

      for (let i = 0, l = vertexCount * 2; i < l; i += 2) {
        const iH = i / 2 // int.
        let x = floatArray[vertexOffset + i] * scale
        let y = floatArray[vertexOffset + i + 1] * scale

        if (hasDeform) {
          x += deformVertices[i]
          y += deformVertices[i + 1]
        }

        const vertex = verticesAndUVs[iH]

        if (isSurface) {
          const matrix = this._parent._getGlobalTransformMatrix(x, y)
          vertex.x = matrix.a * x + matrix.c * y + matrix.tx
          vertex.y = matrix.b * x + matrix.d * y + matrix.ty
          //
          x = vertex.x
          y = vertex.y
        } else {
          vertex.x = x
          y = vertex.y = -y
        }

        if (boundsRect.x > x) {
          boundsRect.x = x
        }

        if (boundsRect.width < x) {
          boundsRect.width = x
        }

        if (boundsRect.y > y) {
          boundsRect.y = y
        }

        if (boundsRect.height < y) {
          boundsRect.height = y
        }
      }
    }

    boundsRect.width -= boundsRect.x
    boundsRect.height -= boundsRect.y

    polygonInfo.rect = boundsRect
    this.meshDisplay.setContentSize(Size(boundsRect.width, boundsRect.height))
    this.meshDisplay.setMeshPolygonInfo(polygonInfo)

    if (weightData !== null) {
      this._identityTransform()
    } else {
      const transform = this.global
      const globalTransformMatrix = this.globalTransformMatrix
     const x = transform.x - (globalTransformMatrix.a * this._pivotX - globalTransformMatrix.c * this._pivotY)
     const y = transform.y - (globalTransformMatrix.b * this._pivotX - globalTransformMatrix.d * this._pivotY)
     this._renderDisplay.setPosition(x,y)
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

    this._renderDisplay.setPosition(0,0)
    this._renderDisplay.setRotationX(0)
    this._renderDisplay.setRotationY(0)
    this._renderDisplay.setScaleX(1)
    this._renderDisplay.setScaleY(1)
  }
}
