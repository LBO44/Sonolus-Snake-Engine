import { skin } from "./skin.js";
import { options } from "../play/src/engine/configuration.js"


export enum streamId {
  headX,
  headY,
  apple,
  score,
  bodySize,
  dpadDir,
  death
}

//static layouts used for drawing stuff
export const layout = {
  sqaure: Rect.one.mul(0.08),
  line: new Rect({ l: -0.08, r: 0.08, b: -0.01, t: 0.01, }), //used for shadows and eyelid
  grid: Rect.one.mul(0.8),
  gridBorder: Rect.one.mul(0.88),
  dpadUp: new Rect({ l: -0.1, r: 0.1, b: 0.05, t: 0.3 }),
  dpadDown: new Rect({ l: -0.1, r: 0.1, b: -0.05, t: -0.3 }),
  dpadLeft: new Quad({
    x1: -0.05, y1: -0.1,
    x2: -0.3, y2: -0.1,
    x3: -0.3, y3: 0.1,
    x4: -0.05, y4: 0.1,
  }),
  dpadRight: new Quad({
    x1: 0.05, y1: -0.1,
    x2: 0.3, y2: -0.1,
    x3: 0.3, y3: 0.1,
    x4: 0.05, y4: 0.1,
  }),
  scoreDigit: new Rect({ l: -0.08, r: 0.08, b: -0.16, t: 0.16 }),
  score: new Rect({ l: -0.3, r: 0.3, b: -0.096, t: 0.096 }),
}

/** given a position on the grid (x int between 0 and 9)
 * will return x's position on the screen to draw something*/
export const scaleToGrid = (x: number): number => x * 0.16 - 0.72

export const dpadInitialize = (dpadLayout: { right: Quad, left: Quad, down: Rect, up: Rect }) => {
  const s = (options.dpadSize + 5) * 0.1
  const o = (options.dpadSize + 15) * 0.05
  layout.dpadUp
    .scale(s, s)
    .translate(screen.l + 0.45 * o, screen.b + 0.45 * o)
    .copyTo(dpadLayout.up)
  layout.dpadDown
    .scale(s, s)
    .translate(screen.l + 0.45 * o, screen.b + 0.45 * o)
    .copyTo(dpadLayout.down)
  layout.dpadLeft
    .scale(s, s)
    .translate(screen.l + 0.45 * o, screen.b + 0.45 * o)
    .copyTo(dpadLayout.left)
  layout.dpadRight
    .scale(s, s)
    .translate(screen.l + 0.45 * o, screen.b + 0.45 * o)
    .copyTo(dpadLayout.right)
}


/** used for the floating apple animation*/
export const floatingEffect = (
  { l, r, b, t }: RectLike
): Quad => {
  const p = Math.sin(time.now * 2.5)
  const offsetY = p * 0.02
  const angle = p * 0.05

  return new Quad({
    y1: (l) * Math.sin(angle) + (b + offsetY) * Math.cos(angle),
    y2: (l) * Math.sin(angle) + (t + offsetY) * Math.cos(angle),
    y3: (r) * Math.sin(angle) + (t + offsetY) * Math.cos(angle),
    y4: (r) * Math.sin(angle) + (b + offsetY) * Math.cos(angle),

    x1: (l) * Math.cos(angle) - ((b + offsetY)) * Math.sin(angle),
    x2: (l) * Math.cos(angle) - ((t + offsetY)) * Math.sin(angle),
    x3: (r) * Math.cos(angle) - ((t + offsetY)) * Math.sin(angle),
    x4: (r) * Math.cos(angle) - ((b + offsetY)) * Math.sin(angle),
  });
};

export const drawDpad = (dpadLayout: { right: Quad, left: Quad, down: Rect, up: Rect }, dir: number) => {
  skin.sprites.button.draw(dpadLayout.right, 100, (dir === 4) ? 0.4 : 0.8)
  skin.sprites.button.draw(dpadLayout.left, 100, (dir === 2) ? 0.4 : 0.8)
  skin.sprites.button.draw(dpadLayout.down, 100, (dir === 3) ? 0.4 : 0.8)
  skin.sprites.button.draw(dpadLayout.up, 100, (dir === 1) ? 0.4 : 0.8)
}

