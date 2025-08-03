import { effect } from "../../../../../shared/effect.js";
import { skin } from '../../../../../shared/skin.js';
import { dpadInitialize, drawDpad, drawScore, floatingEffect, HeadAppearAnimation, layout, streamId, scaleToGrid as tg } from "../../../../../shared/utilities.js";
import { options } from "../../configuration.js";
import { archetypes } from "./index.js";
import { apple, death, game, pos } from "./Shared.js";

/**The snake head entity execute the majority of the game's logic*/
export class Head extends Archetype {


  updateSequentialOrder = 0
  spawnOrderOrder = 1


  //entity memory
  dir = this.entityMemory(Number) //1 up ;3 down; 2 left; 4 right
  previousDir = this.entityMemory(Number)
  nextTickTime = this.entityMemory(Number)
  borderAlert = this.entityMemory(Boolean)
  hasWrapped = this.entityMemory(Boolean)
  blink = this.entityMemory(Number)
  oldPos = this.entityMemory({ x: Number, y: Number })
  newApple = this.entityMemory({ x: Number, y: Number })

  scoreUpdateTime = this.entityMemory(Number)
  bgMuisc = this.entityMemory(LoopedEffectClipInstanceId)

  layoutAppear = this.entityMemory(Rect) //used for the tp animatipn with the no walls option

  dpadLayout = this.entityMemory({
    up: Rect,
    down: Rect,
    left: Quad,
    right: Quad
  })

  scoreLayouts = this.entityMemory({
    digit1: Rect,
    digit2: Rect,
    digit3: Rect,
    title: Rect
  })


  preprocess() {
    ui.menu.set({
      anchor: screen.rect.shrink(0.05, 0.05).rt,
      pivot: { x: 1, y: 1 },
      size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
      rotation: 0,
      alpha: ui.configuration.menu.alpha,
      horizontalAlign: HorizontalAlign.Center,
      background: true,
    })

    game.size = 3
    apple.shouldSpawn = true
    pos.x = 1
    pos.y = 3
    game.tickDuration = 0.4
  }


  initialize() {
    if (options.dpad) dpadInitialize(this.dpadLayout)

    this.oldPos.x = pos.x
    this.oldPos.y = pos.y

    this.dir = 4
    streams.set(streamId.dpadDir, time.now, this.dir)

    archetypes.Body.spawn({ shouldExportBodySize: true, bodySize: game.size })
    streams.set(streamId.score, time.now, game.size)

    if (options.bgm) this.bgMuisc = effect.clips.bgm.loop()
  }


  touch() {
    for (const touch of touches) {
      if (options.dpad) this.touchDpad(touch); else this.touchSwipe(touch)
    }
  }

  touchSwipe(touch: Touch) {
    if (touch.vr > 1.5) {
      if (Math.abs(touch.sx - touch.x) > Math.abs(touch.sy - touch.y)) {
        if (touch.sx - touch.x > 0) {
          if (game.dir != 4) this.dir = 2;
        } else {
          if (game.dir != 2) this.dir = 4;
        }
      } else {
        if (touch.sy - touch.y > 0) {
          if (game.dir != 1) this.dir = 3;
        } else {
          if (game.dir != 3) this.dir = 1;
        }
      }
      streams.set(streamId.dpadDir, time.now, this.dir) //export in case player overrides config
    }
  }

