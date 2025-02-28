import { apple, data, game } from "./Shared.js";

/** the Data entity is used to save the game data for replay mode
 * exported data is 16 pairs of tickN et dirN
 * where dir is the data change like direction (1 up ;3 down; 2 left; 4 right)
 * or an apple eaten `5{new apple.x}{new apple.y}` and `6` is dead
 * and Tick is the game tick at which the event happened
*/
export class Data extends Archetype {

  exportDataTickDir = Object.fromEntries(
    Array.from({ length: 16 }, (_, index) => {
      const i = index + 1;
      return [
        [`tick${i}`, { name: `tick${i}`, type: Number }],
        [`dir${i}`, { name: `dir${i}`, type: Number }],
      ];
    }).flat()
  );

  import = this.defineImport({
    DataIndex: { name: "DataIndex", type: Number },
  })
  export = this.defineExport(this.exportDataTickDir)

  spawnOrderOrder = 3
  updateSequentialOrder = 999

  shouldSpawn() {
    return true
  }

  updateSequential() {
    if ((game.tick > 0 || game.isTick) && (data.shouldSaveDirection || data.shouldSaveApple || data.shouldSaveDeath)
      && data.Index >= (this.import.DataIndex * 16) && data.Index < (this.import.DataIndex + 1) * 16) {
      data.Index++

      //if only 1 slot of data is free in this entity but we need to save 2 events on same tick
      //then we directly skip to the next data entity
      if (data.Index % 16 == 0 && 2 <= (data.shouldSaveApple ? 1 : 0) + (data.shouldSaveDeath ? 1 : 0) + (data.shouldSaveDirection ? 1 : 0)) {
        this.export("tick16", -999)
        return
      }


      let t = (game.tick == 0) ? 1 : game.tick
      let d = 0
      if (data.shouldSaveDeath) {
        d = 6
        data.shouldSaveDeath = false
      } else if (data.shouldSaveApple) {
        d = (500 + apple.x * 10 + apple.y)
        t = game.tick
        data.shouldSaveApple = false
        debug.log(5 + 100 * data.Index + 1000000 * this.import.DataIndex)
      } else if (data.shouldSaveDirection) {
        d = game.dir
        data.shouldSaveDirection = false
      }

      switch (data.Index % 16) {
        case 1:
          this.export("tick1", t)
          this.export("dir1", d)
          break;
        case 2:
          this.export("tick2", t)
          this.export("dir2", d)
          break;
        case 3:
          this.export("tick3", t)
          this.export("dir3", d)
          break;
        case 4:
          this.export("tick4", t)
          this.export("dir4", d)
          break;
        case 5:
          this.export("tick5", t)
          this.export("dir5", d)
          break;
        case 6:
          this.export("tick6", t)
          this.export("dir6", d)
          break;
        case 7:
          this.export("tick7", t)
          this.export("dir7", d)
          break;
        case 8:
          this.export("tick8", t)
          this.export("dir8", d)
          break;
        case 9:
          this.export("tick9", t)
          this.export("dir9", d)
          break;
        case 10:
          this.export("tick10", t)
          this.export("dir10", d)
          break;
        case 11:
          this.export("tick11", t)
          this.export("dir11", d)
          break;
        case 12:
          this.export("tick12", t)
          this.export("dir12", d)
          break;
        case 13:
          this.export("tick13", t)
          this.export("dir13", d)
          break;
        case 14:
          this.export("tick14", t)
          this.export("dir14", d)
          break;
        case 15:
          this.export("tick15", t)
          this.export("dir15", d)
          break;
        case 0:
          this.export("tick16", t)
          this.export("dir16", d)
          this.despawn = true
          break;
      }


    }
  }
}
