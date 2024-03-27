import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function SelectLabels({ name, values, selectedComponent, setSelectedComponent }) {

  const handleChange = (event, newValue) => {
    setSelectedComponent(newValue);
  };

  return (
    <div>
      <Autocomplete
        style={{ width: '500px' }}
        value={selectedComponent}
        onChange={handleChange}
        options={values}
        autoHighlight
        renderInput={(params) => (
          <TextField
            {...params}
            label={name}
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ ...params.InputProps, style: { color: 'white', border: '2px solid #000000' } }}
          />
        )}
      />
    </div>
  );
}
