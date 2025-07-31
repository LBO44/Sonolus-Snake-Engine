import { skin } from '../../../../shared/skin.js'
import { floatingEffect } from "../../../../shared/utilities.js"
import { instruction } from './instruction.js'

let index = tutorialMemory(InstructionTextId)

const preprocess = () => {
    const gap = 0.05
    const uiRect = screen.rect.shrink(gap, gap)

    ui.menu.set({
        anchor: screen.rect.shrink(0.05, 0.05).rt,
        pivot: { x: 1, y: 1 },
        size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
        rotation: 0,
        alpha: ui.configuration.menu.alpha,
        background: true,
    })

    ui.navigation.previous.set({
        anchor: uiRect.cl,
        pivot: { x: 0, y: 0.5 },
        size: new Vec(0.15, 0.15).mul(ui.configuration.navigation.scale),
        rotation: 0,
        alpha: ui.configuration.navigation.alpha,
        background: true,
    })
    ui.navigation.next.set({
        anchor: uiRect.cr,
        pivot: { x: 1, y: 0.5 },
        size: new Vec(0.15, 0.15).mul(ui.configuration.navigation.scale),
        rotation: 0,
        alpha: ui.configuration.navigation.alpha,
        background: true,
    })

    ui.instruction.set({
        anchor: Vec.zero.translate(0, -0.5),
        pivot: { x: 0.5, y: 0.5 },
        size: new Vec(1.2, 0.15).mul(ui.configuration.instruction.scale),
        rotation: 0,
        alpha: ui.configuration.instruction.alpha,
        background: true,
    })
}

const navigate = () => {
    index = ((index + navigation.direction) % instruction.texts.length + instruction.texts.length) % instruction.texts.length as InstructionTextId
}

const skinList = [
    skin.sprites.head.id,
    skin.sprites.apple.id,
    skin.sprites.skull.id,
]

const update = () => {
    instruction.texts.show(index)

    for (const [i, skinId] of skinList.entries()) {
        if (i == index) skin.sprites.draw(skinId, floatingEffect(Rect.one.mul(0.2)).translate(0, 0.02), 5, 1)
    }
}



export const tutorial = {
    preprocess: [preprocess],

    navigate: [navigate],

    update: [update],
}
