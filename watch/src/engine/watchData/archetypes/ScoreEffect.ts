import { skin } from "../../../../../shared/skin.js";
import { scaleToGrid, layout } from "../../../../../shared/utilities.js"


export class ScoreEffect extends SpawnableArchetype({
  time: Number,
  x: Number,
  y: Number,
}) {

  aniDir = this.entityMemory(Number)

  spawnTime() {
    return this.spawnData.time
  }

  despawnTime() {
    return this.spawnData.time + 1.5
  }

  initialize() {
    this.aniDir = this.spawnData.x < 5 ? -1 : 1
  }

  updateParallel() {
    const a = (time.now - this.spawnData.time) / 1.5
    skin.sprites.plusOne.draw(
      layout.sqaure.translate(
        scaleToGrid(this.spawnData.x + a * this.aniDir),
        scaleToGrid(this.spawnData.y + a * 0.6)),
      100, 1 - a)
  }
}
