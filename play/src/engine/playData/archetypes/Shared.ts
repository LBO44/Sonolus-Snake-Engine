import { effect } from "../../../../../shared/effect.js"
import { streamId } from "../../../../../shared/utilities.js"
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

export const apple = levelMemory({
  x: Number,
  y: Number,
  shouldSpawn: Boolean,
  shouldCheckSpawn: Boolean,
})

/** function to call when the snake dies,
 * will be executed by both `Head` and `Body` entities*/
export const death = () => {
  game.lose = true
  if (options.bgm) effect.clips.bgm_end.play(0.02); else effect.clips.die.play(0.02)
  game.deathTime = time.now
  streams.set(streamId.death, time.now, 1)
}

