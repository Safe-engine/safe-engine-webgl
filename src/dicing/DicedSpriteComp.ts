import { loader, textureCache } from "safex-webgl"
import { ComponentX } from "../core/decorator"
import { NodeComp } from "../core/NodeComp"
import { GameWorld } from "../gworld"
import { registerSystem } from "../helper"
import { DicedSprite } from "./DicedSprite"

function buildMeshFromGrid(json) {
  const { meta } = json;

  const atlasW = meta.rawWidth;
  const atlasH = meta.rawHeight;

  const cellW = meta.cellW;
  const cellH = meta.cellH;

  const cols = Math.floor(atlasW / cellW);

  const result = {};

  for (const anim of json.animations) {
    result[anim.name] = anim.frames.map(grid => {
      const vertices = [];
      const uvs = [];
      const indices = [];

      let vi = 0;

      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          const index = grid[y][x];
          if (index === -1) continue;

          const col = index % cols;
          const row = Math.floor(index / cols);

          const u0 = (col * cellW) / atlasW;
          const v0 = (row * cellH) / atlasH;
          const u1 = ((col + 1) * cellW) / atlasW;
          const v1 = ((row + 1) * cellH) / atlasH;

          const px = x * cellW;
          const py = y * cellH;

          vertices.push(
            px, py,
            px + cellW, py,
            px + cellW, py + cellH,
            px, py + cellH
          );

          uvs.push(
            u0, v0,
            u1, v0,
            u1, v1,
            u0, v1
          );

          indices.push(
            vi, vi + 1, vi + 2,
            vi, vi + 2, vi + 3
          );

          vi += 4;
        }
      }

      return {
        vertices: new Float32Array(vertices),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices)
      };
    });
  }
  json.animations = result;

  return json;
}
interface DicedSpriteProps {
  texture: string
  animation: string
  data?: any
}
export class DicedSpriteComp extends ComponentX<DicedSpriteProps & { $ref?: DicedSpriteComp }, DicedSprite> {

  render() {
    const { data, texture, animation } = this.props
    const tex = textureCache.getTextureForKey(texture)
    const json = loader.getRes(data)
     const meshData = buildMeshFromGrid(json);
    const node = new DicedSprite(meshData, tex)
    node.play(animation)

    const world = GameWorld.Instance
    const entity = world.entities.create()
    this.node = entity.assign(new NodeComp(node, entity))
    const comp = entity.assign(this)
    return comp
  }
}
registerSystem(DicedSpriteComp)