import { skin } from '../../../../../shared/skin.js'
import { layout, streamId, TailDespawnAnimation, scaleToGrid as tg } from "../../../../../shared/utilities.js"
import { death, game, pos } from "./Shared.js"

/** Each body entity does 4 things:
 * - draw itslef to give the snake a nice body
 * - check if the snake's head hit that body part
 * - make sure the apple doesn't randomly spawn in the body
 * - dispawn itslef to ensure a consistent snake length*/
export class Body extends SpawnableArchetype({
  shouldExportBodySize: Boolean,
  bodySize: Number,
}) {

  updateSequentialOrder = 1

  layout = this.entityMemory(Rect)
  layoutShadow = this.entityMemory(Rect)
  x = this.entityMemory(Number)
  y = this.entityMemory(Number)
  dir = this.entityMemory(Number) //used for the despawn animation
  colour = this.entityMemory(Boolean)
  tickLeft = this.entityMemory(Number)


  initialize() {
    layout.sqaure.translate(tg(pos.x), tg(pos.y) + 0.02)
      .copyTo(this.layout)
    layout.line.translate(tg(pos.x), tg(pos.y) - 0.07)
      .copyTo(this.layoutShadow)
    this.x = pos.x
    this.y = pos.y

    //the body direction is only needed for the despawn animation
    this.dir = -1 //-1 so that its only drawn the next tick

    this.tickLeft = game.size
    this.colour = game.bodyColour
  }

  updateSequential() {

    //we only need to update this body part each tick
    if (game.isTick) {
      if (!game.lose) {

        if (this.dir === -1) this.dir = game.dir
        this.tickLeft--

        if (this.tickLeft === 0) {

          this.despawn = true
          if (this.spawnData.shouldExportBodySize) streams.set(streamId.bodySize, time.now, this.spawnData.bodySize)

        } else {
          //detect if the head hit the body.🤕
          if (this.x == pos.x && this.y == pos.y) death()
        }

      }
      //dispawn the body part
      else if (this.tickLeft === 1) this.despawn = true
    }

  }


  updateParallel() {
    //draw the body part
    if (game.lose) {
      const p = time.now - game.deathTime - ((game.size - this.tickLeft) * 0.15)
      if (p >= 0 && p <= 0.15) {
        const y = Math.max(0, 0.02 * Math.sin(p / 0.1 * Math.PI)) + 0.02
        layout.sqaure.translate(tg(this.x), tg(this.y) + y).copyTo(this.layout)
      }
    } else {
      if (this.tickLeft === 1) TailDespawnAnimation(this.layout, this.dir, { x: this.x, y: this.y }, game.nextTickAnimationProgress)
    }
    if (this.dir != -1) {
      if (this.colour) { skin.sprites.bodyDark.draw(this.layout, 40, 1) } else { skin.sprites.bodyLight.draw(this.layout, 40, 1) }
      skin.sprites.shadow.draw(this.layout.translate(0, -0.02), 39, 1)
    }
  }

}
