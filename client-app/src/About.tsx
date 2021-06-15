import React from 'react';
import { Helmet } from 'react-helmet';

import './About.css';

export const About: React.FC = () => {
  return (
    <div className="About">
      <Helmet title="About" />
      <img src="twitch-die.png" alt="A die with the Kappa, LUL, and Kreygasm emotes on its three visible faces." />
      <p>
        This site is a visual representation of a hash-based (SHA-256) deterministic random bit
        generator—or DRBG. The source of entropy is the time between messages on the current most
        popular Twitch streamers' chats.
      </p>
      <p>
        While the algorithm used adheres to <a href="https://www.nist.gov/">NIST</a> specifications
        for cryptographically-secure DRBGs, the entropy source has not been vetted as truly random,
        and is also completely public, thus open to manipulation. Please do <b>not</b> use the
        generated numbers by this DRBG for cryptographic purposes.
      </p>
      <p>
        The DRBG was written using <code>Node.js</code> and <code>TypeScript</code>. This site was
        created using <code>React</code>. A more detailed walkthrough of the entire creation process
        can be found on my <a href="https://www.zaljubouri.com/">website</a>.
      </p>
      <p>Feel free to contact me there with any comments, suggestions, questions, or bugs.</p>
    </div>
  );
};
