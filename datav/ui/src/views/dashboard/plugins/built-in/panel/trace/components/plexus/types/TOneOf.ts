// Copyright (c) 2019 Uber Technologies, Inc.
//

type TOneOf<A, B, C = {}, D = {}, E = {}> =
  | ({ [P in Exclude<keyof (B & C & D & E), keyof A>]?: undefined } & A)
  | ({ [P in Exclude<keyof (A & C & D & E), keyof B>]?: undefined } & B)
  | ({ [P in Exclude<keyof (A & B & D & E), keyof C>]?: undefined } & C)
  | ({ [P in Exclude<keyof (A & B & C & E), keyof D>]?: undefined } & D)
  | ({ [P in Exclude<keyof (A & B & C & D), keyof E>]?: undefined } & E)

// eslint-disable-next-line no-undef
export default TOneOf

export type TOneOfTwo<A, B> =
  | ({ [P in Exclude<keyof B, keyof A>]?: undefined } & A)
  | ({ [P in Exclude<keyof A, keyof B>]?: undefined } & B)

export type TOneOfThree<A, B, C> =
  | ({ [P in Exclude<keyof (B & C), keyof A>]?: undefined } & A)
  | ({ [P in Exclude<keyof (A & C), keyof B>]?: undefined } & B)
  | ({ [P in Exclude<keyof (A & B), keyof C>]?: undefined } & C)

export type TOneOfFour<A, B, C, D> =
  | ({ [P in Exclude<keyof (B & C & D), keyof A>]?: undefined } & A)
  | ({ [P in Exclude<keyof (A & C & D), keyof B>]?: undefined } & B)
  | ({ [P in Exclude<keyof (A & B & D), keyof C>]?: undefined } & C)
  | ({ [P in Exclude<keyof (A & B & C), keyof D>]?: undefined } & D)

export type TOneOfFive<A, B, C, D, E> = TOneOf<A, B, C, D, E>
