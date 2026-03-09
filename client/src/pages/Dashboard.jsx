import { useNavigate } from 'react-router-dom';
import { logout } from '../api';

export default function Dashboard({ username, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {username}!</h2>
      <p>You are logged in to TrikeSecure.</p>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
}
