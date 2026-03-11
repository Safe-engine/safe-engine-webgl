import { path } from 'safex-webgl/helper'
import { RichElementCustomNode, RichElementText, RichText, Text } from 'safex-webgl/ui'
import { BaseComponentProps, color, Color, GUISystem, hexToColor } from '..'
import { ComponentX, render } from '../core/decorator'
import { HtmlTextParser } from './html-text-parser'

const _htmlTextParser = new HtmlTextParser()

interface RichTextCompProps {
  font?: string
  string?: string
  size?: number
  isAdaptWithSize?: boolean
}

export class RichTextComp extends ComponentX<RichTextCompProps & BaseComponentProps<RichTextComp>, RichText> {
  get string() {
    return this.props.string
  }

  set string(val: string) {
    this.props.string = val
    if (this.node.instance instanceof RichText) {
      const newTextArray = _htmlTextParser.parse(val)
      // console.log(newTextArray)
      this.node.instance._richElements = []
      this.node.instance._formatTextDirty = true
      this.node.instance.formatText()
      const fontSize = this.props.size || 64
      for (let index = 0; index < newTextArray.length; index++) {
        const { style = {}, text } = newTextArray[index]
        const fontName = path.basename(this.props.font || GUISystem.defaultFont, '.ttf')
        if (style.outline) {
          // console.log('richText', richText, (ccui as any).RichElementCustomNode)
          const label = new Text(text, fontName, fontSize)
          label.enableOutline(hexToColor(style.outline.color), style.outline.width || 3)
          const customElem = RichElementCustomNode.create(1, color(255, 0, 0), 255, label)
          this.node.instance.pushBackElement(customElem)
        } else {
          const color = style.color ? hexToColor(style.color) : Color.WHITE
          const richText = RichElementText.create(index, color, 255, text, fontName, fontSize)
          this.node.instance.pushBackElement(richText)
        }
      }
    }
  }
}
Object.defineProperty(RichTextComp.prototype, 'render', { value: render })
