import React, { useReducer } from 'react';
import { setFile } from './actions';
import { FileInput } from './FileInput';
import axios from 'axios';
import './reservation.css';

const isEmpty = 'isEmpty';
const setErrors = 'setErrors';
const setResult = 'setResult';

const meta = {
    reservation: 'Reservation',
    flight: 'Flight'
};

const names = Object.keys(meta);

const initialState = {
    files: {},
    errors: {}
};

function reducer({files, errors, result}, action) {
    switch (action.type) {
        case setFile: 
            return {
                files: {
                    ...files,
                    [action.name]: action.data
                },
                errors: {
                    ...errors,
                    [action.name]: undefined
                },
                result
            };

        case setErrors: 
            return {
                files,
                errors: action.errors,
                result
            };

        case setResult: 
            return {
                files,
                errors: {},
                result: action.result
            };
        
        default: 
            throw new Error('Invalid action');
    }
}

const appendFile = (data, errors, files, name) => {
    const file = files[name];

    if (file) {
        data.append('file', file, name);
    } else {
        errors[name] = isEmpty;
    }
};

const formatReservation = (id, {resolution}) => <span>{id}&#8594;{resolution[id] ? resolution[id].map((item, index) => <React.Fragment key={item}>{index > 0 && <>&#8594;</>}{item}</React.Fragment>) : 'N/A'}</span>;

export function Reservation() {
    const [{files, errors, result}, dispatch] = useReducer(reducer, initialState);

    const upload = async () => {
        const data = new FormData();
        const errors = {};

        names.forEach(name => appendFile(data, errors, files, name));
        const isValid = Object.keys(errors).length === 0;

        if (isValid) {
            try {
                const {data: result} = await axios.post('http://localhost:8000/resolve-reservation', data);
                dispatch({type: setResult, result});
            } catch (error) {
                errors.server = error.message;
            }
        }

        dispatch({type: setErrors, errors});
    };

    return (
        <>
            <form>
                {names.map(name => (
                    <label key={name}>
                        {meta[name]}:
                        <FileInput name={name} error={errors[name]} dispatch={dispatch}></FileInput>
                    </label>
                ))}
                {errors.server && <div className="error">{errors.server}</div>}
                <button type="button" onClick={upload}>Resolve</button>
            </form>
            {result && (
                <>
                    <h2>Resolution</h2>
                    <ul>
                        {Object.keys(result.resolution).map(id => <li key={id}>{formatReservation(id, result)}</li>)}
                    </ul>
                    <h2>Flights capacity</h2>
                    <ul>
                        {result.flights.map(({id, capacity}) => <li>{id}:{capacity}</li>)}
                    </ul>
                </>
            )}
        </>
    );
}