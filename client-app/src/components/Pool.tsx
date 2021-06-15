import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const Pool: React.FC<PoolProps> = ({ id, controls }: PoolProps) => {
  return (
    <>
      <svg className="Pool" xmlns="http://www.w3.org/2000/svg" width="40" height="52">
        <motion.rect
          id="water"
          x="0"
          y="0"
          width="35"
          height="0"
          transform="translate(2.5 4) rotate(180 17.5 22)"
          fill="rgba(0, 170, 255, 0.67)"
          animate={controls}
        ></motion.rect>
        <path
          id="container"
          d="M 2.5 2 L 2.5 50 L 37.5 50 L 37.5 2"
          fill="transparent"
          strokeWidth="4"
          stroke="#AAA"
          strokeLinejoin="round"
        ></path>
        <text
          id="poolId"
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255, 255, 255, 0.9)"
        >
          {id}
        </text>
      </svg>
    </>
  );
};

const propTypes = {
  id: PropTypes.number.isRequired,
  controls: PropTypes.object.isRequired,
};
Pool.propTypes = propTypes;

export type PoolProps = PropTypes.InferProps<typeof propTypes>;
