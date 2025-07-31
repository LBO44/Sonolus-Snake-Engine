import { ui } from '../../../shared/src/engine/configuration/ui.js'
import { optionsDefinition } from '../../../shared/src/engine/configuration/options.js'

export const options = defineOptions(optionsDefinition)

export const configuration = {
    options,
    ui,
}
