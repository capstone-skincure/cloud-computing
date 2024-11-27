from flask import Blueprint, request, jsonify
from .model import load_model, predict_image
from .database import save_result

api_blueprint = Blueprint('api', __name__)
model = load_model()

@api_blueprint.route('/predict', methods=['POST'])
def predict():
    try:
        image = request.files['image']
        prediction = predict_image(image, model)

        save_result(prediction)

        return jsonify({"prediction": prediction}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500