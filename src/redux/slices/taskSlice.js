import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://calender-backend-weom.onrender.com/api/tasks';

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch tasks by goal
export const fetchTasksByGoal = createAsyncThunk(
    'tasks/fetchTasksByGoal',
    async (goalId, { rejectWithValue }) => {
      try {
        // Change to match your backend route configuration
        const response = await axios.get(`${API_URL}/goal/${goalId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching tasks by goal:', error);
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );
// Create a new task
// In taskSlice.js - Modified createTask action
export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (taskData, { rejectWithValue }) => {
      try {
        // Check if taskData has goalId before sending
        if (!taskData || !taskData.goalId) {
          console.error('Missing goalId in taskData:', taskData);
          return rejectWithValue('Goal ID is required in task data');
        }
        
        // Create a clean object to send
        const dataToSend = {
          name: taskData.name,
          goalId: taskData.goalId,
          completed: taskData.completed || false
        };
        
        // Log what we're sending
        console.log('Sending task data to API:', dataToSend);
        
        const response = await axios.post(API_URL, dataToSend);
        console.log('API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('API error:', error.response?.data || error.message);
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

// Update a task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch tasks';
      })
      
      // Fetch tasks by goal
      .addCase(fetchTasksByGoal.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksByGoal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Replace tasks with the ones for this specific goal
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasksByGoal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch tasks for this goal';
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create task';
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update task';
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to delete task';
      });
  }
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;