export const drawScore = (
  score: number,
  scoreLayouts: { digit1: Rect, digit2: Rect, digit3: Rect, title: Rect },
  timeDelta: number,

) => {

  const alpha = 1 - 0.2 * Math.ease("In", "Expo", Math.min(0.5, timeDelta) * 2)
  if (timeDelta >= 0) {
    const scale = 0.85 + 0.3 * Math.ease("In", "Expo", Math.min(0.5, timeDelta) * 2)
    layout.scoreDigit
      .mul(scale)
      .translate(screen.r * 0.75 + 0.15, 0.04)
      .copyTo(scoreLayouts.digit1)
    layout.scoreDigit
      .mul(scale)
      .translate(screen.r * 0.75, 0.04)
      .copyTo(scoreLayouts.digit2)
    layout.scoreDigit
      .mul(scale)
      .translate(screen.r * 0.75 - 0.15, 0.04)
      .copyTo(scoreLayouts.digit3)

    layout.score
      .mul(scale)
      .translate(screen.r * 0.75, -0.14)
      .copyTo(scoreLayouts.title)
  }

  const digit1 = Math.floor(score % 10) + skin.sprites.numberZero.id as SkinSpriteId
  const digit2 = Math.floor(score / 10 % 10) + skin.sprites.numberZero.id as SkinSpriteId
  const digit3 = Math.floor(score / 100) + skin.sprites.numberZero.id as SkinSpriteId

  skin.sprites.draw(digit1, scoreLayouts.digit1, 100, alpha)
  skin.sprites.draw(digit2, scoreLayouts.digit2, 101, alpha)
  skin.sprites.draw(digit3, scoreLayouts.digit3, 102, alpha)

  skin.sprites.score.draw(scoreLayouts.title, 110, alpha)
}

/** animation used in the "no walls" game mode only
 * update the this.layoutAppear  layout variable*/
export const HeadAppearAnimation = (layout: Rect, pos: { x: number, y: number }, dir: number, p: number) => {
  switch (dir) {
    case 2:
      {
        new Rect({
          l: Math.lerp(0.08, - 0.08, p),
          r: 0.08,
          b: -0.08,
          t: 0.08,
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
      }
      break;
    case 3:
      {
        new Rect({
          l: -0.08,
          r: 0.08,
          b: Math.lerp(0.08, -0.08, p),
          t: 0.08,
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
      }
      break;
    case 4:
      {
        new Rect({
          l: -0.08,
          r: Math.lerp(-0.08, 0.08, p),
          b: -0.08,
          t: 0.08,
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
      }
      break;
    case 1:
      {
        new Rect({
          l: -0.08,
          r: 0.08,
          b: -0.08,
          t: Math.lerp(-0.08, 0.08, p),
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
      }
      break;
  }
}

export const TailDespawnAnimation = (layout: Rect, dir: number, pos: { x: number, y: number }, p: number) => {
  switch (dir) {
    case 4:
      {
        new Rect({
          l: Math.lerp(-0.08, 0.08, p),
          r: 0.08,
          b: -0.08,
          t: 0.08,
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
        break
      }
    case 1:
      {
        new Rect({
          l: -0.08,
          r: 0.08,
          b: Math.lerp(-0.08, 0.08, p),
          t: 0.08,
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
        break
      }
    case 2:
      {
        new Rect({
          l: -0.08,
          r: Math.lerp(0.08, -0.08, p),
          b: -0.08,
          t: 0.08,
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
        break
      }
    case 3:
      {
        new Rect({
          l: -0.08,
          r: 0.08,
          b: -0.08,
          t: Math.lerp(0.08, -0.08, p),
        })
          .translate(scaleToGrid(pos.x), scaleToGrid(pos.y) + 0.02)
          .copyTo(layout)
        break
      }
  }
}
