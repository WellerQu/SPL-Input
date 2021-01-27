import * as React from 'react'
import * as ReactDOM from 'react-dom'

import 'antd/dist/antd.css'

import { FieldValueType, QueryInput } from '../.'
import { DistinctField } from '../dist/hooks/useSyntaxSuggestions'

import '../src/index.css'

const fields: DistinctField[] = [{
  name: 'application',
  valueType: FieldValueType.str,
  status: false
}, {
  name: 'service',
  valueType: FieldValueType.str,
  status: false
}, {
  name: 'host',
  valueType: FieldValueType.str,
  status: false
}, {
  name: 'level',
  valueType: FieldValueType.num,
  status: false
}]

ReactDOM.render(
  <div style={ { padding: 24 } }>
    <QueryInput fieldOptionItems={fields} />
  </div>,
  document.getElementById('root'),
)