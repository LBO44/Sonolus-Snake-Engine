import { particle } from "../../../../../shared/particle.js"
import { scaleToGrid } from "../../../../../shared/utilities.js"

export class DeathParticle extends SpawnableArchetype({
  time: Number,
  x: Number,
  y: Number,
}) {

  aniDir = this.entityMemory(Number)

  spawnTime() {
    return this.spawnData.time
  }

  despawnTime() {
    return this.spawnData.time + 1
  }

  initialize() {
    this.aniDir = this.spawnData.x < 5 ? -1 : 1
    if (!time.skip) particle.effects.die.spawn(Rect.one.mul(0.14).translate(scaleToGrid(this.spawnData.x), scaleToGrid(this.spawnData.y)), 1.3, false)
  }

}
