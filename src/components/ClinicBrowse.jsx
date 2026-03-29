import React from 'react';
import './ClinicBrowse.css';

const ClinicBrowse = () => {
  return (
    <div className="clinic-browse">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">M</div>
          MedQ
        </div>
        <nav>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </nav>
      </header>

      <div className="clinic-explorer">
        <aside className="sidebar-list">
          <h2>Clinics</h2>
          <ul>
            <li>Clinic 1</li>
            <li>Clinic 2</li>
            <li>Clinic 3</li>
          </ul>
        </aside>

        <div className="map-view">
          <h2>Map View</h2>
          {/* Placeholder for map */}
        </div>
      </div>
    </div>
  );
};

export default ClinicBrowse;