import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createGoal, selectGoal, fetchTasksByGoal } from '../../redux/slices/goalSlice';
import { 
  createTask, 
  updateTask, 
  deleteTask,
  clearTaskError 
} from '../../redux/slices/taskSlice';
import { setDragging, setDraggedTask } from '../../redux/slices/uiSlice';
import './TaskGoalPanel.css';

const TaskGoalPanel = () => {
  const dispatch = useDispatch();
  const { goals, selectedGoal, status: goalStatus } = useSelector(state => state.goals);
  const { tasks, status: taskStatus, error: taskError } = useSelector(state => state.tasks);
  
  const [activeTab, setActiveTab] = useState('goals');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalColor, setNewGoalColor] = useState('#3174ad');
  const [newTaskName, setNewTaskName] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskCreationStatus, setTaskCreationStatus] = useState('');

  // Filter tasks by selected goal
  const filteredTasks = selectedGoal 
    ? tasks.filter(task => task.goalId === selectedGoal._id)
    : tasks;

  // Clear any task errors when component unmounts or when the selected goal changes
  useEffect(() => {
    return () => {
      dispatch(clearTaskError());
    };
  }, [dispatch, selectedGoal]);

  // Display task error if exists
  useEffect(() => {
    if (taskError) {
      console.error('Task error:', taskError);
      setTaskCreationStatus(`Error: ${typeof taskError === 'string' ? taskError : JSON.stringify(taskError)}`);
      
      // Auto-clear error message after 5 seconds
      const timer = setTimeout(() => {
        setTaskCreationStatus('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [taskError]);

  // Color options for goals
  const colorOptions = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', 
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  // Handle goal selection
  const handleSelectGoal = (goal) => {
    console.log('Selecting goal:', goal);
    dispatch(selectGoal(goal));
    dispatch(fetchTasksByGoal(goal._id));
  };

  // Handle add goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    dispatch(createGoal({
      name: newGoalName,
      color: newGoalColor
    }));

    setNewGoalName('');
    setNewGoalColor('#3174ad');
    setIsAddingGoal(false);
  };

  // Handle add task
  const handleAddTask = (e) => {
    e.preventDefault();
    setTaskCreationStatus('');
    
    if (!newTaskName.trim()) {
      setTaskCreationStatus('Error: Task name cannot be empty');
      return;
    }
    
    if (!selectedGoal) {
      setTaskCreationStatus('Error: No goal selected. Please select a goal first.');
      return;
    }
  
    // Create the task object with the goalId
    const taskData = {
      name: newTaskName,
      goalId: selectedGoal._id,
      completed: false
    };
  
    console.log('Task data to be sent:', taskData);
  
    setTaskCreationStatus('Creating task...');
    
    dispatch(createTask(taskData))
      .unwrap()
      .then(result => {
        console.log('Task created successfully:', result);
        setNewTaskName('');
        setIsAddingTask(false);
        setTaskCreationStatus('Task created successfully!');
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setTaskCreationStatus(''), 3000);
        
        // Refresh the tasks for this goal
        dispatch(fetchTasksByGoal(selectedGoal._id));
      })
      .catch(error => {
        console.error('Failed to create task:', error);
        setTaskCreationStatus(`Error: ${typeof error === 'string' ? error : JSON.stringify(error)}`);
      });
  };
  
  // Handle task completion toggle
  const handleToggleComplete = (task) => {
    console.log('Toggling task completion:', task._id, 'Current state:', task.completed);
    
    dispatch(updateTask({
      id: task._id,
      taskData: { ...task, completed: !task.completed }
    }))
      .unwrap()
      .then(() => {
        console.log('Task completion toggled successfully');
        // If you're filtering by goal, refresh the tasks
        if (selectedGoal) {
          dispatch(fetchTasksByGoal(selectedGoal._id));
        }
      })
      .catch(error => {
        console.error('Failed to update task:', error);
      });
  };

  // Handle task delete
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId))
        .unwrap()
        .then(() => {
          // Refresh tasks if needed
          if (selectedGoal) {
            dispatch(fetchTasksByGoal(selectedGoal._id));
          }
        });
    }
  };

  // Handle drag start for tasks
  const handleDragStart = (task, e) => {
    console.log('Drag started for task:', task.name);
    
    // Create a serialized version of the task to store in dataTransfer
    const taskData = JSON.stringify(task);
    e.dataTransfer.setData('application/json', taskData);
    
    // Store task in Redux for components that can't access dataTransfer
    dispatch(setDraggedTask(task));
    dispatch(setDragging(true));
    
    // Set drag image for better UX
    const goalColor = goals.find(g => g._id === task.goalId)?.color || '#757575';
    
    // Create drag ghost element
    const dragImage = document.createElement('div');
    dragImage.classList.add('task-drag-image');
    dragImage.innerText = task.name;
    dragImage.style.backgroundColor = goalColor;
    dragImage.style.color = 'white';
    dragImage.style.padding = '6px 12px';
    dragImage.style.borderRadius = '4px';
    dragImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    
    // Clean up after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    
    // Add visual feedback to the calendar
    document.querySelector('.calendar-container')?.classList.add('drag-active');
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    dispatch(setDragging(false));
    dispatch(setDraggedTask(null));
    document.querySelector('.calendar-container')?.classList.remove('drag-active');
  };

  return (
    <div className="task-goal-panel">
      <div className="panel-tabs">
        <button 
          className={activeTab === 'goals' ? 'active' : ''} 
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button 
          className={activeTab === 'tasks' ? 'active' : ''} 
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="goals-container">
          <div className="panel-header">
            <h3>My Goals</h3>
            <button 
              className="add-button"
              onClick={() => setIsAddingGoal(!isAddingGoal)}
            >
              {isAddingGoal ? 'Cancel' : '+ Add Goal'}
            </button>
          </div>

          {isAddingGoal && (
            <form onSubmit={handleAddGoal} className="add-form">
              <input
                type="text"
                placeholder="Goal name"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                required
              />
              <div className="color-selector">
                {colorOptions.map(color => (
                  <div 
                    key={color}
                    className={`color-option ${newGoalColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGoalColor(color)}
                  />
                ))}
              </div>
              <button type="submit" className="submit-button">Create Goal</button>
            </form>
          )}

          {goalStatus === 'loading' ? (
            <div className="loading">Loading goals...</div>
          ) : (
            <div className="goal-list">
              {goals.length === 0 ? (
                <p className="empty-message">No goals yet. Create your first goal!</p>
              ) : (
                goals.map(goal => (
                  <div 
                    key={goal._id}
                    className={`goal-item ${selectedGoal?._id === goal._id ? 'selected' : ''}`}
                    onClick={() => handleSelectGoal(goal)}
                  >
                    <div className="goal-color" style={{ backgroundColor: goal.color }}></div>
                    <div className="goal-name">{goal.name}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="tasks-container">
          <div className="panel-header">
            <h3>
              {selectedGoal ? `Tasks for ${selectedGoal.name}` : 'All Tasks'}
            </h3>
            {selectedGoal && (
              <button 
                className="add-button"
                onClick={() => setIsAddingTask(!isAddingTask)}
              >
                {isAddingTask ? 'Cancel' : '+ Add Task'}
              </button>
            )}
          </div>

          {taskCreationStatus && (
            <div className={`status-message ${taskCreationStatus.startsWith('Error') ? 'error' : 'success'}`}>
              {taskCreationStatus}
            </div>
          )}

          {isAddingTask && selectedGoal && (
            <form onSubmit={handleAddTask} className="add-form">
              <input
                type="text"
                placeholder="Task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                required
              />
              <div className="selected-goal-indicator">
                <div className="goal-color-dot" style={{ backgroundColor: selectedGoal.color }}></div>
                <span>Adding to: {selectedGoal.name}</span>
              </div>
              <button type="submit" className="submit-button">Create Task</button>
            </form>
          )}

          {!selectedGoal ? (
            <p className="select-message">Select a goal to see and manage tasks</p>
          ) : taskStatus === 'loading' ? (
            <div className="loading">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <p className="empty-message">No tasks for this goal yet</p>
          ) : (
            <div className="task-list">
              {filteredTasks.map(task => (
                <div 
                  key={task._id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(task, e)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="task-controls">
                    <input
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={() => handleToggleComplete(task)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className={`task-name ${task.completed ? 'completed' : ''}`}>
                      {task.name}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button 
                      className="delete-task-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task._id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="drag-help">
            <p>Tip: Drag a task to the calendar to schedule it</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskGoalPanel;