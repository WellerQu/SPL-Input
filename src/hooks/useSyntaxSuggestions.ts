// import { getAllFields } from '@/service/log/field/fieldService'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValueType } from '../FieldValueType'

import { lexer, parseToSuggestions, WordType, tokenize } from './grammar'

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
  [key in Required<CompletionItem>['tagName']]: number
} = {
  '关键词': 1,
  '函数': 0,
  '字段': 2,
  '数字': 0,
  '符号': 0,
  '算子': 0,
  '逻辑': 1
}

/**
 * 最大可选项个数
 */
const MAX_SIZE = 5

const connecterTerms: CompletionItem[] = [
  {
    id: 'and connector',
    label: 'AND',
    desc: '同时满足',
    tagName: '逻辑',
  }, {
    id: 'or connector',
    label: 'OR',
    desc: '部分满足',
    tagName: '逻辑',
  }, {
    id: 'not connector',
    label: 'NOT',
    desc: '反向选择',
    tagName: '逻辑'
  }
]

const aggregateTerms: CompletionItem[] = [
  {
    id: 'count',
    label: 'count',
    desc: '计数',
    filterable: true,
    tagName: '函数',
  },
  {
    id: 'sum',
    label: 'sum',
    desc: '求和',
    filterable: true,
    tagName: '函数',
  },
  {
    id: 'avg',
    label: 'avg',
    desc: '求平均',
    filterable: true,
    tagName: '函数'
  },
  {
    id: 'min',
    label: 'min',
    desc: '求最小',
    filterable: true,
    tagName: '函数'
  },
  {
    id: 'max',
    label: 'max',
    desc: '求最大',
    filterable: true,
    tagName: '函数'
  }
]

/**
 * 语法分析
 * @param initUserInput 用户输入
 */
