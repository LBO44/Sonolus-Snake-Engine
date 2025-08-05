import { skin } from '../../../../shared/skin.js'
import { archetypes } from './archetypes/index.js'

export const previewData = {
    skin,
    archetypes,

    globalResolver: (name: string) => eval(name) as unknown,
}
