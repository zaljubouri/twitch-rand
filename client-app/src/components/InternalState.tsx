import React from 'react';
import PropTypes from 'prop-types';

import './InternalState.css';
import { DistortText } from './DistortText';
import { InfoTooltip } from './InfoTooltip';

export const InternalState: React.FC<InternalStateProps> = ({
  currentInternalState,
}: InternalStateProps) => {
  if (currentInternalState.state === 'SEEDED')
    return (
      <>
        <div className="Container-header">
          Internal state{' '}
          <InfoTooltip
            tooltipKey="internalState"
            tooltipText={
              <>
                The internal state of the RNG uses the entropy from the
                <br />
                pools to seed the value and constant, which can then
                <br />
                be used to generate random numbers up to 2^19 bits long.
              </>
            }
          />
        </div>
        <div className="Internal-state-info">
          <div className="value">
            <div className="header">Value</div>
            <div className="value-value">{currentInternalState.value}</div>
          </div>
          <br />
          <div className="constant">
            <div className="header">Constant</div>
            <div className="constant-value">{currentInternalState.constant}</div>
          </div>
        </div>
        <div className="Internal-state-counter">
          <div className="reseed">
            <div className="header">Reseed counter</div>
            <div className="reseed-value">{currentInternalState.reseedCounter}</div>
          </div>
          <div className="generated">
            <div className="generated-header header">Numbers generated since last reseed</div>
            <div className="generated-value">{currentInternalState.shouldReseedCounter}</div>
          </div>
        </div>
      </>
    );
  else
    return (
      <div className="Waiting">
        Waiting for <DistortText textToDistort="entropy" />
      </div>
    );
};

const propTypes = {
  currentInternalState: PropTypes.any.isRequired,
};
InternalState.propTypes = propTypes;

export type InternalStateProps = PropTypes.InferProps<typeof propTypes>;
