import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.db.session import Base
from app.main import create_app


class ApiFlowTest(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        app = create_app()

        def test_db():
            with Session(self.engine) as session:
                yield session

        app.dependency_overrides[get_db] = test_db
        self.app = app
        self.client = TestClient(app)

    def tearDown(self) -> None:
        self.client.close()
        self.app.dependency_overrides.clear()
        self.engine.dispose()

    def test_create_publish_submit_and_results(self) -> None:
        form_response = self.client.post("/api/forms", json={"title": "API smoke form"})
        self.assertEqual(form_response.status_code, 201)
        form = form_response.json()

        question_response = self.client.post(
            f"/api/forms/{form['id']}/questions",
            json={"type": "email", "title": "Your email", "is_required": True},
        )
        self.assertEqual(question_response.status_code, 201)
        question = question_response.json()

        dropdown_response = self.client.post(
            f"/api/forms/{form['id']}/questions",
            json={
                "type": "dropdown",
                "title": "Department",
                "options": [{"label": "Engineering"}, {"label": "Sales"}],
            },
        )
        self.assertEqual(dropdown_response.status_code, 201)
        dropdown = dropdown_response.json()

        number_response = self.client.post(
            f"/api/forms/{form['id']}/questions",
            json={"type": "number", "title": "Team size"},
        )
        self.assertEqual(number_response.status_code, 201)
        number_question = number_response.json()

        publish_response = self.client.post(f"/api/forms/{form['id']}/publish")
        self.assertEqual(publish_response.status_code, 200)

        submit_response = self.client.post(
            f"/api/public/forms/{form['slug']}/responses",
            json={
                "answers": [
                    {"question_id": question["id"], "text_value": "test@example.com"},
                    {"question_id": dropdown["id"], "question_option_id": dropdown["options"][0]["id"]},
                    {"question_id": number_question["id"], "number_value": 12.5},
                ],
                "completion_time_seconds": 12,
            },
        )
        self.assertEqual(submit_response.status_code, 201)

        results_response = self.client.get(f"/api/forms/{form['id']}/results")
        self.assertEqual(results_response.status_code, 200)
        results = results_response.json()
        self.assertEqual(results["response_count"], 1)
        self.assertEqual(results["recent_responses"][0]["answers"][0]["value"], "test@example.com")
        self.assertEqual(results["questions"][2]["average_number"], 12.5)

        export_response = self.client.get(f"/api/forms/{form['id']}/results/export")
        self.assertEqual(export_response.status_code, 200)
        self.assertIn("test@example.com", export_response.text)


if __name__ == "__main__":
    unittest.main()
