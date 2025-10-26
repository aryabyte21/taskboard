Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  # RUBY LEARNING: Rails Routing
  # Routes define how URLs map to controller actions
  # resources :tasks creates RESTful routes:
  #   GET    /tasks           => tasks#index    (list all)
  #   GET    /tasks/:id       => tasks#show     (show one)
  #   POST   /tasks           => tasks#create   (create new)
  #   PATCH  /tasks/:id       => tasks#update   (update)
  #   DELETE /tasks/:id       => tasks#destroy  (delete)

  resources :tasks, only: [:index, :show, :create, :update, :destroy]

  # AI Suggestions endpoint
  # RUBY LEARNING: Direct route to AI suggestions controller
  post 'ai_suggestions/tasks/suggest_tasks', to: 'ai_suggestions#suggest_tasks'
end
