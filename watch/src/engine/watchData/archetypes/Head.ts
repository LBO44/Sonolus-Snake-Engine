import { effect } from '../../../../../shared/effect.js'
import { skin } from '../../../../../shared/skin.js'
import { dpadInitialize, drawDpad, drawScore, floatingEffect, HeadAppearAnimation, layout, streamId, TailDespawnAnimation, scaleToGrid as tg } from "../../../../../shared/utilities.js"
import { options } from "../../configuration.js"
import { archetypes } from './index.js'

export class Head extends Archetype {

  spawnTime() { return -999999 }
  despawnTime() { return 999999 }


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

  isReplay = this.entityMemory(Boolean)

  scheduleSfx() {

    {
      let key = 0
      while (true) {
        const newKey = streams.getNextKey(streamId.score, key)
        if (key == newKey) break
        key = newKey
        effect.clips.eat.schedule(key, 0.005)

        const posKey = streams.getNextKey(streamId.headX, key)
        const x = streams.getValue(streamId.headX, posKey)
        const y = streams.getValue(streamId.headY, posKey)
        archetypes.ScoreEffect.spawn({ time: key, x, y })
      }
    }

    {
      const deathTime = streams.getNextKey(streamId.death, 0)
      if (streams.has(streamId.death, deathTime)) {
        effect.clips.die.schedule(deathTime, 0.02)
        archetypes.DeathParticle.spawn({
          time: deathTime,
          x: streams.getValue(streamId.headX, deathTime),
          y: streams.getValue(streamId.headY, deathTime),
        })
      }
    }

    if (options.noWall) {
      let key = 0
      while (true) {
        const newKey = streams.getNextKey(streamId.headX, key)
        if (key == newKey) break

        const oldPos = {
          x: streams.getValue(streamId.headX, key),
          y: streams.getValue(streamId.headY, key)
        }
        const newPos = {
          x: streams.getValue(streamId.headX, newKey),
          y: streams.getValue(streamId.headY, newKey)
        }

        key = newKey

        const hasWrapped = Math.abs(newPos.x - oldPos.x) > 1 || Math.abs(newPos.y - oldPos.y) > 1
        if (hasWrapped) effect.clips.wrap.schedule(key, 0.02)
      }
    }

  }


  preprocess() {

    this.isReplay = streams.getNextKey(streamId.apple, -5) != -5

    ui.menu.set({
      anchor: screen.rect.shrink(0.05, 0.05).rt,
      pivot: { x: 1, y: 1 },
      size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
      rotation: 0,
      alpha: ui.configuration.menu.alpha,
      horizontalAlign: HorizontalAlign.Center,
      background: true,
    })

    if (!this.isReplay) return

    ui.progress.set({
      anchor: screen.rect.lb.add(new Vec(0.05, 0.05)),
      pivot: { x: 0, y: 0 },
      size: { x: screen.rect.w - 0.1, y: 0.15 * ui.configuration.progress.scale },
      rotation: 0,
      alpha: ui.configuration.progress.alpha,
      horizontalAlign: HorizontalAlign.Center,
      background: true,
    })

    this.scheduleSfx()
  }


  initialize() {
    if (options.dpad && this.isReplay) dpadInitialize(this.dpadLayout)
  }



  getDir(key: number, x: number, y: number) {
    let dir = 0
    const newX = streams.getValue(streamId.headX, key + 0.01)
    const newY = streams.getValue(streamId.headY, key + 0.01)
    if (x < newX) dir = 4
    else if (x > newX) dir = 2
    else if (y < newY) dir = 1
    else if (y > newY) dir = 3
    return dir
  }


  animationProgress() {
    //progress value for the lerp animation for head and body
    const previousKeyTime = streams.getPreviousKey(streamId.headX, time.now)
    const nextKeyTime = streams.getNextKey(streamId.headX, time.now)
    return (time.now - previousKeyTime) / (nextKeyTime - previousKeyTime)
  }


  drawBody(deathTime: number) {

    const bodySize = Math.floor(streams.getValue(streamId.bodySize, time.now)) - 1

    let prevKey = time.now

    for (let index = 0; index < bodySize; index++) {

      prevKey = streams.getPreviousKey(streamId.headX, prevKey)

      const x = streams.getValue(streamId.headX, prevKey)
      const y = streams.getValue(streamId.headY, prevKey)

      const bodySkin = (y + x) % 2 == 0 ? skin.sprites.bodyLight.id : skin.sprites.bodyDark.id
      const nextBodySize = Math.floor(streams.getValue(streamId.bodySize, streams.getNextKey(streamId.headX, time.now))) - 1

      if (time.now < deathTime && index == bodySize - 1 && bodySize == nextBodySize) {
        let rect = new Rect

        let dir = this.getDir(prevKey, x, y)

        if (options.noWall) {
          const newX = streams.getValue(streamId.headX, streams.getNextKey(streamId.headX, prevKey))
          const newY = streams.getValue(streamId.headY, streams.getNextKey(streamId.headY, prevKey))


          const hasWrapped = (Math.abs(x - newX) > 1 || Math.abs(y - newY) > 1)

          if (hasWrapped) {
            switch (dir) {
              case 4: dir = 2; break
              case 2: dir = 4; break
              case 3: dir = 1; break
              case 1: dir = 3; break
            }
          }
        }

        TailDespawnAnimation(rect, dir, { x: x, y: y }, this.animationProgress())
        skin.sprites.shadow.draw(rect.translate(0, -0.02), 39, 1)
        skin.sprites.draw(bodySkin, rect, 40, 1)
      }

      else {

        let yOffset = 0 //death animation
        if (index > 0 && time.now >= deathTime) {
          const p = time.now - deathTime - ((index) * 0.15)
          if (p >= 0 && p <= 0.15) {
            yOffset = Math.max(0, 0.02 * Math.sin(p / 0.1 * Math.PI)) + 0.02
          }
        }

        const bodyRect = layout.sqaure.translate(tg(x), tg(y) + 0.02 + yOffset)
        const shadow = layout.line.translate(tg(x), tg(y) - 0.07 + yOffset)

        skin.sprites.shadow.draw(shadow, 39, 1)
        skin.sprites.draw(bodySkin, bodyRect, 40, 1)
      }
    }
  }

