# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

# RUBY LEARNING: This configuration allows our React frontend to communicate with our Rails backend
# CORS (Cross-Origin Resource Sharing) is necessary when frontend and backend are on different ports/domains
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In development, we allow requests from localhost:5173 (Vite's default port)
    # In production, you would specify your actual frontend domain
    origins "localhost:5173", "127.0.0.1:5173"

    # Allow all routes (*), all headers, and common HTTP methods
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
