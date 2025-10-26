class TasksController < ApplicationController
  before_action :set_task, only: [:show, :update, :destroy]
  
  # GET /tasks
  def index

    @tasks = Task.all.order(created_at: :desc)

    render json: @tasks, status: :ok
  end
  
  # GET /tasks/:id
  def show
    render json: @task, status: :ok
  end
  
  # POST /tasks
  def create
    @task = Task.new(task_params)
    
    if @task.save
      ActionCable.server.broadcast('tasks_channel', {
        action: 'create',
        task: @task
      })
      
      render json: @task, status: :created
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # PATCH/PUT /tasks/:id
  def update
    if @task.update(task_params)
      ActionCable.server.broadcast('tasks_channel', {
        action: 'update',
        task: @task
      })
      
      render json: @task, status: :ok
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # DELETE /tasks/:id
  def destroy
    task_id = @task.id
    
    @task.destroy
    
    ActionCable.server.broadcast('tasks_channel', {
      action: 'destroy',
      id: task_id
    })
    
    head :no_content
  end
  
  private
  
  def set_task
    @task = Task.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  end
  
  def task_params
    params.require(:task).permit(:title, :description, :status)
  end
end
