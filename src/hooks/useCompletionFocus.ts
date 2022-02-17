import Input from "antd/lib/input"
import React, { useState, useMemo, useCallback, useEffect } from "react"

type ProxyEventHandler<T> = (e: T) => T

/**
 * 递增或递减已选索引的键盘交互逻辑
 * @param dataSource 所有可能的提示集合
 * @returns 返回当前选中的项和递增/递减函数
 */
export function useCompletionFocus<T>(dataSource: T[]): [
  T | null,
  number,
  () => void,
  ProxyEventHandler<React.KeyboardEvent<Input>>,
] {

  const [selectedIndex, setSelectedIndex] = useState(-1)

  const current = useMemo<T | null>(() =>
    dataSource[selectedIndex] ? dataSource[selectedIndex] : null, [dataSource, selectedIndex])

  // 索引递增
  const increase = useCallback(() => {
    if (dataSource[selectedIndex + 1]) {
      return setSelectedIndex(selectedIndex + 1)
    } else {
      return setSelectedIndex(0)
    }
  }, [dataSource, selectedIndex])

  // 索引递减
  const decrease = useCallback(() => {
    if (dataSource[selectedIndex - 1]) {
      return setSelectedIndex(selectedIndex - 1)
    } else {
      return setSelectedIndex(dataSource.length - 1)
    }
  }, [dataSource, selectedIndex])

  // 通过键盘来选择备选项
  const handleKeyEvent = useCallback<ProxyEventHandler<React.KeyboardEvent<Input>>>((event) => {

    // 向下移动焦点
    if ((event.ctrlKey && event.key === 'j') || event.key === 'ArrowDown' || event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      increase()
    }

    // 向上移动焦点
    if ((event.ctrlKey && event.key === 'k') || event.key === 'ArrowUp' || event.key === 'Tab' && event.shiftKey) {
      event.preventDefault()
      event.stopPropagation()
      decrease()
    }

    return event
  }, [decrease, increase])

  const reset = useCallback(() => {
    setSelectedIndex(0)
  }, [])

  // 选中空值索引改为0
  useEffect(() => {
    if (!dataSource[selectedIndex]) {
      setSelectedIndex(0)
    }
  }, [dataSource, selectedIndex])

  // 选中后清除索引位置
  useEffect(() => {
    reset()
  }, [dataSource, reset])

  return [current, selectedIndex, reset, handleKeyEvent]
}