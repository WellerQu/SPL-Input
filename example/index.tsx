import * as React from 'react'
import * as ReactDOM from 'react-dom'

import 'antd/dist/antd.css'

import { FieldValueType, QueryInput } from '../.'
import { DistinctField } from '../dist/hooks/useSyntaxSuggestions'

import '../src/index.css'

const fields: DistinctField[] = [{
  name: 'application',
  valueType: FieldValueType.str,
}, {
  name: 'service',
  valueType: FieldValueType.str,
}, {
  name: 'host',
  valueType: FieldValueType.str,
}, {
  name: 'level',
  valueType: FieldValueType.num,
}, {
  name: 'code1234567890123456789012345678901234567890123456',
  valueType: FieldValueType.str,
}]

ReactDOM.render(
  <div style={ { padding: 24 } }>
    <QueryInput fieldOptionItems={fields} />
  </div>,
  document.getElementById('root'),
)