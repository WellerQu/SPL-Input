import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react';

import 'antd/dist/antd.css'

import { DistinctField } from './hooks/useSyntaxSuggestions'


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
  const handleChange = React.useCallback((value: string) => {
    // setQuery(value)
  }, [])

  return <QueryInput fieldOptionItems={fields} value={query} onQueryChange={handleChange} />
}

export const FirstStory = Template.bind({});
FirstStory.args = {
  /*👇 The args you need here will depend on your component */
};