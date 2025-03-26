# Stage 1: Build React app
FROM node:18 AS build
WORKDIR /app

# Copy package files
COPY CSS_Assg/frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY CSS_Assg/frontend/ .

# Build React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy Nginx config
COPY CSS_Assg/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build files
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
