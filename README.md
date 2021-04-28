# SPL Input

提供 X-Bizseer 项目日志模块中带有语法提示的 SPL文本输入框

需要注意的是, 语法提示不对查询语句的正确性做任何保证, 仅根据静态语法规则提供联想.

## 用法

```typescript
// # typescript

import * as React from 'react'
import * as ReactDOM from 'react-dom'

// 导入 spl-input 包
import { QueryInput } from 'spl-input'

// 导入语法提示/错误提示方法
import { getSuggestions } from 'spl-parser'

// 导入 css 文件
import 'spl-input/spl-input.css'

const [suggestionList, setSuggestionList] = useState<SuggestionItem[]>([])

const [query, setQuery] = React.useState<string>('')
const [error, setError] = useState<string>()

const handleChange = React.useCallback((value: string) => {
  // 输入改变事件
  setQuery(value)
  const [suggestionList, error] = getSuggestions(value)
  setSuggestionList(suggestionList)
  setError(undefined)
  error ? setError(`非预期的字符${error}`) : setError(undefined)
}, [])

const onQueryEnter = React.useCallback((value: string) => {
  // 回车查询事件
}, [])

useEffect(() => {
  const [suggestionList] = getSuggestions('')
  setSuggestionList(suggestionList)
}, [])

ReactDOM.render(
  <div style={ { padding: 24 } }>
    {/* QueryInput 即带有语法提示的文本框 */}
    <QueryInput 
      value={query}
      error={error}
      onQueryChange={handleChange}
      onQueryEnter={onQueryEnter}
      suggestionItems={suggestionList}
    />
  </div>,
  document.getElementById('root'),
)
```

## QueryInput 属性介绍

| 属性名          | 是否可选 | 数据类型                | 描述                                               |
| --------------- | -------- | ----------------------- | -------------------------------------------------- |
| suggestionItems | 必填     | SuggestionItem[]        | 语法提示列表                                       |
| value           | 必选     | string                  | 输入框中的字符串                                   |
| error           | 可选     | string                  | 语法错误提示                                       |
| loading         | 可选     | boolean                 | 输入框目前是否处于正在加载数据的状态               |
| onQueryChange   | 必选     | (query: string) => void | 输入框内容变化事件, 选择推荐条目或键入字符均会触发 |
| onQueryEnter    | 可选     | () => void              | 回车按下事件, 按下Enter时触发                      |