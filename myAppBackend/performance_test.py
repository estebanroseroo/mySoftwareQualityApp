from locust import HttpUser, task, between

class MyAppUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def test_user_input(self):
        self.client.post("/api/myApp/user-input-collection", json={
            "name": "Test User",
            "age": 25,
            "sex": "male",
            "symptoms": ["fever", "cough"]
        })

    @task
    def test_data_analysis(self):
        self.client.post("/api/myApp/data-analysis", json={
            "symptoms": ["fever", "cough"]
        })

    @task
    def test_recommendations(self):
        self.client.post("/api/myApp/risk-based-recommendations", json={
            "conditionId": "67d374671fb82033ac52d2af",
            "symptoms": ["fever", "cough"]
        })