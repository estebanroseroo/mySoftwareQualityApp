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
    const [selectedUser, setSelectedUser] = useState({
        name: '',
        age: '',
        sex: '',
        symptoms: []
    });
    const [conditions, setConditions] = useState([]);
    const [selectedCondition, setSelectedCondition] = useState({
        conditionId: '',
        age: '',
        symptoms: []
    });
    const [recommendations, setRecommendations] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [risk, setRiskLevel] = useState('');

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

    const handleSelectUser = (selectedUser) => {
        setSelectedUser({
            id: selectedUser._id,
            name: selectedUser.name,
            age: selectedUser.age,
            sex: selectedUser.sex,
            symptoms: selectedUser.symptoms
        });
    };

    const handleDataAnalysis = () => {
        if (!selectedUser.id) {
            alert("Please select a user.");
            return;
        }
        axios.post('http://localhost:5000/api/myApp/data-analysis', {
            userId: selectedUser.id,
            symptoms: selectedUser.symptoms
        })
        .then(response => {
            if (response.status === 200 && response.data.conditions.length > 0) {
                setConditions(response.data.conditions);
            } else {
                setConditions([]);
                setRecommendations([]);
                setClinics([]);
                setRiskLevel(''); 
                setSelectedCondition({ conditionId: '', age: '', symptoms: [] });
            }
        })
        .catch(error => {
            setConditions([]);
            setRecommendations([]);
            setClinics([]);
            setRiskLevel(''); 
            setSelectedCondition({ conditionId: '', age: '', symptoms: [] });
            console.log(error);
        });
    };

    const handleSelectCondition = (selectedCondition) => {
        setSelectedCondition({
            id: selectedCondition._id,
            name: selectedCondition.name,
            symptoms: selectedCondition.symptoms
        });
    };

    const handleRiskBasedRecommendations = () => {
        if (!selectedCondition.id) {
            alert("Please select a condition.");
            return;
        }
        axios.post('http://localhost:5000/api/myApp/risk-based-recommendations', {
            conditionId: selectedCondition.id,
            symptoms: selectedCondition.symptoms
        })
        .then(response => {
            if (response.status === 200 && response.data.recommendation) {
                setRecommendations(response.data.recommendation.recommendations);
                setClinics(response.data.recommendation.clinics);
                setRiskLevel(response.data.recommendation.riskLevel);
            } else {
                setRecommendations([]);
                setClinics([]);
                setRiskLevel(''); 
            }
        })
        .catch(error => {
            setRecommendations([]);
            setClinics([]);
            setRiskLevel(''); 
            console.log(error);
        });
    };

    return (
        <div>
            <h2>User Input Collection</h2>
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

            <h2>Select a User</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        {user.name} - {user.age} - {user.sex} - Symptoms: {user.symptoms.join(', ')}
                        <button onClick={() => handleSelectUser(user)}>Select</button>
                    </li>
                ))}
            </ul>

            <h2>Selected User Details</h2>
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={selectedUser.name}
                readOnly
            />
            <input
                type="text"
                name="symptoms"
                placeholder="Symptoms"
                value={selectedUser.symptoms.join(', ')}
                readOnly
            />
            <button onClick={handleDataAnalysis}>Analyze Symptoms</button>

            <h2>Data Analysis Results</h2>
            {conditions.length > 0 ? (
                <ul>
                    {conditions.map(condition => (
                        <li key={condition._id}>
                            {condition.name} - Symptoms: {condition.symptoms.join(', ')}
                            <button onClick={() => handleSelectCondition(condition)}>Select</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No conditions found.</p>
            )}

            <h2>Selected Condition Details</h2>
            <input
                type="text"
                name="symptoms"
                placeholder="Symptoms"
                value={selectedCondition.symptoms.join(', ')}
                readOnly
            />
            <button onClick={handleRiskBasedRecommendations}>Get Recommendations</button>

            <h2>Risk-based Recommendations</h2>

            {recommendations.length > 0 ? (
                <>
                    <p>Risk Level: {risk}</p>
                    <ul>
                        {recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>No recommendations available.</p>
            )}

            {clinics.length > 0 ? (
                <ul>
                    {clinics.map((clinic, index) => (
                        <li key={index}>{clinic}</li>
                    ))}
                </ul>
            ) : (
                <p>No clinics available.</p>
            )}
        </div>
    );
};

export default App;
