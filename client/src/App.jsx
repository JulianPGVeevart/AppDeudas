import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/app_users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>User List</h1>
      {users.map(user => (
        <p key={user.Id}>{user.email}</p>
      ))}
    </div>
  );
}

export default App;