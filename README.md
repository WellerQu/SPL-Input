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

// 导入 css 文件
import 'spl-input/spl-input.css'

const suggestionList: SuggestionItem[] = [
  { "label": "可选字段", "tag": "字段", "mapping": "fieldName", "code": "" },
  { "label": "否定", "tag": "逻辑", "mapping": "not", "code": "NOT", "description": "查询条件的逻辑否定修饰符, 条件的逆命题", "syntax": "NOT <条件>", "example": "NOT host" },
  { "label": "_exists_", "tag": "关键词", "mapping": "_exists_", "code": "_exists_", "description": "查找拥有<字段名>的日志原文", "syntax": "_exists_=<字段名>", "example": "_exists_=fieldName" }
]

const [query, setQuery] = React.useState<string>('')

const handleChange = React.useCallback((value: string) => {
  // 输入改变回调
  setQuery(value)
}, [])

const onQueryEnter = React.useCallback((value: string) => {
  // 回车搜索回调
  setQuery(value)
}, [])

ReactDOM.render(
  <div style={ { padding: 24 } }>
    {/* QueryInput 即带有语法提示的文本框 */}
    <QueryInput 
      value={query}
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
| defaultValue    | 可选     | string                  | 默认输入框中的字符串                               |
| loading         | 可选     | boolean                 | 输入框目前是否处于正在加载数据的状态               |
| onQueryEnter    | 可选     | () => void              | 回车按下事件, 按下Enter时触发                      |
| onQueryChange   | 可选     | (query: string) => void | 输入框内容变化事件, 选择推荐条目或键入字符均会触发 |