  drawHeadAndUI(deathTime: number) {

    const oldPos = {
      x: streams.getValue(streamId.headX, streams.getPreviousKey(streamId.headX, time.now)),
      y: streams.getValue(streamId.headY, streams.getPreviousKey(streamId.headY, time.now))
    }
    const newPos = {
      x: streams.getValue(streamId.headX, streams.getNextKey(streamId.headX, time.now)),
      y: streams.getValue(streamId.headY, streams.getNextKey(streamId.headY, time.now))
    }
    const pos = {
      x: streams.getValue(streamId.headX, time.now),
      y: streams.getValue(streamId.headY, time.now),
    }


    if (time.now >= deathTime) {

      //shake camera (grid)
      const shake = Math.pow(Math.max(deathTime + 1 - time.now, 0) * 0.1, 2)
      if (!time.skip) skin.sprites.grid.draw(layout.grid.translate(Math.randomFloat(-shake, shake), Math.randomFloat(-shake, shake)), 2, 1)

      //draw head dead 💀
      skin.sprites.headDead.draw(layout.sqaure
        .translate(tg(oldPos.x), tg(oldPos.y) + 0.02), 50, 1)
      skin.sprites.shadow.draw(layout.line
        .translate(tg(oldPos.x), tg(oldPos.y) - 0.07), 39, 1)
    }

    else {
      //draw head appearing from other side if the snake passed through a wall
      const hasWrapped = options.noWall && (Math.abs(newPos.x - oldPos.x) > 1 || Math.abs(newPos.y - oldPos.y) > 1)

      if (hasWrapped) {
        let layoutAppear = new Rect
        HeadAppearAnimation(layoutAppear, newPos, this.getDir(time.now, newPos.x, newPos.y), this.animationProgress())
        skin.sprites.head.draw(layoutAppear, 50, 1)
        skin.sprites.shadow.draw(layoutAppear.translate(0, -0.02), 39, 1)
      }

      //draw the head normally
      else {
        skin.sprites.head.draw(layout.sqaure.translate(tg(pos.x), tg(pos.y) + 0.02), 50, 1)
        skin.sprites.shadow.draw(layout.line.translate(tg(pos.x), tg(pos.y) - 0.07), 39, 1)
      }

    }


    //drawing the blinking border
    const isOnSides = (Math.max(pos.x, pos.y) > 8 || Math.min(pos.x, pos.y) < 1)
    const isBlinkTime = (Math.floor(time.now * 5) % 2 === 0)
    if (!options.noWall && isBlinkTime && isOnSides) skin.sprites.borderDanger.draw(layout.gridBorder, 4, 0.5)

    //draw time limit progress bar
    if (options.timeLimit != 0) skin.sprites.shadow.draw(new Rect({ l: screen.l, r: Math.remap(0, options.timeLimit, screen.r, screen.l, time.now), b: screen.t - 0.04, t: screen.t }), 120, 1)

    //draw apple 🍎
    const appleValue = streams.getValue(streamId.apple, streams.getPreviousKey(streamId.apple, time.now))
    const apple = {
      x: Math.floor(appleValue * 0.1),
      y: appleValue % 10
    }

    skin.sprites.apple.draw(
      floatingEffect(layout.sqaure)
        .translate(tg(apple.x), tg(apple.y) + 0.02), 60, 1)

    //draw grid ⬜
    skin.sprites.grid.draw(layout.grid, 1, 1)
    skin.sprites.border.draw(layout.gridBorder, 3, 1)

    //draw UI
    if (options.dpad) {
      const dir = streams.getValue(streamId.dpadDir, streams.getPreviousKey(streamId.dpadDir, time.now))
      drawDpad(this.dpadLayout, dir)
    }

    const score = Math.floor(streams.getValue(streamId.score, time.now))
    drawScore(Math.min(999, score - 3), this.scoreLayouts, streams.getPreviousKey(streamId.score, time.now) + 0.5 - time.now)

  }


  updateParallel() {

    if (this.isReplay) {

      const deathKey = streams.getNextKey(streamId.death, 0)
      const deathTime = (deathKey != 0) ? deathKey : 99999999999

      this.drawBody(deathTime)

      this.drawHeadAndUI(deathTime)
    }

    else {
      skin.sprites.watchError.draw(Rect.one.scale(0.496, 0.024).translate(0, -0.3), 1, 1)
      skin.sprites.snakeError.draw(Rect.one.scale(0.26, 0.1).mul(2), 0, 1)
    }

  }

}
