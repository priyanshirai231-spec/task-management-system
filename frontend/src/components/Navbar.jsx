import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onOpenCreateModal }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <h2>TaskFlow Pro</h2>
      </div>
      <div className="navbar-user">
        {user ? (
          <>
            <span className="user-greeting">Welcome, <strong>{user.name}</strong></span>
            <button className="btn btn-primary" onClick={onOpenCreateModal}>+ New Task</button>
            <button className="btn btn-secondary" onClick={logout}>Logout</button>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;