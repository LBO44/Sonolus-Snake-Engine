import { particle } from "../../../../../shared/particle.js";
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
    if (!time.skip) particle.effects.eat.spawn(Rect.one.mul(0.14).translate(scaleToGrid(this.spawnData.x), scaleToGrid(this.spawnData.y)), 1.3, false)
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
