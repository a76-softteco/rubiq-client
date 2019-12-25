import React from 'react';
import { setFile } from './actions'
import './fileInput.css';

export function FileInput({dispatch, name, error}) {
    const onChange = event => dispatch({type: setFile, name, data: event.target.files[0]});

    return (
        <>
            <input type="file" onChange={onChange} />
            {error && <span className="error">Select File</span>}
        </>
    );
}