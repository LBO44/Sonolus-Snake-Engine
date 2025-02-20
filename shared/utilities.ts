//static layout used for drawing stuff
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

/** used for the floating apple animation*/
export const floatingEffect = (
  { l, r, b, t }: RectLike,time:number
): Quad => {
  const p = Math.sin(time * 2.5)
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


  /** animation used in the "no walls" game mode only
   * update the this.layoutAppear  layout variable*/
export const HeadAppearAnimation = (layout:Rect,pos:{x:number,y:number},dir: number,p:number) => {
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
