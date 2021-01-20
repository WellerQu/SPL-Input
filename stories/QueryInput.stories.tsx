import React from 'react';
import { Meta, Story } from '@storybook/react';
import { FieldValueType, QueryInput, QueryInputProps } from '../src';

const meta: Meta = {
  title: 'QueryInput',
  component: QueryInput,
  argTypes: {
    // children: {
    //   control: {
    //     type: 'text',
    //   },
    // },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<QueryInputProps> = args => <QueryInput {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  fieldOptionItems: []
} as QueryInputProps;

export const InitialFieldOptionItems = Template.bind({});

InitialFieldOptionItems.args = {
  fieldOptionItems: [{
    name: 'application',
    valueType: FieldValueType.str,
    status: true
  }, {
    name: 'host',
    valueType: FieldValueType.str,
    status: true
  }, {
    name: 'level',
    valueType: FieldValueType.num,
    status: true
  }]
} as QueryInputProps

export const IsLoading = Template.bind({})

IsLoading.args = {
  fieldOptionItems: [],
  loading: true
} as QueryInputProps