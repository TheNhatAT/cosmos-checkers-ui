export type Player = "b" | "r"
export type GamePiece = Player | "*"
export interface Pos {
    x: number
    y: number
}

export interface GameMove {
    player: Player
    from: Pos
    to: Pos
}

export const completeGame: GameMove[] = [
    { player: "b", from: { x: 1, y: 2 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 0, y: 5 }, to: { x: 1, y: 4 } },
    { player: "b", from: { x: 2, y: 3 }, to: { x: 0, y: 5 } },
    { player: "r", from: { x: 4, y: 5 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 3, y: 2 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 3, y: 4 }, to: { x: 1, y: 2 } },
    { player: "b", from: { x: 0, y: 1 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 2, y: 5 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 2, y: 3 }, to: { x: 4, y: 5 } },
    { player: "r", from: { x: 5, y: 6 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 5, y: 2 }, to: { x: 4, y: 3 } },
    { player: "r", from: { x: 3, y: 4 }, to: { x: 5, y: 2 } },
    { player: "b", from: { x: 6, y: 1 }, to: { x: 4, y: 3 } },
    { player: "r", from: { x: 6, y: 5 }, to: { x: 5, y: 4 } },
    { player: "b", from: { x: 4, y: 3 }, to: { x: 6, y: 5 } },
    { player: "r", from: { x: 7, y: 6 }, to: { x: 5, y: 4 } },
    { player: "b", from: { x: 7, y: 2 }, to: { x: 6, y: 3 } },
    { player: "r", from: { x: 5, y: 4 }, to: { x: 7, y: 2 } },
    { player: "b", from: { x: 4, y: 1 }, to: { x: 3, y: 2 } },
    { player: "r", from: { x: 3, y: 6 }, to: { x: 4, y: 5 } },
    { player: "b", from: { x: 5, y: 0 }, to: { x: 4, y: 1 } },
    { player: "r", from: { x: 2, y: 7 }, to: { x: 3, y: 6 } },
    { player: "b", from: { x: 0, y: 5 }, to: { x: 2, y: 7 } },
    { player: "r", from: { x: 4, y: 5 }, to: { x: 3, y: 4 } },
    { player: "b", from: { x: 2, y: 7 }, to: { x: 4, y: 5 } },
    // player captures again
    { player: "b", from: { x: 4, y: 5 }, to: { x: 2, y: 3 } },
    { player: "r", from: { x: 6, y: 7 }, to: { x: 5, y: 6 } },
    { player: "b", from: { x: 2, y: 3 }, to: { x: 3, y: 4 } },
    { player: "r", from: { x: 0, y: 7 }, to: { x: 1, y: 6 } },
    { player: "b", from: { x: 3, y: 2 }, to: { x: 4, y: 3 } },
    { player: "r", from: { x: 7, y: 2 }, to: { x: 6, y: 1 } },
    { player: "b", from: { x: 7, y: 0 }, to: { x: 5, y: 2 } },
    { player: "r", from: { x: 1, y: 6 }, to: { x: 2, y: 5 } },
    { player: "b", from: { x: 3, y: 4 }, to: { x: 1, y: 6 } },
    { player: "r", from: { x: 4, y: 7 }, to: { x: 3, y: 6 } },
    { player: "b", from: { x: 4, y: 3 }, to: { x: 3, y: 4 } },
    { player: "r", from: { x: 5, y: 6 }, to: { x: 4, y: 5 } },
    { player: "b", from: { x: 3, y: 4 }, to: { x: 5, y: 6 } },
    { player: "r", from: { x: 3, y: 6 }, to: { x: 2, y: 5 } },
    { player: "b", from: { x: 1, y: 6 }, to: { x: 3, y: 4 } },
]
