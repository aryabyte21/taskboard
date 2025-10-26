# RUBY LEARNING: Database Migrations
# Migrations are Ruby classes that modify your database schema
# They provide a version-controlled way to change your database structure

class CreateTasks < ActiveRecord::Migration[8.1]
  # RUBY LEARNING: The 'def' keyword defines a method
  # 'change' is a special method that Rails knows how to reverse automatically
  def change
    # RUBY LEARNING: Blocks and 'do...end'
    # create_table takes a block (code between 'do' and 'end')
    # |t| is a block parameter - similar to function parameters
    create_table :tasks do |t|
      # t.string creates a VARCHAR column (short text)
      t.string :title
      
      # t.text creates a TEXT column (longer text, no length limit)
      t.text :description
      
      # Status will be one of: 'todo', 'in_progress', 'done'
      t.string :status

      # RUBY LEARNING: timestamps is a Rails helper method
      # It automatically adds 'created_at' and 'updated_at' columns
      # Rails will manage these automatically
      t.timestamps
    end
  end
end
