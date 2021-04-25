import Input from "antd/lib/input"
import { useState, useMemo, useCallback, useEffect } from "react"

type ProxyEventHandler<T> = (e: T) => T

/**
 * 递增或递减已选索引的键盘交互逻辑
 * @param dataSource 所有可能的提示集合
 * @returns 返回当前选中的项和递增/递减函数
 */
export function useCompletionFocus<T>(dataSource: T[], onPick?: (item: T) => void): [
  T | undefined,
  number,
  ProxyEventHandler<React.KeyboardEvent<Input>>,
  SuggestionItem | null,
] {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [curDataSource, setCurDataSource] = useState<SuggestionItem | null>(null)

  const current = useMemo<T | undefined>(() =>
    dataSource[selectedIndex] ? dataSource[selectedIndex] : undefined, [dataSource, selectedIndex])

  // 索引递增
  const increase = useCallback(() => {
    if (dataSource[selectedIndex + 1]) {
      // TODO
      setCurDataSource(dataSource[selectedIndex + 1] as any)
      return setSelectedIndex(selectedIndex + 1)
    }
  }, [dataSource, selectedIndex])

  // 索引递减
  const decrease = useCallback(() => {
    if (dataSource[selectedIndex - 1]) {
      return setSelectedIndex(selectedIndex - 1)
    }
  }, [dataSource, selectedIndex])

  const pick = useCallback(() => {
    onPick && current && onPick(current)
    setSelectedIndex(0)
  }, [current, onPick])

  // 通过键盘来选择备选项
  const handleKeyEvent = useCallback<ProxyEventHandler<React.KeyboardEvent<Input>>>((e) => {
    // 向下移动焦点
    if ((e.ctrlKey && e.key === 'j') || e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      increase()
    }

    // 向上移动焦点
    if ((e.ctrlKey && e.key === 'k') || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      decrease()
    }

    // 确认使用备选项
    if (e.key === 'Tab') {
      e.preventDefault()
      e.stopPropagation()
      pick()
    }

    return e
  }, [decrease, increase, pick])

  useEffect(() => {
    setSelectedIndex(0)
  }, [dataSource])

  return [current, selectedIndex, handleKeyEvent, curDataSource]
}