import { effect } from "../../../../../shared/effect.js"
import { particle } from "../../../../../shared/particle.js"
import { scaleToGrid as tg, streamId } from "../../../../../shared/utilities.js"
import { options } from "../../configuration.js"

//game variables

//pos is snake head position
export const pos = levelMemory({
  x: Number,
  y: Number
})

export const game = levelMemory({
  isTick: Boolean,
  tick: Number,
  tickDuration: Number,
  dir: Number,
  size: Number,
  lose: Boolean,
  loseScore: Boolean, //dispawn the score entities once the death anumation is complete
  deathTime: Number,
  nextTickAnimationProgress: Number,//used for the lerp animation when drawiing movinng head and tail and for the death animation
  bodyColour: Boolean,//used to alternate the body colours
})

/** function to call when the snake dies,
 * will be executed by both `Head` and `Body` entities*/
export const death = () => {
  game.lose = true
  if (options.bgm) effect.clips.bgm_end.play(0.02); else effect.clips.die.play(0.02)
  game.deathTime = time.now
  streams.set(streamId.death, time.now, 1)
  let x = pos.x, y = pos.y
  switch (game.dir) {
    case 4: x--; break
    case 2: x++; break
    case 1: y--; break
    case 3: y++; break
  }
  particle.effects.die.spawn(Rect.one.mul(0.14).translate(tg(x), tg(y)), 1.3, false)
}

