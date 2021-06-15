import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const Arrow: React.FC<ArrowProps> = ({ id, controls }: ArrowProps) => {
  return (
    <svg className="Arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`g${id}`}>
          <motion.stop
            stopColor="#FFF"
            animate={controls}
            transition={{
              repeat: 1,
              repeatType: 'reverse',
              duration: 0.5,
            }}
            offset="0%"
          />
        </linearGradient>
      </defs>
      <motion.path
        d="M 50,0 L 50,20 L 20,50 L 50,80 L 50,100 L 0,50 Z"
        transform="translate(80,100) rotate(180)"
        stroke-width="10"
        fill={`url(#g${id}`}
      />
    </svg>
  );
};

const propTypes = {
  id: PropTypes.number.isRequired,
  controls: PropTypes.object.isRequired,
};
Arrow.propTypes = propTypes;

export type ArrowProps = PropTypes.InferProps<typeof propTypes>;
