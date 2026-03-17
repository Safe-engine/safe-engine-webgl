import {
  Armature,
  BaseFactory,
  BaseObject,
  BuildArmaturePackage,
  DataParser,
  DisplayData,
  DragonBones,
  Slot,
  SlotData,
} from '@cocos/dragonbones-js'

import { director, Sprite, Texture2D } from 'safex-webgl'
import { CocosArmatureDisplay } from './CocosArmatureDisplay'
import { CocosSlot } from './CocosSlot'
import { CocosTextureAtlasData, CocosTextureData } from './CocosTextureAtlasData'
import { SimpleMeshNode } from './SimpleMeshNode'

/**
 * - The Cocos factory.
 * @version DragonBones 3.0
 * @language en_US
 */
/**
 * - Cocos 工厂。
 * @version DragonBones 3.0
 * @language zh_CN
 */
export class CocosFactory extends BaseFactory {
  private static _dragonBonesInstance: DragonBones = null as any
  private static _factory: CocosFactory = null as any
  private static _clockHandler(passedTime: number): void {
    this._dragonBonesInstance.advanceTime(passedTime)
  }

  /*
   * `passedTime` is elapsed time, specified in seconds.
   */
  public static advanceTime(passedTime: number): void {
    this._dragonBonesInstance.advanceTime(passedTime)
  }

  /**
   * - A global factory instance that can be used directly.
   * @version DragonBones 4.7
   * @language en_US
   */
  /**
   * - 一个可以直接使用的全局工厂实例。
   * @version DragonBones 4.7
   * @language zh_CN
   */
  public static get factory(): CocosFactory {
    if (CocosFactory._factory === null) {
      CocosFactory._factory = new CocosFactory(null)
    }

    return CocosFactory._factory
  }

  /**
   * - 一个获取全局工厂实例(单例)的方法, 和get factory相比, 优点是可以传参数。
   * @version DragonBones 4.7
   * @language zh_CN
   */
  public static newInstance(): CocosFactory {
    if (CocosFactory._factory === null) {
      CocosFactory._factory = new CocosFactory(null)
    }

    return CocosFactory._factory
  }
  /**
   * @inheritDoc
   */
  public constructor(dataParser: DataParser | null = null) {
    super(dataParser)

    if (CocosFactory._dragonBonesInstance === null) {
      const eventManager = new CocosArmatureDisplay()
      CocosFactory._dragonBonesInstance = new DragonBones(eventManager)
    }

    this._dragonBones = CocosFactory._dragonBonesInstance
  }

  protected _buildTextureAtlasData(
    textureAtlasData: CocosTextureAtlasData | null,
    textureAtlas: Texture2D | null,
  ): CocosTextureAtlasData {
    if (textureAtlasData) {
      // console.log(textureAtlasData, 'textureAtlasData', textureAtlas)
      const scale = director.getContentScaleFactor()
      textureAtlasData.scale = scale
      textureAtlasData.renderTexture = textureAtlas
    } else {
      textureAtlasData = BaseObject.borrowObject(CocosTextureAtlasData)
    }

    return textureAtlasData
  }

  protected _buildArmature(dataPackage: BuildArmaturePackage): Armature {
    const armature = BaseObject.borrowObject(Armature)
    const armatureDisplay = new CocosArmatureDisplay()

    armature.init(dataPackage.armature, armatureDisplay, armatureDisplay, this._dragonBones)

    return armature
  }

  protected _buildSlot(_dataPackage: BuildArmaturePackage, slotData: SlotData, armature: DisplayData[]): Slot {
    const slot = BaseObject.borrowObject(CocosSlot)
    slot.init(slotData, armature, new Sprite(), new SimpleMeshNode())

    return slot
  }
  /**
   * - Create a armature from cached DragonBonesData instances and TextureAtlasData instances, then use the {@link #clock} to update it.
   * The difference is that the armature created by {@link #buildArmature} is not WorldClock instance update.
   * @param armatureName - The armature data name.
   * @param dragonBonesName - The cached name of the DragonBonesData instance. (If not set, all DragonBonesData instances are retrieved, and when multiple DragonBonesData instances contain a the same name armature data, it may not be possible to accurately create a specific armature)
   * @param skinName - The skin name, you can set a different ArmatureData name to share it's skin data. (If not set, use the default skin data)
   * @returns The armature display container.
   * @see dragonBones.IArmatureProxy
   * @see dragonBones.BaseFactory#buildArmature
   * @version DragonBones 4.5
   * @example
   * <pre>
   *     let armatureDisplay = factory.buildArmatureDisplay("armatureName", "dragonBonesName");
   * </pre>
   * @language en_US
   */
  /**
   * - 通过缓存的 DragonBonesData 实例和 TextureAtlasData 实例创建一个骨架，并用 {@link #clock} 更新该骨架。
   * 区别在于由 {@link #buildArmature} 创建的骨架没有 WorldClock 实例驱动。
   * @param armatureName - 骨架数据名称。
   * @param dragonBonesName - DragonBonesData 实例的缓存名称。 （如果未设置，将检索所有的 DragonBonesData 实例，当多个 DragonBonesData 实例中包含同名的骨架数据时，可能无法准确的创建出特定的骨架）
   * @param skinName - 皮肤名称，可以设置一个其他骨架数据名称来共享其皮肤数据。 （如果未设置，则使用默认的皮肤数据）
   * @returns 骨架的显示容器。
   * @see dragonBones.IArmatureProxy
   * @see dragonBones.BaseFactory#buildArmature
   * @version DragonBones 4.5
   * @example
   * <pre>
   *     let armatureDisplay = factory.buildArmatureDisplay("armatureName", "dragonBonesName");
   * </pre>
   * @language zh_CN
   */
  public buildArmatureDisplay(
    armatureName: string,
    dragonBonesName = '',
    skinName = '',
    textureAtlasName = '',
  ): CocosArmatureDisplay | null {
    const armature = this.buildArmature(armatureName, dragonBonesName || '', skinName || '', textureAtlasName || '')
    if (armature !== null) {
      this._dragonBones.clock.add(armature)

      return armature.display as CocosArmatureDisplay
    }

    return null
  }
  /**
   * - Create the display object with the specified texture.
   * @param textureName - The texture data name.
   * @param textureAtlasName - The texture atlas data name (Of not set, all texture atlas data will be searched)
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - 创建带有指定贴图的显示对象。
   * @param textureName - 贴图数据名称。
   * @param textureAtlasName - 贴图集数据名称。 （如果未设置，将检索所有的贴图集数据）
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public getTextureDisplay(textureName: string, textureAtlasName: string | null = null): Sprite | null {
    const textureData = this._getTextureData(textureAtlasName !== null ? textureAtlasName : '', textureName) as CocosTextureData
    if (textureData !== null && textureData.spriteFrame !== null) {
      return new Sprite(textureData.spriteFrame)
    }

    return null
  }
  /**
   * - A global sound event manager.
   * Sound events can be listened to uniformly from the manager.
   * @version DragonBones 4.5
   * @language en_US
   */
  /**
   * - 全局声音事件管理器。
   * 声音事件可以从该管理器统一侦听。
   * @version DragonBones 4.5
   * @language zh_CN
   */
  public get soundEventManager(): CocosArmatureDisplay {
    return this._dragonBones.eventManager as CocosArmatureDisplay
  }
}
