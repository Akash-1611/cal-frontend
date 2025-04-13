import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://calender-backend-weom.onrender.com/api/goals';

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, goalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTasksByGoal = createAsyncThunk(
  'goals/fetchTasksByGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${goalId}/tasks`);
      return { goalId, tasks: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    goals: [],
    selectedGoal: null,
    status: 'idle',
    error: null
  },
  reducers: {
    selectGoal: (state, action) => {
      state.selectedGoal = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create goal
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      });
  }
});

export const { selectGoal } = goalSlice.actions;
export default goalSlice.reducer;