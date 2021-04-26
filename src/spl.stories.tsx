/// <reference types="../typings/spl" />

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react';

import 'antd/dist/antd.css'

import { QueryInput } from './index';
import './index.css'

//👇 This default export determines where your story goes in the story list
export default {
  title: 'spl',
  component: QueryInput,
};

// 用户输入语法分析，返回提示
const suggestionList: SuggestionItem[] = [
  { "label": "可选字段", "tag": "字段", "mapping": "fieldName", "code": "" },
  { "label": "否定", "tag": "逻辑", "mapping": "not", "code": "NOT", "description": "查询条件的逻辑否定修饰符, 条件的逆命题", "syntax": "NOT <条件>", "example": "NOT host" },
  { "label": "_exists_", "tag": "关键词", "mapping": "_exists_", "code": "_exists_", "description": "查找拥有<字段名>的日志原文", "syntax": "_exists_=<字段名>", "example": "_exists_=fieldName" }
]

//👇 We create a “template” of how args map to rendering
const Template: Story<ComponentProps<typeof QueryInput>> = () => {

  const [query, setQuery] = React.useState<string>('')

  const handleChange = React.useCallback((value: string) => {
    setQuery(value)
  }, [])

  const onQueryEnter = React.useCallback((value: string) => {
    // 回车搜索
    setQuery(value)
  }, [])

  return <QueryInput
    placeholder="按Enter键选中语法提示选项"
    value={query}
    onQueryChange={handleChange}
    onQueryEnter={onQueryEnter}
    suggestionItems={suggestionList}
  />
}

export const FirstStory = Template.bind({});
FirstStory.args = {
  /*👇 The args you need here will depend on your component */
};