import { skin } from "../../../../../shared/skin.js"

export class Head extends Archetype {

    preprocess() {

        canvas.set({
            scroll: Scroll.LeftToRight,
            size: screen.w,
        })

        ui.menu.set({
            anchor: screen.rect.lt.add(new Vec(0.05, -0.05)),
            pivot: { x: 0, y: 1 },
            size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
            rotation: 0,
            alpha: ui.configuration.menu.alpha,
            background: true,
        })
    }

    render() {
        skin.sprites.previewError.draw(Rect.one.scale(0.351, 0.024).translate(0, -0.3), 1, 1)
        skin.sprites.snakeError.draw(Rect.one.scale(0.26, 0.1).mul(2), 0, 1)
    }
}
