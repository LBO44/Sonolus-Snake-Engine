import { options } from "../../configuration/options.js"
import { skin } from "../skin.js"
import { archetypes } from "./index.js"
import { pos, game, scaleToGrid as tg, layout } from "./Shared.js"

export class Head extends Archetype {

  tick = this.entityMemory(Number)
  dataIndex = this.entityMemory(Number)
  nextTick = this.entityMemory(Number)
  dir = this.entityMemory(Number) //1 up ;3 down; 2 left; 4 right

  spawnTime() { return -999999 }

  despawnTime() { return 999999 }
  dpadDown = this.entityMemory(Rect)
  dpadUp = this.entityMemory(Rect)
  dpadRight = this.entityMemory(Quad)
  dpadLeft = this.entityMemory(Quad)

  borderAlert = this.entityMemory(Boolean)
  blink = this.entityMemory(Number)
  oldPos = this.entityMemory({
    x: Number,
    y: Number
  })

  initialize() {
    if (options.dpad) this.dpadInitialize()
    this.oldPos.x = pos.x
    this.oldPos.y = pos.y
    archetypes.Body.spawn({})
  }

  drawDpad() {
    skin.sprites.button.draw(this.dpadRight, 100, (this.dir === 4) ? 0.4 : 0.8)
    skin.sprites.button.draw(this.dpadLeft, 100, (this.dir === 2) ? 0.4 : 0.8)
    skin.sprites.button.draw(this.dpadDown, 100, (this.dir === 3) ? 0.4 : 0.8)
    skin.sprites.button.draw(this.dpadUp, 100, (this.dir === 1) ? 0.4 : 0.8)
  }
  dpadInitialize() {
    const s = (options.dpadSize+5)*0.1
    const o= (options.dpadSize+15)*0.05
   layout.dpadUp
      .scale(s, s)
      .translate(screen.l + 0.45*o, screen.b + 0.45*o)
      .copyTo(this.dpadUp)
    layout.dpadDown
      .scale(s, s)
      .translate(screen.l + 0.45*o, screen.b + 0.45*o)
      .copyTo(this.dpadDown)
    layout.dpadLeft
      .scale(s, s)
      .translate(screen.l + 0.45*o, screen.b + 0.45*o)
      .copyTo(this.dpadLeft)
    layout.dpadRight
      .scale(s, s)
      .translate(screen.l + 0.45*o, screen.b + 0.45*o)
      .copyTo(this.dpadRight)
  }
  updateSequential() {

    game.isTick = false
    this.dir = game.nextDir
    game.dir = this.dir
    if (this.nextTick < time.now && !game.lose) {
      this.nextTick = time.now + 0.4
      this.tick++
      game.isTick = true
      // if (this.tick-1 >= game.nextTick) {
      // }
      if (game.dir == 5) game.lose = true
      this.oldPos.x = pos.x
      this.oldPos.y = pos.y
      //move haed
      switch (game.dir) {
        case 4: pos.x++; break
        case 2: pos.x--; break
        case 1: pos.y++; break
        case 3: pos.y--; break
      }


      game.bodyColour = !game.bodyColour
      archetypes.Body.spawn({})

    }

    //lerp animatipn for head and body
    game.nextTickAnimationProgress = (time.now - this.nextTick + 0.4) * 2.5
    //draw head normm1l
    if (game.lose) skin.sprites.headDead.draw(layout.sqaure.translate(tg(pos.x), tg(pos.y)), 50, 1); else {

      skin.sprites.head.draw(
        layout.sqaure.translate(
          tg(Math.lerp(this.oldPos.x, pos.x, game.nextTickAnimationProgress)),
          tg(Math.lerp(this.oldPos.y, pos.y, game.nextTickAnimationProgress)) + 0.02,
        ), 50, 1)

      //eyelid  
      const a = Math.max(0, Math.min(0.04, (((this.blink - time.now) * -1) * 0.05)))
      skin.sprites.eyelid.draw(layout.line.translate(
        tg(Math.lerp(this.oldPos.x, pos.x, game.nextTickAnimationProgress)),
        tg(Math.lerp(this.oldPos.y, pos.y, game.nextTickAnimationProgress)) + 0.09 - a),
        51, 1)
    }

    skin.sprites.shadow.draw(layout.line.translate(tg(Math.lerp(this.oldPos.x, pos.x, game.nextTickAnimationProgress)), tg(Math.lerp(this.oldPos.y, pos.y, game.nextTickAnimationProgress)) - 0.07), 39, 1)

    if (this.borderAlert && (Math.floor(time.now * 5) % 2 === 0)) skin.sprites.borderDanger.draw(layout.gridBorder, 1, 0.5)

    if (options.dpad) this.drawDpad()
    //draw gride
    skin.sprites.grid.draw(layout.grid, 2, 1)
    skin.sprites.border.draw(layout.gridBorder, 0, 1)

  }
}
