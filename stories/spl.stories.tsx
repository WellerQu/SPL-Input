import React, { ComponentProps, useState, useCallback, useEffect } from 'react';
import { Story } from '@storybook/react';

import { getSuggestions } from '../spl-parser/src'

import 'antd/dist/antd.css'

import { QueryInput } from '../src/index';
import '../src/index.css'

//👇 This default export determines where your story goes in the story list
export default {
  title: 'spl',
  component: QueryInput,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<ComponentProps<typeof QueryInput>> = () => {

  const [query, setQuery] = useState<string>('')
  const [suggestionList, setSuggestionList] = useState<SuggestionItem[]>([])
  const [error, setError] = useState<string>()

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    const [suggestionList, error] = getSuggestions(value)
    setSuggestionList(suggestionList)
    setError(undefined)
    error ? setError(`非预期的字符${error}`) : setError(undefined)
  }, [])

  useEffect(() => {
    const [suggestionList] = getSuggestions('')
    setSuggestionList(suggestionList)
  }, [])

  const onQueryEnter = useCallback((value: string) => {
    // 回车查询事件
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