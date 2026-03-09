import { GameWorld } from '..'
import { SpineSystem } from './SpineSystem'

export * from './SpineSkeleton'

export function setupSpine() {
  GameWorld.Instance.systems.addThenConfigure(SpineSystem)
}

cc.loader.register(['skel'], {
  TYPE: { skel: 'binary' },
  load: function (realUrl, url, res, callback) {
    cc.loader.loadBinary(url, function (err, data) {
      // console.log('loadBinary Skeleton', realUrl, url, res, data, callback)
      if (err) {
        callback(err)
        return
      }
      callback(null, data)
    })
  },
})
