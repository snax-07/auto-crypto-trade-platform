FROM python:3.10

WORKDIR /app

# Install system dependencies needed to build grpcio + numpy/pandas
RUN apt-get update && apt-get install -y \
build-essential \
python3-dev \
git \
libssl-dev \
libprotobuf-dev \
pkg-config \
&& rm -rf /var/lib/apt/lists/*

# Upgrade pip to avoid old resolver issues
RUN pip install --upgrade pip

RUN pip install --no-cache-dir \
grpcio \
grpcio-tools \
python-dotenv \
pandas \
numpy \
python-binance \
requests \
vectorbt \
pymongo \
binance-connector




COPY . .
ENTRYPOINT ["python", "-u" , "main.py"]
