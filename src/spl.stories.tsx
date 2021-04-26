import React, { ComponentProps, useEffect } from 'react';
import { Story } from '@storybook/react';

import 'antd/dist/antd.css'

import { DistinctField } from './hooks/useSyntaxSuggestions'
import {
  useSyntaxSuggestions
} from './hooks/useSyntaxSuggestions';

import { QueryInput, FieldValueType } from './index';
import './index.css'

const fields: DistinctField[] = [{
  name: 'application',
  valueType: FieldValueType.str,
  status: true,
}, {
  name: 'service',
  valueType: FieldValueType.str,
  status: true,
}, {
  name: 'host',
  valueType: FieldValueType.str,
  status: true,
}, {
  name: 'level',
  valueType: FieldValueType.num,
  status: true,
}]

//👇 This default export determines where your story goes in the story list
export default {
  title: 'spl',
  component: QueryInput,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<ComponentProps<typeof QueryInput>> = (args) => {

  const [query, setQuery] = React.useState<string>('')

  // 用户输入语法分析，返回提示
  const [suggestionList] = useSyntaxSuggestions(
    query,
    fields
  );

  const handleChange = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    // 用户输入spl
    const query = e.currentTarget.value
    setQuery(query)
  }, [])

  const onQueryEnter = React.useCallback((spl: string) => {
    // 回车搜索
  }, [])

  return <QueryInput
    placeholder="按Tab键获得查询语法提示, 按Enter键开始查询"
    defaultValue={query}
    onInput={handleChange}
    onQueryEnter={onQueryEnter}
    suggestionItems={suggestionList}
  />
}

export const FirstStory = Template.bind({});
FirstStory.args = {
  /*👇 The args you need here will depend on your component */
};