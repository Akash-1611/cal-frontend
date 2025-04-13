import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './slices/eventSlice';
import goalReducer from './slices/goalSlice';
import taskReducer from './slices/taskSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    events: eventReducer,
    goals: goalReducer,
    tasks: taskReducer,
    ui: uiReducer
  },
});