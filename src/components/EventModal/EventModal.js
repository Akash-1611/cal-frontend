import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { closeModal } from '../../redux/slices/uiSlice';
import { createEvent, updateEvent, deleteEvent } from '../../redux/slices/eventSlice';
import './EventModal.css';

const categories = [
  { value: 'exercise', label: 'Exercise', color: '#28a745' },
  { value: 'eating', label: 'Eating', color: '#fd7e14' },
  { value: 'work', label: 'Work', color: '#dc3545' },
  { value: 'relax', label: 'Relax', color: '#6610f2' },
  { value: 'family', label: 'Family', color: '#17a2b8' },
  { value: 'social', label: 'Social', color: '#6c757d' }
];

const EventModal = () => {
  const dispatch = useDispatch();
  const { modalData } = useSelector((state) => state.ui);
  const isEdit = modalData.type === 'edit';
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'work',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    color: '#3174ad'
  });

  useEffect(() => {
    if (modalData.event) {
      setFormData({
        title: modalData.event.title || '',
        category: modalData.event.category || 'work',
        date: modalData.event.date ? new Date(modalData.event.date) : new Date(),
        startTime: modalData.event.startTime ? new Date(modalData.event.startTime) : new Date(),
        endTime: modalData.event.endTime ? new Date(modalData.event.endTime) : new Date(new Date().setHours(new Date().getHours() + 1)),
        color: modalData.event.color || getCategoryColor(modalData.event.category) || '#3174ad'
      });
    }
  }, [modalData]);

  const getCategoryColor = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.color : '#3174ad';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes, update the color as well
    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        color: getCategoryColor(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });
  };
  const handleStartTimeChange = (time) => {
    // If the new start time is after the end time, adjust the end time
    const endTime = time > formData.endTime ? new Date(time.getTime() + 60 * 60 * 1000) : formData.endTime;
    
    setFormData({
      ...formData,
      startTime: time,
      endTime
    });
  };

  const handleEndTimeChange = (time) => {
    // Prevent end time from being before start time
    if (time < formData.startTime) {
      return;
    }
    
    setFormData({
      ...formData,
      endTime: time
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create event object with proper format for database
    const eventData = {
      ...formData,
      // Make sure date part is consistent
      date: formData.date,
      // For calendar display
      start: formData.startTime,
      end: formData.endTime
    };
    
    if (isEdit) {
      dispatch(updateEvent({ id: modalData.event._id, eventData }));
    } else {
      dispatch(createEvent(eventData));
    }
    
    dispatch(closeModal());
  };

  const handleDelete = () => {
    if (isEdit && modalData.event._id) {
      dispatch(deleteEvent(modalData.event._id));
      dispatch(closeModal());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Event' : 'Create Event'}</h2>
          <button className="close-button" onClick={() => dispatch(closeModal())}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Event title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <DatePicker
                selected={formData.startTime}
                onChange={handleStartTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="h:mm aa"
                className="time-picker"
              />
            </div>
            
            <div className="form-group">
              <label>End Time</label>
              <DatePicker
                selected={formData.endTime}
                onChange={handleEndTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="h:mm aa"
                className="time-picker"
              />
            </div>
          </div>
          
          <div className="form-actions">
            {isEdit && (
              <button 
                type="button" 
                className="delete-button"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <button type="submit" className="save-button">
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;