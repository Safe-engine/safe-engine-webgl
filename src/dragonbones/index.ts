import { loader } from 'safex-webgl'
import { GameWorld } from '../gworld'
import { DragonBonesSystem } from './DragonBonesSystem'

export * from './DragonBonesComp'

export function setupDragonBones() {
  GameWorld.Instance.addSystemAndUpdate(DragonBonesSystem)
}

loader.register(['dbbin'], {
  TYPE: { skel: 'binary' },
  load: function (realUrl, url, res, callback) {
    fetch(url).then(async response => {
      const data = await response.arrayBuffer()
      callback(null, data)
    }).catch(err => {
      callback(err)
    })
  },
})
