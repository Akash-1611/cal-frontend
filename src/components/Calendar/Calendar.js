import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { openModal, setDragging, setDraggedTask } from '../../redux/slices/uiSlice';
import { updateEvent } from '../../redux/slices/eventSlice';
import { fetchGoals } from '../../redux/slices/goalSlice';
import { fetchTasks } from '../../redux/slices/taskSlice';
import EventModal from '../EventModal/EventModal';
import Sidebar from '../Sidebar/Sidebar';
import TaskGoalPanel from '../TaskManager/Taskpanel';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const tasks = useSelector((state) => state.tasks.tasks);
  const goals = useSelector((state) => state.goals.goals);
  const isModalOpen = useSelector((state) => state.ui.isModalOpen);
  const draggedTask = useSelector((state) => state.ui.draggedTask);
  const isDragging = useSelector((state) => state.ui.isDragging);
  const [view, setView] = useState('week');
  const [showTaskGoalPanel, setShowTaskGoalPanel] = useState(false);

  // Fetch goals and tasks on component mount
  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
  }, [dispatch]);

  // Combine events with tasks that have dates
  const combinedEvents = [...events];
  
  // Convert tasks with dates to calendar events
  tasks.forEach(task => {
    if (task.dueDate) {
      const goal = goals.find(g => g._id === task.goalId);
      combinedEvents.push({
        _id: `task-${task._id}`,
        title: task.name,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        allDay: true,
        color: goal ? goal.color : '#757575',
        isTask: true,
        taskId: task._id,
        completed: task.completed
      });
    }
  });

  // Improved drag and drop implementation
  useEffect(() => {
    if (!isDragging) return;

    const calendarElement = document.querySelector('.rbc-time-view');
    if (!calendarElement) return;
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    
    const handleDragEnter = (e) => {
      e.preventDefault();
      calendarElement.classList.add('drag-highlight');
      document.querySelector('.calendar-container').classList.add('drag-active');
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      if (!e.currentTarget.contains(e.relatedTarget)) {
        calendarElement.classList.remove('drag-highlight');
        document.querySelector('.calendar-container').classList.remove('drag-active');
      }
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      calendarElement.classList.remove('drag-highlight');
      document.querySelector('.calendar-container').classList.remove('drag-active');
      
      let task = null;
      
      // Try to get task from dataTransfer first
      try {
        const taskData = e.dataTransfer.getData('application/json');
        if (taskData) {
          task = JSON.parse(taskData);
        }
      } catch (err) {
        console.error('Failed to parse dropped task data:', err);
      }
      
      // Fall back to Redux state if data transfer failed
      if (!task && draggedTask) {
        task = draggedTask;
      }
      
      if (!task) {
        console.error('No task data available on drop');
        return;
      }
      
      // Calculate where in the calendar the drop occurred
      const calendarRect = calendarElement.getBoundingClientRect();
      
      // Get the time and date from the drop location
      const relativeX = e.clientX - calendarRect.left;
      const relativeY = e.clientY - calendarRect.top;
      
      // Calculate day of week based on X position
      const daysInView = view === 'week' ? 7 : 1;
      const dayIndex = Math.floor((relativeX / calendarRect.width) * daysInView);
      
      // Calculate hour based on Y position
      const startHour = 7; // 7am
      const totalHours = 15; // 7am-10pm
      const hourOffset = Math.floor((relativeY / calendarRect.height) * totalHours);
      const hour = startHour + hourOffset;
      
      // Get current date and start of week
      const currentDate = new Date();
      const startOfWeek = moment(currentDate).startOf('week').toDate();
      
      // Calculate the event date and time
      const eventStart = new Date(startOfWeek);
      eventStart.setDate(startOfWeek.getDate() + dayIndex);
      eventStart.setHours(hour, 0, 0, 0);
      
      const eventEnd = new Date(eventStart);
      eventEnd.setHours(eventStart.getHours() + 1);
      
      // Find associated goal
      const goal = goals.find(g => g._id === task.goalId);
      
      // Open modal to create event from task
      dispatch(openModal({
        type: 'create',
        event: {
          title: task.name,
          startTime: eventStart,
          endTime: eventEnd,
          date: eventStart,
          category: goal ? goal.name : 'work',
          color: goal ? goal.color : '#3174ad',
          taskId: task._id,
          goalId: task.goalId
        }
      }));
      
      // Reset drag state
      dispatch(setDragging(false));
      dispatch(setDraggedTask(null));
    };
    
    calendarElement.addEventListener('dragover', handleDragOver);
    calendarElement.addEventListener('dragenter', handleDragEnter);
    calendarElement.addEventListener('dragleave', handleDragLeave);
    calendarElement.addEventListener('drop', handleDrop);
    
    return () => {
      calendarElement.removeEventListener('dragover', handleDragOver);
      calendarElement.removeEventListener('dragenter', handleDragEnter);
      calendarElement.removeEventListener('dragleave', handleDragLeave);
      calendarElement.removeEventListener('drop', handleDrop);
      document.querySelector('.calendar-container')?.classList.remove('drag-active');
    };
  }, [isDragging, draggedTask, dispatch, goals, view]);

  // Handle event click
  const handleEventClick = (event) => {
    if (event.isTask) {
      dispatch(openModal({
        type: 'task',
        event,
        taskId: event.taskId
      }));
    } else {
      dispatch(openModal({
        type: 'edit',
        event
      }));
    }
  };

  // Handle slot select for new event
  const handleSelectSlot = ({ start, end }) => {
    dispatch(openModal({
      type: 'create',
      event: {
        title: '',
        startTime: start,
        endTime: end,
        date: start,
        category: 'work',
        color: '#3174ad'
      }
    }));
  };

  // Handle event drag and drop
  const handleEventDrop = ({ event, start, end }) => {
    if (event.isTask) return;
    
    const newDate = new Date(start);
    const eventData = {
      ...event,
      startTime: start,
      endTime: end,
      date: newDate,
      start,
      end
    };
    
    dispatch(updateEvent({ id: event._id, eventData }));
  };

  // Handle event resize
  const handleEventResize = ({ event, start, end }) => {
    if (event.isTask) return;
    
    const eventData = {
      ...event,
      startTime: start,
      endTime: end,
      start,
      end
    };
    
    dispatch(updateEvent({ id: event._id, eventData }));
  };

  // Custom event styling
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color || '#3174ad',
      borderRadius: '4px',
      color: '#fff',
      border: 'none',
      display: 'block',
      overflow: 'hidden'
    };
    
    if (event.isTask && event.completed) {
      style.textDecoration = 'line-through';
      style.opacity = 0.7;
    }
    
    return {
      style
    };
  };

  // Toggle the Task/Goal panel
  const toggleTaskGoalPanel = () => {
    setShowTaskGoalPanel(!showTaskGoalPanel);
  };

  return (
    <div className="calendar-container">
      <Sidebar />
      <div className="calendar-main">
        <div className="calendar-header">
          <h1>Calendar</h1>
          <div className="calendar-controls">
            <div className="view-selector">
              <button 
                className={view === 'day' ? 'active' : ''} 
                onClick={() => setView('day')}
              >
                Day
              </button>
              <button 
                className={view === 'week' ? 'active' : ''} 
                onClick={() => setView('week')}
              >
                Week
              </button>
              <button 
                className={view === 'month' ? 'active' : ''} 
                onClick={() => setView('month')}
              >
                Month
              </button>
            </div>
            <button 
              className={`task-goal-toggle ${showTaskGoalPanel ? 'active' : ''}`}
              onClick={toggleTaskGoalPanel}
            >
              Goals & Tasks
            </button>
          </div>
        </div>
        <div className="calendar-with-panel">
          <BigCalendar
            localizer={localizer}
            events={combinedEvents}
            startAccessor="start"
            endAccessor="end"
            selectable
            resizable
            onSelectEvent={handleEventClick}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            eventPropGetter={eventStyleGetter}
            view={view}
            onView={setView}
            step={15}
            timeslots={4}
            defaultView="week"
            min={new Date(0, 0, 0, 7, 0, 0)} // 7 AM
            max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
          />
          {showTaskGoalPanel && <TaskGoalPanel />}
        </div>
      </div>
      {isModalOpen && <EventModal />}
    </div>
  );
};

export default Calendar;