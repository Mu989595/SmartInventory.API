import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { email, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            SmartInventory
          </Link>
          <nav className="header-nav">
            <Link to="/">Products</Link>
            {isAdmin && <Link to="/products/new">Add Product</Link>}
          </nav>
          <div className="header-actions">
            <span className="user-email">{email}</span>
            {isAdmin && <span className="role-badge">Admin</span>}
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
