import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export const DistortText: React.FC<DistortTextProps> = ({
  textToDistort,
  timeBetweenDistortion = 250,
}: DistortTextProps) => {
  const [distortedText, setDistortedText] = useState(textToDistort);
  const textToDistortChars = textToDistort.split('');

  useEffect(() => {
    const interval = setInterval(() => {
      let randomCharToDistort = Math.floor(Math.random() * textToDistortChars.length);
      textToDistortChars[randomCharToDistort] = String.fromCharCode(
        Math.floor(Math.random() * (127 - 32) + 32)
      );
      setDistortedText(textToDistortChars.join(''));
    }, timeBetweenDistortion!);

    return () => clearInterval(interval);
  });

  return <>{distortedText}</>;
};

const propTypes = {
  textToDistort: PropTypes.string.isRequired,
  timeBetweenDistortion: PropTypes.number,
};
DistortText.propTypes = propTypes;

export type DistortTextProps = PropTypes.InferProps<typeof propTypes>;
