import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => setUsers(response.data))
            .catch(error => console.log(error));
    }, []);

    return (
        <div>
            <h1>User List</h1>
            <ul>
                {users.map(user => (
                    <li key={user._id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;