export function useSyntaxSuggestions(newUserInput: string, fieldOptionItems: DistinctField[]): [CompletionItem[], RefactorAction] {
  const [terms, setTerms] = useState<CompletionItem[]>([])

  const suggestions = useMemo(() => parseToSuggestions(newUserInput), [newUserInput])
  const originTokens = useMemo(() => tokenize(newUserInput), [newUserInput])

  // 重构用户的输入
  const refactorUserInput = useCallback<RefactorAction>((input, append = false) => {
    if (!append) {
      return input
    }

    if (originTokens.length === 0) {
      return input
    }

    const [lastToken] = originTokens.slice(-1)
    const [inputToken] = lexer(input)
    const isCommand = (
       inputToken.type === WordType.stats 
       || inputToken.type === WordType.sort 
       || inputToken.type === WordType.limit
       || inputToken.type === WordType.fields)
    const isAggregation = (inputToken.type === WordType.aggregation)
    const isKeyword = (inputToken.type === WordType.as || inputToken.type === WordType.by)

    // 在捋这一块逻辑的时候, 只有我和上帝明白是怎么回事, 当你看到这段代码的时候, 应该就只有上帝明白了
    if (
        (suggestions.includes(inputToken.type) && lastToken.type ===  inputToken.type && lastToken.value !== inputToken.value)
        || (isCommand && lastToken.type !== WordType.whitespace && lastToken.type !== WordType.pipe)
        || (isAggregation && lastToken.type !== WordType.whitespace)
        || (isKeyword && lastToken.type !== WordType.whitespace)
      ) {
      // 用户已经输入部分字符, 补全用户输入
      const userInput = originTokens.slice(0, originTokens.length - 1).map(item => item.value).join('')
      return (userInput + input)
    }  else if (suggestions.includes(inputToken.type)) {
      // 在词尾添加用户的选择全部输入
      const fullInput = originTokens.map(item => item.value).join('')
      return (fullInput + input)
    } else {
      // 在词尾添加空格, 再添加用户选择的输入
      const fullInput = originTokens.map(item => item.value).join('')
      return (fullInput + ' ' + input)
    }
  }, [originTokens, suggestions])

  // 获取字段
  // const fieldState = useAsync(getAllFields)

  useEffect(() => {
    const completions: CompletionItem[] = []
    if (originTokens.length === 0 && newUserInput.length > 0) {
      setTerms(completions)
      return
    }

    const [lastToken] = originTokens.length > 0 ? originTokens.slice(-1) : []

    const matchLastToken = (word: string) => (
      !lastToken
      || (lastToken.type !== WordType.identifier || (
        lastToken.type === WordType.identifier
        && word.toLowerCase().includes(lastToken.value.toLowerCase())
        && word.toLowerCase() !== lastToken.value.toLowerCase()
      ))
    )

    //#region 根据下一步的语法建议, 添加可选项
    for (const s of suggestions) {
      if (s === WordType.aggregation) {
        const terms = aggregateTerms
          .filter(item => matchLastToken(item.label))
        completions.push(...terms)
      }
      if (s === WordType.any) {
        completions.push({
          id: WordType.any,
          label: '*',
          desc: '任意字符串',
          tagName: '符号',
        })
      }
      if (s === WordType.one) {
        completions.push({
          id: WordType.one,
          label: '?',
          desc: '任意字符',
          tagName: '符号'
        })
      }
      if (s === WordType.as && matchLastToken(WordType.as)) {
        completions.push({
          id: WordType.as,
          label: WordType.as,
          desc: '设置别名',
          tagName: '关键词',
        })
      }
      if (s === WordType.asc) {
        completions.push({
          id: 'asc',
          label: '+',
          desc: '升序排列',
          tagName: '符号'
        })
      }
      if (s === WordType.assign) {
        completions.push({
          id: 'assign',
          label: '=',
          desc: '等于',
          tagName: '符号',
        })
      }
      if (s === WordType.by && matchLastToken(WordType.by)) {
        completions.push({
          id: WordType.by,
          label: 'by',
          tagName: '关键词',
        })
      }
      if (s === WordType.comma) {
        completions.push({
          id: 'comma',
          label: ',',
          desc: '逗号',
          tagName: '符号',
        })
      }
      if (s === WordType.connector) {
        completions.push(...connecterTerms)
      }
      if (s === WordType.desc) {
        completions.push({
          id: 'desc',
          label: '-',
          desc: '降序排列',
          tagName: '符号'
        })
      }
      if (s === WordType.fields && matchLastToken(WordType.fields)) {
        completions.push({
          id: WordType.fields,
          label:WordType.fields,
          desc: '限定字段' ,
          tagName: '算子',
        })
      }
      if (s === WordType.identifier) {
        const fields = fieldOptionItems
        fields
          .filter(item => matchLastToken(item.name))
          .slice(0, MAX_SIZE)
          .forEach(item => {
            completions.push({
              id: item.name + '_' + item.valueType,
              label: item.name,
              desc: item.valueType,
              tagName: '字段',
            })
          })
      }
      if (s === WordType.leftBracket) {
        completions.push({
          id: 'left-bracket',
          label: '(',
          desc: '左括号',
          tagName: '符号',
        })
      }
      if (s === WordType.leftSquareBracket) {
        completions.push({
          id: 'left-square-bracket',
          label: '[',
          desc: '左闭区间',
          tagName: '符号',
        })
      }
      if (s === WordType.leftBrace) {
        completions.push({
          id: 'left-brace',
          label: '{',
          desc: '左开区间',
          tagName: '符号'
        })
      }
      if (s === WordType.rightBracket) {
        completions.push({
          id: 'right-bracket',
          label: ')',
          desc: '右括号',
          tagName: '符号',
        })
      }
      if (s === WordType.rightSquareBracket) {
        completions.push({
          id: 'right-square-bracket',
          label: ']',
          desc: '右闭区间',
          tagName: '符号',
        })
      }
      if (s === WordType.rightBrace) {
        completions.push({
          id: 'right-brace',
          label: '}',
          desc: '右开区间',
          tagName: '符号'
        })
      }
      if (s === WordType.pipe) {
        completions.push({
          id: 'pipe',
          label: '|',
          desc: '管道符',
          tagName: '符号',
        })
      }
      if (s === WordType.quote) {
        completions.push({
          id: 'quote',
          label: "\"",
          desc: '字符串界定符',
          tagName: '符号',
        })
      }
      if (s === WordType.limit && matchLastToken(WordType.limit)) {
        completions.push({
          id: WordType.limit,
          label: 'limit',
          desc: '限制条数',
          filterable: true,
          tagName: '算子',
        })
      }
      if (s === WordType.sort && matchLastToken(WordType.sort)) {
        completions.push({
          id: WordType.sort,
          label: 'sort',
          desc: '排序',
          filterable: true,
          tagName: '算子',
        })
      }
      if (s === WordType.stats && matchLastToken(WordType.stats)) {
        completions.push({
          id: WordType.stats,
          label: WordType.stats,
          desc: '统计',
          filterable: true,
          tagName: '算子',
        })
      }
      if (s === WordType.to && matchLastToken(WordType.to)) {
        completions.push({
          id: WordType.to,
          label: 'TO',
          tagName: '关键词',
        })
      }
      if (s === WordType.whitespace) {
        completions.push({
          id: WordType.whitespace,
          label: ' ',
          desc: '空格',
          tagName: '符号',
        })
      }
    }
    //#endregion

    // 按标签类型降序排列
    completions.sort((a, b) => TagOrder[b.tagName] - TagOrder[a.tagName])

    setTerms(completions)
  }, [newUserInput.length, originTokens, suggestions, fieldOptionItems])

  return [terms, refactorUserInput]
}