import React from 'react';
import PropTypes from 'prop-types';
import { BsInfoCircle } from 'react-icons/bs';
import ReactTooltip from 'react-tooltip';

import './InfoTooltip.css';

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  tooltipKey,
  tooltipText,
}: InfoTooltipProps) => {
  return (
    <>
      <BsInfoCircle size="16px" data-for={tooltipKey} data-tip />
      <ReactTooltip id={tooltipKey} type="info" effect="solid">
        <span className="Tooltip">{tooltipText}</span>
      </ReactTooltip>
    </>
  );
};

const propTypes = {
  tooltipKey: PropTypes.string.isRequired,
  tooltipText: PropTypes.element.isRequired,
};
InfoTooltip.propTypes = propTypes;

type InfoTooltipProps = PropTypes.InferProps<typeof propTypes>;
