import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {

    // VARIABLES
    const [users, setUsers] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [risk, setRiskLevel] = useState('');
    const [user, setUser] = useState({
        name: '',
        age: '',
        sex: '',
        symptoms: []
    });
    const [feedback, setFeedback] = useState({
        helpful: '',
        comment: ''
    });
    const [selectedUser, setSelectedUser] = useState({
        name: '',
        age: '',
        sex: '',
        symptoms: []
    });
    const [selectedCondition, setSelectedCondition] = useState({
        conditionId: '',
        age: '',
        sex: '',
        symptoms: []
    });
   
    // FUNCTIONS
    // USER INPUT COLLECTION
    useEffect(() => {
        axios.get('http://localhost:5000/api/myApp/user-input-collection')
            .then(response => setUsers(response.data))
            .catch(error => console.log(error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const lettersOnly = /^[A-Za-z\s]*$/;
            if (!lettersOnly.test(value)) return;
        }
        setUser({
            ...user,
            [name]: value
        });
    };

    const handleUserInputSubmit = (e) => {
        e.preventDefault();
        const validSymptomInput = /^[A-Za-z,\s]*$/;
        if (!user.name || !user.age || !user.sex || user.symptoms.length === 0) {
            alert('Please fill all the information before submitting.');
            return;
        }
        if (!validSymptomInput.test(user.symptoms)) {
            alert("Please enter only letters and commas for the symptoms.");
            return;
        }
        const symptomsArray = user.symptoms
        .split(/\s*,\s*/)
        .map(symptom => symptom.trim())
        .filter(Boolean);
        if (symptomsArray.length === 0) {
            alert("Please enter at least one valid symptom.");
            return;
        }
        const duplicateExists = users.some(u =>
            u.name.trim().toLowerCase() === user.name.trim().toLowerCase() &&
            u.symptoms.length === symptomsArray.length &&
            u.symptoms.every(symptom => symptomsArray.includes(symptom.toLowerCase()))
        );
        if (duplicateExists) {
            alert("Please enter a different name and symptoms. This user already exists.");
            return;
        }
        const finalUser = {
            ...user,
            symptoms: symptomsArray
        };
        axios.post('http://localhost:5000/api/myApp/user-input-collection', finalUser)
            .then(response => {
                alert('User input submitted!');
                setUsers([...users, response.data]);
                setUser({
                    name: '',
                    age: '',
                    sex: '',
                    symptoms: []
                });
                setConditions([]);
                setRecommendations([]);
                setClinics([]);
                setRiskLevel(''); 
                setSelectedUser({id: '', name: '', age: '', sex: '', symptoms: [] });
                setSelectedCondition({ conditionId: '', age: '', sex: '', symptoms: [] });
                setFeedback({ helpful: '', comment: '' });
            })
            .catch(error => console.log(error));
    };

    // DATA ANALYSIS
    const handleSelectUser = (selectedUser) => {
        setSelectedUser({
            id: selectedUser._id,
            name: selectedUser.name,
            age: selectedUser.age,
            sex: selectedUser.sex,
            symptoms: selectedUser.symptoms
        });
    };

    const handleDeleteUser = (userId) => {
        axios.delete(`http://localhost:5000/api/myApp/user-input-collection/${userId}`)
            .then(() => {
                setUsers(users.filter(u => u._id !== userId));
                alert("User deleted!");
                setConditions([]);
                setRecommendations([]);
                setClinics([]);
                setRiskLevel(''); 
                setSelectedUser({id: '', name: '', age: '', sex: '', symptoms: [] });
                setSelectedCondition({ conditionId: '', age: '', sex: '', symptoms: [] });
                setFeedback({ helpful: '', comment: '' });
            })
            .catch(error => {
                console.log(error);
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
                setRecommendations([]);
                setClinics([]);
                setRiskLevel(''); 
                setSelectedCondition({ conditionId: '', age: '', sex: '', symptoms: [] });
                setFeedback({ helpful: '', comment: '' });
            } else {
                setConditions([]);
                setRecommendations([]);
                setClinics([]);
                setRiskLevel(''); 
                setSelectedCondition({ conditionId: '', age: '', sex: '', symptoms: [] });
            }
        })
        .catch(error => {
            setConditions([]);
            setRecommendations([]);
            setClinics([]);
            setRiskLevel(''); 
            setSelectedCondition({ conditionId: '', age: '', sex: '', symptoms: [] });
            console.log(error);
            alert("No conditions found for the provided symptoms. Please visit the nearest clinic.");
        });
    };

    const handleSelectCondition = (selectedCondition) => {
        setSelectedCondition({
            id: selectedCondition._id,
            name: selectedCondition.name,
            symptoms: selectedCondition.symptoms
        });
    };

    // RISK BASED RECOMMENDATIONS
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

    // CONTINUOUS LEARNING
    const handleFeedbackChange = (e) => {
        const { name, value } = e.target;
        setFeedback({
            ...feedback,
            [name]: value
        });
    };
    
    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!selectedCondition.id) {
            alert("Please select a condition.");
            return;
        }
        axios.post('http://localhost:5000/api/myApp/continuous-learning', {
            conditionId: selectedCondition.id,
            userId: selectedUser.id,
            helpful: feedback.helpful,
            comment: feedback.comment
        })
        .then(response => {
            alert('Feedback submitted!');
            setFeedback({ helpful: '', comment: '' });
            setConditions([]);
            setRecommendations([]);
            setClinics([]);
            setRiskLevel(''); 
            setSelectedUser({id: '', name: '', age: '', sex: '', symptoms: [] });
            setSelectedCondition({ conditionId: '', age: '', sex: '', symptoms: [] });
        })
        .catch(error => {
            console.log(error);
        });
    };  

    // UI
    return (
        <div className="container">
            <div className="header">
                <h1 className="centered-title">SYMPTOM TRACKER</h1>
            </div>
            <div className="section">
                <h2>USER INPUT COLLECTION</h2>
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
                    <select
                        name="sex"
                        value={user.sex}
                        onChange={handleInputChange}
                    >
                        <option value="">Select sex</option>
                        <option value="Man">Man</option>
                        <option value="Woman">Woman</option>
                    </select>
                    <input
                        type="text"
                        name="symptoms"
                        placeholder="Symptoms (comma separated)"
                        value={user.symptoms}
                        onChange={handleInputChange}
                    />
                    <button type="submit" style={{ marginRight: '10px' }}>Submit</button>
                    <button type="button" onClick={
                        () =>
                        setUser({
                            name: '',
                            age: '',
                            sex: '',
                            symptoms: []
                        })
                    }>Clear</button>
                </form>
            </div>
    
            <div className="section">
                <h2>Select a user</h2>
                <ul>
                    {users.map(user => (
                        <li key={user._id}>
                            <strong>{user.name}</strong> - {user.age} - {user.sex}  
                            <br />
                            <em>Symptoms:</em> {user.symptoms.join(', ')}
                            <br />
                            <button onClick={() => handleSelectUser(user)} style={{ marginRight: '10px' }}>Select</button>
                            <button onClick={() => handleDeleteUser(user._id)} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
    
            <div className="section">
                <h2>DATA ANALYSIS</h2>
                <input type="text" name="name" value={selectedUser.name} readOnly />
                <input type="text" name="symptoms" value={selectedUser.symptoms.join(', ')} readOnly />
                <button onClick={handleDataAnalysis}>Analyze Symptoms</button>
            </div>

            <div className="section">
                <h2>Select a condition</h2>
                {conditions.length > 0 ? (
                    <ul>
                        {conditions.map(condition => (
                            <li key={condition._id}>
                                <strong>{condition.name}</strong>
                                <br />
                                <em>Symptoms:</em> {condition.symptoms.join(', ')}
                                <br />
                                <button onClick={() => handleSelectCondition(condition)}>Select</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No conditions available.</p>
                )}
            </div>
    
            <div className="section">
                <h2>RISK-BASED RECOMMENDATIONS</h2>
                <input
                    type="text"
                    name="symptoms"
                    value={selectedCondition.symptoms.join(', ')}
                    readOnly
                />
                <button onClick={handleRiskBasedRecommendations}>Get Recommendations</button>

                {recommendations.length > 0 ? (
                    <>
                        <p><strong>Risk Level:</strong> {risk}</p>
                        <ul>
                            {recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
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
    
            <div className="section">
                <h2>CONTINUOUS LEARNING</h2>
                <form onSubmit={handleFeedbackSubmit}>
                    <label>
                        Helpful:
                        <select
                            name="helpful"
                            value={feedback.helpful}
                            onChange={handleFeedbackChange}
                        >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </label>
                    <label>
                        Comment:
                        <textarea
                            name="comment"
                            value={feedback.comment}
                            onChange={handleFeedbackChange}
                        />
                    </label>
                    <button type="submit">Submit Feedback</button>
                </form>
            </div>
        </div>
    );

};

export default App;
