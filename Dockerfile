# Stage 1: Use an official Nginx image as the base
# Nginx is a high-performance web server perfect for serving static files.
FROM nginx:alpine

# Copy all the application files (HTML, CSS, JS, etc.) from your project
# into the default directory Nginx uses to serve web content
COPY . /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tell Docker that the container will listen on port 80 at runtime.
# This is the default port for Nginx.
EXPOSE 80