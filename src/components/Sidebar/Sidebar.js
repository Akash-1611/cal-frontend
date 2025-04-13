import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { selectGoal } from '../../redux/slices/goalSlice';
import { setDragging, setDraggedTask, openModal } from '../../redux/slices/uiSlice';
import './Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const goals = useSelector((state) => state.goals.goals);
  const tasks = useSelector((state) => state.tasks.tasks);
  const selectedGoal = useSelector((state) => state.goals.selectedGoal);
  
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  // Update filtered tasks when selected goal or tasks change
  useEffect(() => {
    if (selectedGoal) {
      const goalTasks = tasks.filter(task => task.goalId._id === selectedGoal);
      setFilteredTasks(goalTasks);
    } else {
      setFilteredTasks([]);
    }
  }, [selectedGoal, tasks]);
  
  const handleGoalClick = (goalId) => {
    dispatch(selectGoal(goalId === selectedGoal ? null : goalId));
  };
  
  // Handle drag start
  const onDragStart = (result) => {
    const { draggableId } = result;
    const task = tasks.find(t => t._id === draggableId);
    if (task) {
      dispatch(setDragging(true));
      dispatch(setDraggedTask(task));
    }
  };
  
  // Handle drag end
  const onDragEnd = (result) => {
    dispatch(setDragging(false));
    dispatch(setDraggedTask(null));
    
    // If dropped outside droppable area or not dropped on calendar (calendar has its own handler)
    if (!result.destination) {
      return;
    }
    
    // Handle reordering within the sidebar if needed
    // This is where you could implement sidebar reordering logic
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Goals & Tasks</h2>
      </div>
      
      <div className="goals-container">
        <h3>Goals</h3>
        <ul className="goals-list">
          {goals.map(goal => (
            <li 
              key={goal._id}
              className={`goal-item ${selectedGoal === goal._id ? 'selected' : ''}`}
              onClick={() => handleGoalClick(goal._id)}
              style={{ borderLeftColor: goal.color }}
            >
              {goal.name}
            </li>
          ))}
        </ul>
      </div>
      
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="tasks-container">
          <h3>Tasks</h3>
          {selectedGoal ? (
            <Droppable droppableId="tasksList">
              {(provided) => (
                <ul 
                  className="tasks-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-item"
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: task.goalId.color,
                            }}
                          >
                            {task.name}
                          </li>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <li className="no-tasks">No tasks for this goal</li>
                  )}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          ) : (
            <p className="select-goal-prompt">Select a goal to see tasks</p>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Sidebar;