import { skin } from "../../../../../shared/skin.js";
import { pos } from "./Shared.js";
import { scaleToGrid, layout } from "../../../../../shared/utilities.js"
import { particle } from "../../../../../shared/particle.js";

/** Flying score effect spadned when eating an apple*/
export class ScoreEffect extends SpawnableArchetype({}) {
  spawnTime = this.entityMemory(Number)
  x = this.entityMemory(Number)
  y = this.entityMemory(Number)
  aniDir = this.entityMemory(Number)

  initialize() {
    this.spawnTime = time.now
    this.x = pos.x
    this.y = pos.y
    // make the animation go to left or right depending on which side it is
    if (this.x < 5) this.aniDir = -1; else this.aniDir = 1
    particle.effects.eat.spawn(Rect.one.mul(0.14).translate(scaleToGrid(this.x), scaleToGrid(this.y)), 1.3, false)
  }

  updateParallel() {
    const a = (time.now - this.spawnTime) / 1.5 //anim progress for position and opacity
    skin.sprites.plusOne.draw(
      layout.sqaure.translate(
        scaleToGrid(this.x + a * this.aniDir),
        scaleToGrid(this.y + a * 0.6)),
      100,
      1 - a)
    if (time.now > 1.5 + this.spawnTime) this.despawn = true
  }
}
