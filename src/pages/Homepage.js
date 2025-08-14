// src/pages/HomePage.js
import React from "react";
import { Link } from "react-router-dom";
import { FaUserTie} from "react-icons/fa";
import "../styles/Homepagestyle.css"


const HomePage = () => {
  return (
    <div className="homepage">
      <div className="card">
        <h1 className="title">CaterRides</h1>
        <p className="subtitle">Please select your role</p>
        <div className="button-group">
          <Link to="/organizer" className="role-button organizer">
            <FaUserTie className="icon" />
            Organizer
          </Link>
          <Link to="/rider" className="role-button rider">
            CaterRider
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
