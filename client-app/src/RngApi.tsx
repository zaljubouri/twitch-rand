import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

import './RngApi.css';

export const RngApi: React.FC = () => {
  const [rng, setRng] = useState({ value: -1, error: '' });
  const [randomFormValues, setRandomFormValues] = useState({
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
  });

  const buildApiUrl = () => {
    let url = `/random?bits=53&min=${randomFormValues.min}&max=${randomFormValues.max}`;
    const host = process.env.REACT_APP_API_HOST;
    const port = process.env.REACT_APP_API_PORT;

    if (host) return `http://${host}:${port}${url}`;
    else return url;
  };

  const onSubmitHandler = (event: any) => {
    event.preventDefault();
    fetch(buildApiUrl())
      .then((response) => response.json())
      .then((data) => {
        if (data) setRng({ value: data, error: '' });
        else setRng({ ...rng, error: 'RNG has not seeded yet.' });
      })
      .catch(console.error);
  };

  const onChangeHandler = (event: any) => {
    let formName = event.target.name;
    let formValue = event.target.value;

    try {
      formValue = Number(formValue);
    } catch (err) {
      console.log(err);
    }

    setRandomFormValues({ ...randomFormValues, [formName]: formValue });
  };

  console.log();

  return (
    <>
      <Helmet title="RNG" />
      <form onSubmit={onSubmitHandler} className="Rng-form">
        <div className="Form-inputs">
          <div className="Form-input">
            <label htmlFor="min">Min number</label>
            <input
              type="number"
              name="min"
              min={0}
              max={randomFormValues.max - 1}
              onChange={onChangeHandler}
              value={randomFormValues.min}
              autoComplete="true"
            />
          </div>
          –
          <div className="Form-input">
            <label htmlFor="max">Max number</label>
            <input
              type="number"
              name="max"
              min={randomFormValues.min + 1}
              max={Number.MAX_SAFE_INTEGER}
              onChange={onChangeHandler}
              value={randomFormValues.max}
              autoComplete="true"
            />
          </div>
        </div>
        <input type="submit" value="Generate random number" className="Form-submit" />
      </form>
      <div className="Generated-number">{rng.error ? rng.error : rng.value}</div>
    </>
  );
};
