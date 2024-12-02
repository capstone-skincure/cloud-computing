import os
import requests
from tensorflow.keras.models import load_model
import json

# Mengambil URL model dari environment variable
model_url = os.getenv('MODEL_URL')  # Misalnya variabel environment 'MODEL_URL' berisi URL ke model .h5

if model_url is None:
    raise ValueError("Environment variable 'MODEL_URL' not set")

# Mengunduh file .h5 dari URL
response = requests.get(model_url)
model_path = 'cnn_model.h5'

# Memastikan bahwa file berhasil diunduh
if response.status_code == 200:
    with open(model_path, 'wb') as f:
        f.write(response.content)
    print(f"Model berhasil diunduh ke {model_path}")
else:
    raise Exception(f"Gagal mengunduh model. Status code: {response.status_code}")

# Memuat model .h5
model = load_model(model_path)

# Mengekspor arsitektur model ke dalam format JSON
model_json = model.to_json()

# Menyimpan arsitektur model dalam file .json
with open('model_architecture.json', 'w') as json_file:
    json_file.write(model_json)

# Menyimpan bobot model dalam file .bin
model.save_weights('model_weights.bin')

print("Model .h5 telah berhasil dikonversi menjadi .json dan bobot disimpan sebagai .bin.")
