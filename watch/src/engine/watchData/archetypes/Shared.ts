//game variables
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
  deathTime: Number,
  nextTickAnimationProgress: Number,//used for the lerp animation when drawiing movinng head and tai
  bodyColour: Boolean,//used to alternate the body colour
})

export const body = levelMemory({
  pos: Tuple(100, Number), // {dir}{x}{y}
  tickLeft: Tuple(100, Number),
})

export const apple = levelMemory({
  x: Number,
  y: Number,
})
