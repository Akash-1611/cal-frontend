import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { fetchEvents } from './redux/slices/eventSlice';
import { fetchGoals } from './redux/slices/goalSlice';
import { fetchTasks } from './redux/slices/taskSlice';
import Calendar from './components/Calendar/Calendar';
import './App.css';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchGoals());
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <div className="app">
      <Calendar />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;