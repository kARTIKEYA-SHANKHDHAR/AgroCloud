FROM public.ecr.aws/lambda/python:3.9

# 1. Copy requirements and install
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# 2. Copy the Pure AWS Flask application
COPY app.py ${LAMBDA_TASK_ROOT}

# 3. Copy the ML model
COPY irrigation_model.pkl ${LAMBDA_TASK_ROOT}

# 4. Copy everything else in the backend folder (excluding sensitive keys)
COPY . ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler function inside app.py
CMD [ "app.handler" ]