  touchDpad(touch: Touch) {
    const s = (options.dpadSize + 15) * 0.05
    //check if touching the dpad
    if (touch.x < screen.l + 0.85 * s && touch.y < screen.b + 0.85 * s) {
      const deltaX = touch.x - (screen.l + 0.425 * s)
      const deltaY = touch.y - (screen.b + 0.425 * s)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal direction
        if (deltaX > 0) {
          if (game.dir != 2) this.dir = 4; // Right
        } else {
          if (game.dir != 4) this.dir = 2; // Left
        }
      } else {
        // Vertical direction
        if (deltaY > 0) {
          if (game.dir != 3) this.dir = 1; // Up
        } else {
          if (game.dir != 1) this.dir = 3; // Down
        }
      }
      streams.set(streamId.dpadDir, time.now, this.dir)
    }
  }


  updateSequential() {

    //tick logic
    game.isTick = false
    if (this.nextTickTime < time.now && !game.lose) {
      this.nextTickTime = time.now + game.tickDuration
      this.onTick()
    }

    //make sure apple didnt spawn in body 🍏
    if (!apple.shouldSpawn && apple.shouldCheckSpawn) {
      apple.shouldCheckSpawn = false
      streams.set(streamId.apple, time.now, apple.x * 10 + apple.y)
    }

    //spawn apple 
    if (apple.shouldSpawn) {
      apple.shouldSpawn = false
      apple.shouldCheckSpawn = true
      this.newApple.x = Math.randomInt(0, 9)
      this.newApple.y = Math.randomInt(0, 9)
      if (this.newApple.x === apple.x && this.newApple.y === apple.y) {
        //move the apple if it spawned inside the head
        apple.x = (this.newApple.x + Math.randomInt(2, 4)) % 10
        apple.y = (this.newApple.y + Math.randomInt(2, 4)) % 10
      } else {
        apple.x = this.newApple.x
        apple.y = this.newApple.y
      }
    }

    // not ideal as we should only do those once
    if (game.lose) {
      effect.clips.stopLoop(this.bgMuisc)
      if (time.now >= game.deathTime + game.size * 0.15 - 1) game.loseScore = true
    }

    this.drawGame()

  }

  /**A tick represents when the snake moves by one cell
  *We only need to execute the main game logic such as collision once every tick*/
  onTick() {
    this.hasWrapped = false

    game.dir = this.dir
    game.isTick = true
    game.tick++

    if (options.timeLimit != 0 && time.now > options.timeLimit) death()

    //when the direction changes
    if (game.dir != this.previousDir) {
      effect.clips.swipe.play(0.02)
      this.previousDir = game.dir
    }

    streams.set(streamId.headX, time.now, pos.x)
    streams.set(streamId.headY, time.now, pos.y)

    //move haed ➡️
    this.oldPos.x = pos.x
    this.oldPos.y = pos.y
    switch (game.dir) {
      case 4: pos.x++; break
      case 2: pos.x--; break
      case 1: pos.y++; break
      case 3: pos.y--; break
    }


    //hit wall 🧱
    if (Math.max(pos.x, pos.y) > 9 || Math.min(pos.x, pos.y) < 0) {
      if (options.noWall) {
        //wrap to the other side
        pos.x = ((pos.x % 10) + 10) % 10
        pos.y = ((pos.y % 10) + 10) % 10
        this.hasWrapped = true
        effect.clips.wrap.play(0.03)
      } else death()
    }


    //eat apple 🍏
    let appleEtaten = false
    if (apple.x == pos.x && apple.y == pos.y) {
      game.size++
      appleEtaten = true
      this.scoreUpdateTime = time.now + 0.5
      effect.clips.eat.play(0.02)
      archetypes.ScoreEffect.spawn({})
      apple.shouldSpawn = true
      streams.set(streamId.score, time.now, game.size)

      if (game.size % 5 == 0) game.tickDuration = Math.max(0.1, game.tickDuration - 0.025)
    }

    //spawn new body part 🐍
    game.bodyColour = !game.bodyColour
    archetypes.Body.spawn({
      shouldExportBodySize: appleEtaten,
      bodySize: game.size,
    })


    // blinking border animation 
    if (!options.noWall) this.borderAlert = (Math.max(pos.x, pos.y) > 8 || Math.min(pos.x, pos.y) < 1)

    //randomly blink 👁️
    if (Math.random() >= 0.08) this.blink = time.now + 0.5

  }


  /** Draw the game (grid, ui, snake head...)
   * but also handle drawing related logic
   * drawing the snake bodies is handled by the `Body` entities*/
  drawGame() {

    //draw the dead snake's head 💀
    if (game.lose) {

      //shake camera (grid)
      const shake = Math.pow(Math.max(game.deathTime + 1 - time.now, 0) * 0.1, 2)
      skin.sprites.grid.draw(layout.grid.translate(Math.randomFloat(-shake, shake), Math.randomFloat(-shake, shake)), 2, 1)

      //draw head dead 💀
      skin.sprites.headDead.draw(layout.sqaure
        .translate(tg(this.oldPos.x), tg(this.oldPos.y) + 0.02), 50, 1)
      skin.sprites.shadow.draw(layout.line
        .translate(tg(this.oldPos.x), tg(this.oldPos.y) - 0.07), 39, 1)
    }

    //draw the snake's head alive ♥️
    else {

      //progress value for the lerp animation for head and body
      game.nextTickAnimationProgress = (time.now - this.nextTickTime + game.tickDuration) / game.tickDuration

      //draw head appearing from other side if the snake passed through a wall
      if (this.hasWrapped) {
        HeadAppearAnimation(this.layoutAppear, pos, game.dir, game.nextTickAnimationProgress)
        skin.sprites.head.draw(this.layoutAppear, 50, 1)
        skin.sprites.shadow.draw(this.layoutAppear.translate(0, -0.02), 39, 1)
      }

      //draw the head normally
      else {
        skin.sprites.head.draw(
          layout.sqaure.translate(
            tg(Math.lerp(this.oldPos.x, pos.x, game.nextTickAnimationProgress)),
            tg(Math.lerp(this.oldPos.y, pos.y, game.nextTickAnimationProgress)) + 0.02,
          ), 50, 1)


        //eyelid animation 
        const a = Math.max(0, Math.min(0.04, (((this.blink - time.now) * -1) * 0.05)))
        skin.sprites.eyelid.draw(layout.line.translate(
          tg(Math.lerp(this.oldPos.x, pos.x, game.nextTickAnimationProgress)),
          tg(Math.lerp(this.oldPos.y, pos.y, game.nextTickAnimationProgress)) + 0.09 - a),
          51, 1)

        //shadow below the head
        skin.sprites.shadow.draw(layout.line.translate(tg(Math.lerp(this.oldPos.x, pos.x, game.nextTickAnimationProgress)), tg(Math.lerp(this.oldPos.y, pos.y, game.nextTickAnimationProgress)) - 0.07), 39, 1)
      }

      //drawing the blinking border
      if (this.borderAlert && (Math.floor(time.now * 5) % 2 === 0)) skin.sprites.borderDanger.draw(layout.gridBorder, 4, 0.5)

      //draw time limit progress bar
      if (options.timeLimit != 0) skin.sprites.shadow.draw(new Rect({ l: screen.l, r: Math.remap(0, options.timeLimit, screen.r, screen.l, time.now), b: screen.t - 0.04, t: screen.t }), 120, 1)
    }

    //draw apple 🍎
    if (!apple.shouldCheckSpawn && !apple.shouldSpawn) {
      skin.sprites.apple.draw(
        floatingEffect(layout.sqaure)
          .translate(tg(apple.x), tg(apple.y) + 0.02), 50, 1)
    }

    //draw grid ⬜
    skin.sprites.grid.draw(layout.grid, 1, 1)
    skin.sprites.border.draw(layout.gridBorder, 3, 1)

    //draw UI
    if (options.dpad) drawDpad(this.dpadLayout, this.dir)
    drawScore(Math.min(999, game.size - 3), this.scoreLayouts, this.scoreUpdateTime - time.now)
  }


}

