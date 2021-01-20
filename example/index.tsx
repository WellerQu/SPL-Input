import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { QueryInput, FieldValueType } from '../.';

const options = [
  {
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
  }
]

const App = () => {
  const [input, setInput] = React.useState('')

  const handleQueryNew = React.useCallback(() => {
    console.log(`查询语句: ${input}`)
  }, [input])

  const handleQueryChange = React.useCallback((query) => {
    setInput(query)
  }, [])

  return (
    <div style={ { padding: 24 } }>
      <QueryInput 
        fieldOptionItems={ options } 
        value={ input }
        onQueryEnter={ handleQueryNew }
        onQueryChange={ handleQueryChange }
         />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
