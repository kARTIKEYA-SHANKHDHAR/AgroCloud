FROM public.ecr.aws/lambda/python:3.9

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies - including the ML libraries needed
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask application
COPY app.py ${LAMBDA_TASK_ROOT}

# Copy the ML model and Firebase service account key
COPY irrigation_model.pkl ${LAMBDA_TASK_ROOT}
COPY firebase-key.json ${LAMBDA_TASK_ROOT}

# Copy the data / model directories if needed
# We copy everything in the backend folder that might be relevant
COPY . ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler function inside app.py
CMD [ "app.handler" ]
