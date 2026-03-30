import { textureCache } from 'safex-webgl';
import { decodeGzipBase64 } from 'safex-webgl/helper';
import { PNGReader } from 'safex-webgl/particle';

export function createImageCacheFromBase64(base64Asset, textureName) {
    const buffer = decodeGzipBase64(base64Asset);
    const canvasObj = document.createElement('canvas');
    const myPngObj = new PNGReader(buffer);
    myPngObj.render(canvasObj);
    textureCache.cacheImage(textureName, canvasObj);
}