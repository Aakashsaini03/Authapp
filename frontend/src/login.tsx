import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(user),
    });

    const data = await res.json();

    if (res.ok) {
      navigate('/dashboard');
    } else {
      alert(data.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={user.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={user.password}
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Login
        </button>

        <p>
          Do not have an account? <Link to="/signup">Signup</Link>
        </p>
      </form>
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
  form: {
    width: '350px',
    padding: '30px',
    background: 'white',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    background: 'black',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Login;