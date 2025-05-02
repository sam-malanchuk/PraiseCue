import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// point at your API server
// const SERVER = 'http://192.168.1.105:3001';

// const socket = io(SERVER);

// 192.168.1.105:80  
const SERVER = `${window.location.protocol}//${window.location.hostname}:3001`;
const socket = io(SERVER, { transports: ['websocket'] });

function App() {
  const [fields, setFields] = useState({
    textField:   '',
    selectField: 'option1',
    radioField:  'optionA',
    toggleField: false,
  });

  // load initial state + subscribe
  useEffect(() => {
    axios.get(`${SERVER}/api/state`)
      .then(res => setFields(f => ({ ...f, ...res.data })))
      .catch(console.error);

    socket.on('field-updated', ({ key, value }) => {
      setFields(f => ({ ...f, [key]: value }));
    });
    return () => socket.off('field-updated');
  }, []);

  // on any control change
  const update = (key, value) => {
    setFields(f => ({ ...f, [key]: value }));
    axios.post(`${SERVER}/api/state`, { key, value })
      .catch(console.error);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>PraiseCue Controller</h2>

      <div>
        <label>Text: </label>
        <input
          value={fields.textField}
          onChange={e => update('textField', e.target.value)}
        />
      </div>

      <div>
        <label>Select: </label>
        <select
          value={fields.selectField}
          onChange={e => update('selectField', e.target.value)}
        >
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="radio"
            name="radio"
            value="optionA"
            checked={fields.radioField==='optionA'}
            onChange={e => update('radioField', e.target.value)}
          /> A
        </label>
        <label style={{ marginLeft: 10 }}>
          <input
            type="radio"
            name="radio"
            value="optionB"
            checked={fields.radioField==='optionB'}
            onChange={e => update('radioField', e.target.value)}
          /> B
        </label>
      </div>

      <div>
        <label>Toggle: </label>
        <input
          type="checkbox"
          checked={fields.toggleField}
          onChange={e => update('toggleField', e.target.checked)}
        />
      </div>
    </div>
  );
}

export default App;
