import { director } from "safex-webgl"

export function pauseAll() {
  director.pause()
}

export function resumeAll() {
  director.resume()
}
