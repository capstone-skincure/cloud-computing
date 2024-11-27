from google.cloud import firestore
import datetime

db = firestore.Client()

def save_result(prediction):
    data = {
        "prediction": prediction,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    db.collection('AnalysisResults').add(data)