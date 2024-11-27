import tensorflow as tf
from tensorflow.keras.applications.vgg16 import preprocess_input
from PIL import Image
import numpy as np

def load_model():
    return tf.keras.models.load_model('best_model.keras')

def predict_image(image_file, model):
    image = Image.open(image_file).resize((224, 224))
    image_array = np.expand_dims(np.array(image), axis=0)
    image_array = preprocess_input(image_array)

    predictions = model.predict(image_array)
    class_idx = np.argmax(predictions)
    confidence = predictions[0][class_idx]

    return {"class": class_idx, "confidence": float(confidence)}