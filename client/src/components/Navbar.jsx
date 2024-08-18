import React, { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GiAbstract049 } from "react-icons/gi";
import { FaBars, FaTimes } from "react-icons/fa";
import { UserContext } from './UserContext';

const Navbar = () => {
  const [click, setClick] = useState(false);
  const { userData, spotifyConnected } = useContext(UserContext);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => {
    setClick(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav className="bg-gray-900 h-20 flex justify-center items-center sticky top-0 z-50">
      <div className="flex justify-between h-20 w-full max-w-7xl mx-auto px-4">
        <Link to="/" className="text-white text-2xl flex items-center" onClick={closeMobileMenu}>
          <GiAbstract049 className="mr-2" />
          Hackworth
        </Link>
        <div className="text-white text-2xl cursor-pointer md:hidden" onClick={handleClick}>
          {click ? <FaTimes /> : <FaBars />}
        </div>
        <ul className={`flex md:flex ${click ? "flex-col bg-gray-900 absolute top-20 left-0 w-full" : "hidden md:flex"} md:items-center`}>
          <li className="h-20 border-b-2 border-transparent md:hover:border-blue-400">
            <NavLink
              to="/Home"
              className={({ isActive }) => "text-white flex items-center py-2 px-4 h-full" + (isActive ? " text-blue-400" : '')}
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>
          </li>
          <li className="h-20 border-b-2 border-transparent md:hover:border-blue-400">
            <NavLink
              to="/"
              className={({ isActive }) => "text-white flex items-center py-2 px-4 h-full" + (isActive ? " text-blue-400" : '')}
              onClick={closeMobileMenu}
            >
              Login
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar
