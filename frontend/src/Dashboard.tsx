import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const getProfile = async () => {
    try {
      const res = await fetch(
        'http://localhost:3000/auth/profile',
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        setUser(data.user);
      } else {
        alert(data.message || 'Please login first');
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
      alert('Server error');
      navigate('/login');
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(
        'http://localhost:3000/auth/logout',
        {
          method: 'POST',
          credentials: 'include',}
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message || 'Logout failed');
      }
    } catch (error) {
      console.log(error);
      alert('Logout failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Dashboard</h2>

        {!user ? (
          <p>Loading...</p>
        ) : (
          <>
            <p>Welcome, {user.name}</p>
            <p>Email: {user.email}</p>
          </>
        )}

        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f5f5f5',
  },
  card: {
    width: '350px',
    padding: '30px',
    background: 'white',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  button: {
    padding: '12px 20px',
    background: 'red',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Dashboard;