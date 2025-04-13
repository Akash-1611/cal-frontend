import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://calender-backend-weom.onrender.com/api/events';

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      // Convert the date strings to Date objects for the calendar
      return response.data.map(event => ({
        ...event,
        date: new Date(event.date),
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        start: new Date(event.startTime),
        end: new Date(event.endTime)
      }));
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, eventData);
      return {
        ...response.data,
        date: new Date(response.data.date),
        startTime: new Date(response.data.startTime),
        endTime: new Date(response.data.endTime),
        start: new Date(response.data.startTime),
        end: new Date(response.data.endTime)
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, eventData);
      return {
        ...response.data,
        date: new Date(response.data.date),
        startTime: new Date(response.data.startTime),
        endTime: new Date(response.data.endTime),
        start: new Date(response.data.startTime),
        end: new Date(response.data.endTime)
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create event
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event._id !== action.payload);
      });
  }
});

export default eventSlice.reducer;