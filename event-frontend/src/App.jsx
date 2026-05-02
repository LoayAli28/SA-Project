import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

import Home                 from './pages/Participant/Home/Home';
import ParticipantDashboard from './pages/Participant/ParticipantDashboard';
import MyTickets            from './pages/Participant/MyTickets';


import OrganizerDashboard from './pages/Organizer/OrganizerDashboard';
import MyEvents           from './pages/Organizer/MyEvents';
import CreateEvent        from './pages/Organizer/CreateEvent';
import EditEvent          from './pages/Organizer/EditEvent';


import Navbar from './components/Navbar/Navbar';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"           element={<Home />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />

          {/* Participant */}
          <Route path="/participant"       element={<ParticipantDashboard />} />
          <Route path="/my-tickets"        element={<MyTickets />} />
         
          

          {/* Organizer */}
          <Route path="/organizer"              element={<OrganizerDashboard />} />
          <Route path="/organizer/events"       element={<MyEvents />} />
          <Route path="/organizer/create"       element={<CreateEvent />} />
          <Route path="/organizer/:id/edit"     element={<EditEvent />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}