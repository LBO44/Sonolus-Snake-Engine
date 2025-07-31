import { skin } from '../../../../shared/skin.js'
import { particle } from '../../../../shared/particle.js'
import { effect } from '../../../../shared/effect.js'
import { instruction } from './instruction.js'
import { tutorial } from './tutorial.js'

export const tutorialData = {
    skin,
    effect,
    particle,
    instruction,
    tutorial,

    globalResolver: (name: string) => eval(name) as unknown,
}
