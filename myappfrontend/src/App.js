import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [users, setUsers] = useState([]);

    const [user, setUser] = useState({
        name: '',
        age: '',
        sex: '',
        symptoms: []
    });

    useEffect(() => {
        axios.get('http://localhost:5000/api/myApp/user-input-collection')
            .then(response => setUsers(response.data))
            .catch(error => console.log(error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value
        });
    };

    const handleUserInputSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/myApp/user-input-collection', user)
            .then(response => {
                alert('User input submitted!');
                setUsers([...users, response.data]);
                setUser({
                    name: '',
                    age: '',
                    sex: '',
                    symptoms: []
                });
            })
            .catch(error => console.log(error));
    };

    return (
        <div>
            <h1>User Input Collection</h1>
            <form onSubmit={handleUserInputSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={user.name}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={user.age}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="sex"
                    placeholder="Sex"
                    value={user.sex}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="symptoms"
                    placeholder="Symptoms (comma separated)"
                    value={user.symptoms.join(', ')}
                    onChange={(e) => setUser({ ...user, symptoms: e.target.value.split(',') })}
                />
                <button type="submit">Submit</button>
            </form>

            <h2>Submitted User Inputs</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>{user.name} - {user.age} - {user.sex} - Symptoms: {user.symptoms.join(', ')}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;
