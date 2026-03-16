import { TextField } from "safex-webgl/ui"
import { BaseComponentProps, color, GameWorld, GUISystem, NodeComp } from ".."
import { ComponentX } from "../core/decorator"

interface InputCompProps {
  placeHolder?: string
  font?: string
  size?: Integer
  maxLength?: Integer
  isPassword?: boolean
}
export class InputComp extends ComponentX<InputCompProps & BaseComponentProps<InputComp>, TextField> {
  get string() {
    return this.node.instance.getString()
  }

  render() {
    const { placeHolder = '', font = GUISystem.defaultFont, size = 64, maxLength = 20, isPassword = false } = this.props
    const textField = new TextField()
    textField.setPlaceHolder(placeHolder)
    textField.setFontName(font)
    textField.setFontSize(size)
    textField.setTextColor(color(255, 255, 255))
    textField.setMaxLengthEnabled(true)
    textField.setMaxLength(maxLength)
    textField.setPasswordEnabled(isPassword)

    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(textField, entity))
    const comp = entity.assign(this)
    return comp
  }
}