import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isModalOpen: false,
    modalData: null,
    selectedDate: new Date(),
    isDragging: false,
    draggedTask: null
  },
  reducers: {
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.modalData = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalData = null;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setDragging: (state, action) => {
      state.isDragging = action.payload;
    },
    setDraggedTask: (state, action) => {
      state.draggedTask = action.payload;
    }
  }
});

export const { 
  openModal, 
  closeModal, 
  setSelectedDate,
  setDragging,
  setDraggedTask
} = uiSlice.actions;
export default uiSlice.reducer;