# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY requirement.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirement.txt

# Copy the entire backend code
COPY . .

# Environment variables (e.g., MongoDB Atlas connection)
#ENV MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/my-db?retryWrites=true&w=majority
#ENV APP_ENV=production

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
