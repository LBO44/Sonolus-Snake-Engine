import { LevelData } from '@sonolus/core'


const data: LevelData = {
  bgmOffset: 0,
  entities: [
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
  ],
}

export const level = {
  data,
}
