import { WordType } from "../WordType"

export interface TokenDeclaration {
  type: WordType
  regExps: RegExp
  ignore?: boolean
}

export interface Token {
  type: WordType
  value: string,
  position: [number, number]
}

export interface Lexer {
  (defs: TokenDeclaration[]): (input: string) => Token[]
}

/**
 * 创建词法器
 */
export const createLexer: Lexer = (defs) => (input) => {
  let words = input
  let start = 0

  const tokens: Token[] = []

  while(words.length) {
    let matches: RegExpMatchArray | null = null

    for (const def of defs) {
      matches = words.match(def.regExps)
      if (!matches) {
        continue
      }

      const value = matches[1]
      words = words.slice(value.length)

      tokens.push({
        type: def.type,
        value,
        position: [start, start + value.length]
      })

      start += value.length

      break
    }

    if (!matches) {
      throw new Error(`Lexer: 发现非预期的词, "${words}".`)
    }
  }

  return tokens
}