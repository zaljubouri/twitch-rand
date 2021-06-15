import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import './AppHeader.css';

export const AppHeader: React.FC = () => {
  return (
    <header className="App-header">
      <div className="Title">
        <Link to="/" className="Nav">
          twitch-rand
        </Link>
      </div>
      <div className="Navbar">
        <NavLink exact to="/" className="Nav" activeClassName="Active">
          Home
        </NavLink>
        <NavLink to="/rng" className="Nav" activeClassName="Active">
          Number Generator
        </NavLink>
        <NavLink to="/about" className="Nav" activeClassName="Active">
          About
        </NavLink>
      </div>
    </header>
  );
};
