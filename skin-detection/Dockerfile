# Gunakan base image Python slim
FROM python:3.9-slim

# Set working directory di container
WORKDIR /app

# Salin semua file ke container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Jalankan aplikasi
CMD ["python", "app.py"]
