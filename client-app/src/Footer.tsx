import React, { useState } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { VscGithub } from 'react-icons/vsc';

import './Footer.css';

export const Footer: React.FC = () => {
  const [showFilledIcon, setShowFilledIcon] = useState(true);
  return (
    <div className="Footer">
      <div>
        Created by <a href="https://www.zaljubouri.com/">zaljubouri</a>
      </div>
      •
      <a
        href="https://www.github.com/zaljubouri/twitch-rand"
        className="Github"
        onMouseEnter={() => setShowFilledIcon(false)}
        onMouseLeave={() => setShowFilledIcon(true)}
      >
        {showFilledIcon ? <AiFillGithub size={32} /> : <VscGithub size={32} />}
      </a>
    </div>
  );
};
