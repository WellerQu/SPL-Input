// import { getAllFields } from '@/service/log/field/fieldService'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValueType } from '../FieldValueType'
import { WordType } from '../WordType'
import { getSuggestions } from 'spl-parser'

import { lexer, parseToSuggestions, tokenize } from './grammar'

export interface DistinctField {
  name: string
  valueType: FieldValueType
  /**
   * 是否选中
   */
  status: boolean
  // NOTE: 忽略了其它属性
}

export type RefactorAction = (input: string, append?: boolean) => string

const TagOrder: {
  [key in Required<SuggestionItem>['tag']]: number
} = {
  '关键词': 1,
  '函数': 0,
  '字段': 2,
  '通用': 0,
  '符号': 0,
  '算子': 0,
  '逻辑': 1
}

/**
 * 最大可选项个数
 */
const MAX_SIZE = 5

/**
 * 语法分析
 * @param initUserInput 用户输入
 */
export function useSyntaxSuggestions(newUserInput: string, fieldOptionItems: DistinctField[]): [SuggestionItem[], RefactorAction] {
  const [terms, setTerms] = useState<SuggestionItem[]>([])

  // 重构用户的输入
  const refactorUserInput = useCallback<RefactorAction>((input) => {
    return input
  }, [])

  useEffect(() => {
    const completions = getSuggestions(newUserInput)
    completions.sort((a, b) => TagOrder[b.tag] - TagOrder[a.tag])
    setTerms(completions)
  }, [newUserInput])

  return [terms, refactorUserInput]
}