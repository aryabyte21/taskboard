class Task < ApplicationRecord
  validates :title, presence: true, length: { minimum: 1, maximum: 255 }
  validates :description, presence: true
  validates :status, presence: true, inclusion: { in: ['todo', 'in_progress', 'done'] }
  before_validation :set_default_status, on: :create
  
  scope :todo, -> { where(status: 'todo') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :done, -> { where(status: 'done') }
  
  private
  
  def set_default_status
    self.status ||= 'todo'
  end
end
