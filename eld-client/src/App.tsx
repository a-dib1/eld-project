import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import { RootState, AppDispatch } from './redux/store';
import { verifyTokenThunk } from './redux/slices/authSlice';
import DashboardLayout from './components/DashboardLayout';
import TripForm from './pages/TripForm';
import ViewTrip from './pages/ViewTrip';
import Home from './pages/Home';
import Loading from './components/Loading';

function App() {

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tripTitle, setTripTitle] = useState<string | null>(null);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleTripTitleChange = (title: string | null) => {
    setTripTitle(title);
  };

  useEffect(() => {
    const verifyOnLoad = async () => {
      await dispatch(verifyTokenThunk());
      setIsInitialCheckDone(true);
    };
    verifyOnLoad();
  }, [dispatch]);

  if (!isInitialCheckDone || loading) {
    return <Loading/>;
  }

  return (

    <Router>
      <div className="App">
        <Layout 
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarToggle={handleSidebarToggle}
          tripTitle={tripTitle}
        >
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route
              path="/dashboard"
              element={isAuthenticated ? 
              <DashboardLayout
                isSidebarCollapsed={isSidebarCollapsed}
                onSidebarToggle={handleSidebarToggle}
                onTripTitleChange={handleTripTitleChange}
              /> : <Navigate to="/login" />}
            >
              <Route index element={<Dashboard />} />
              <Route path="trip-form" element={<TripForm />} />
              <Route path="trip/:tripId" element={<ViewTrip />} />
            </Route>
            <Route path="/" element={<Home/>} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;