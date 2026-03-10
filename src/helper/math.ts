export function randomRangeInt(minInclude: Integer, maxExclude: Integer) {
  return Math.round(Math.random() * (maxExclude - minInclude - 1)) + minInclude
}
export function randomRange(minInclude: Float, maxExclude: Float) {
  return Math.random() * (maxExclude - minInclude - 1) + minInclude
}

export const degreesToRadians = degreesToRadians
export const radiansToDegrees = radiansToDegrees

export function getMin(arr: number[]): number | null {
  if (arr.length === 0) return null

  let min = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i]
    }
  }
  return min
}

export function getMax(arr: number[]): number | null {
  if (arr.length === 0) return null

  let max = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i]
    }
  }
  return max
}
