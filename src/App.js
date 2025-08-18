import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import RiderSignup from "./pages/RiderSignup";
import OrganizerSignup from "./pages/OrganizerSignup";
import Riderlogin from "./pages/Riderlogin";
import RiderDashboard from "./pages/RiderDashboard";
import ApplicationStatus from "./pages/ApplicationStatus";
import Riderprofile from "./pages/Riderprofile";
import Organizerlogin from "./pages/Organizerlogin";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import PostEvent from "./pages/PostEvent";
import Viewmyapplicats from "./pages/Viewmyapplicants";
import Organizerprofile from "./pages/Organizerprofile";
import Viewevent from "./pages/Viewevent";
import UpdateEvent from "./pages/UpdateEvent";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rider" element={<RiderSignup />} />
        <Route path="/rider/login" element={<Riderlogin/>} />
        <Route path="/rider-dashboard" element={<RiderDashboard/>} />
        <Route path="/organizer/signup" element={<OrganizerSignup />} />
        <Route path="/rider/applications" element={<ApplicationStatus />} />
        <Route path="rider/profile" element={<Riderprofile/>} />
        <Route path="/organizer" element={<OrganizerSignup />} />
        <Route path="/organizer/login" element={<Organizerlogin />} />
        <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
        <Route path="/post-event" element={<PostEvent/>} />
        <Route path="/view-applicants/:eventId" element={<Viewmyapplicats/>} />
        <Route path="/organizer-profile" element={<Organizerprofile/>} />
        <Route path="/rider/event/:eventId" element={<Viewevent/>} />
        <Route path="update-event/:eventId" element={<UpdateEvent/>} />
        
      </Routes>
    </Router>
  );
}

export default App;
