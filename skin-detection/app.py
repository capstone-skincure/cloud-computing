from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image

# Load model
model = tf.keras.models.load_model('model.h5')

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    # Check if file is in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    try:
        # Process image
        img = Image.open(file).resize((224, 224))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)

        # Make prediction
        predictions = model.predict(img_array)
        predicted_class = np.argmax(predictions[0])

        return jsonify({'predicted_class': int(predicted_class)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
