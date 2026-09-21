import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, clearSession } from '../api';

export default function NavBar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <NavLink to="/" end>Board</NavLink>
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button onClick={handleLogout} className="btn-action btn-delete">Logout</button>
      </div>
    </nav>
  );
}
