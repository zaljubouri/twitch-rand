import React from 'react';
import PropTypes from 'prop-types';

import './RandomNumberOutput.css';

export const RandomNumberOutput: React.FC<RandomNumberOutputProps> = ({
  currentNumber,
}: RandomNumberOutputProps) => {
  return (
    <>
      <div className="Container-header Random-number-title">Output</div>
      <div className="Random-number-output">
        <div>{currentNumber}</div>
      </div>
    </>
  );
};

const propTypes = {
  currentNumber: PropTypes.string.isRequired,
};
RandomNumberOutput.propTypes = propTypes;

export type RandomNumberOutputProps = PropTypes.InferProps<typeof propTypes>;
