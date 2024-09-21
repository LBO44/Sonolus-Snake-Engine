import { LevelData } from '@sonolus/core'


export const data: LevelData = {
  bgmOffset: 0,
  entities: [
    {
      archetype: 'Initialization',
      data: [],
    },
    {
      archetype: 'Head',
      data: [],
    },
    ...Array.from({ length: 97 }, (_, index) => ({
      archetype: 'Score',
      data: [{
        name: "ScoreIndex",
        value: index + 1
      }],
    })),
    ...Array.from({ length: 100 }, (_, index) => ({
      archetype: 'Data',
      data: [{
        name: "DataIndex",
        value: index + 1
      }],
    })),
  ],
}
