FROM python:latest

WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn[standard] dotenv kubernetes

COPY . . 
EXPOSE 8000

ENTRYPOINT [ "uvicorn" , "main:app" , "--host" , "0.0.0.0" , "--port" , "8000" ]
