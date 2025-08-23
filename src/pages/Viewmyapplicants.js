import React, { useEffect, useState } from "react";
import "../styles/viewmyapplicants.css"
import { useParams } from "react-router-dom";
import { FaDownload, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaStar, FaCheckCircle, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

const Viewmyapplicats = () => {
  const { eventId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    const token = localStorage.getItem("organizerToken");

    fetch(
      `https://caterrides.onrender.com/api/organizer/myapplicants/${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setApplicants(data.applicants || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching applicants:", err);
        setLoading(false);
      });
  }, [eventId]);

  const openModal = (action, riderId) => {
    setSelectedAction(action);
    setSelectedRider(riderId);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setActionLoading(true);

    try {
      const res = await fetch(
        `https://caterrides.onrender.com/api/organizer/event/${eventId}/respond/${selectedRider}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("organizerToken")}`,
          },
          body: JSON.stringify({ action: selectedAction }),
        }
      );

      if (!res.ok) throw new Error(`Failed: ${res.status}`);

      await res.json();

      // Update status locally
      setApplicants((prev) =>
        prev.map((app) =>
          app.rider._id === selectedRider
            ? { ...app, status: selectedAction }
            : app
        )
      );

      // Show success popup
      setSuccessMessage(
        selectedAction === "accepted" ? "✅ Confirmed" : "❌ Rejected"
      );

      setTimeout(() => {
        setShowModal(false);
        setActionLoading(false);
      }, 800);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error("Error updating rider status:", err);
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setActionLoading(false);
    setSelectedAction(null);
    setSelectedRider(null);
  };

  // PDF generation
  const downloadPDF = (applicants) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("CaterRides - Accepted Riders List", 14, 15);
    doc.setFontSize(12);
    doc.setTextColor(99);

    const tableColumn = ["#", "Name", "Phone", "Email", "Status"];
    const tableRows = [];

    // Filter only accepted applicants (case-insensitive)
    applicants
      .filter(applicant => applicant.status?.toLowerCase() === "accepted")
      .forEach((applicant, index) => {
        tableRows.push([
          index + 1,
          applicant.rider.name,
          applicant.rider.phone,
          applicant.rider.email,
          applicant.status
        ]);
      });

    doc.text(
      "*Accepted riders don't guarantee participation. Keep in contact with booked riders via phone or email.",
      8,
      25
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    });

    doc.save("accepted_applicants.pdf");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Fetching applicants...</p>
      </div>
    );
  }

  return (
    <>
      {/* Animated Success Popup */}
      {successMessage && (
        <div className="success-popup show">{successMessage}</div>
      )}
      
      <div className="applicants-container">
        <div className="header-section">
          <h2 className="applicants-heading">Applicants</h2>
          <button className="download-pdf-btn" onClick={() => downloadPDF(applicants)}>
            <FaDownload className="btn-icon" />
            Download PDF
          </button>
        </div>
        
        {applicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No applicants yet</h3>
            <p>Applicants will appear here once riders apply to your event</p>
          </div>
        ) : (
          <div className="applicants-grid">
            {applicants.map((applicant, index) => (
              <div 
                key={applicant.rider._id} 
                className="applicant-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <div className="avatar">
                    {applicant.rider.name ? applicant.rider.name.charAt(0).toUpperCase() : "R"}
                  </div>
                  <div className="applicant-name">{applicant.rider.name}</div>
                  <div className={`status-badge ${applicant.status}`}>
                    {applicant.status === "accepted" ? "Booked" : applicant.status === "rejected" ? "Rejected" : "Pending"}
                  </div>
                </div>

                <div className="applicant-details">
                  <div className="detail-item">
                    <FaEnvelope className="detail-icon" />
                    <span>{applicant.rider.email}</span>
                  </div>
                  <div className="detail-item">
                    <FaPhone className="detail-icon" />
                    <span>{applicant.rider.phone}</span>
                  </div>
                  <div className="detail-item">
                    <FaUser className="detail-icon" />
                    <span>{applicant.rider.servesCompleted} services completed</span>
                  </div>
                  <div className="detail-item">
                    <FaStar className="detail-icon star" />
                    <span>Rating: {applicant.rider.rating}</span>
                  </div>
                </div>

                <div className="card-actions">
                  {!["accepted", "rejected"].includes(applicant.status) && (
                    <>
                      <button
                        className="action-btn reject"
                        onClick={() => openModal("rejected", applicant.rider._id)}
                      >
                        <FaTimes /> Reject
                      </button>
                      <button
                        className="action-btn accept"
                        onClick={() => openModal("accepted", applicant.rider._id)}
                      >
                        <FaCheck /> Book
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Popup Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Confirm {selectedAction}</h3>
                <button className="modal-close" onClick={handleCancel}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="modal-icon">
                  {selectedAction === "accepted" ? (
                    <FaCheckCircle className="success" />
                  ) : (
                    <FaExclamationTriangle className="warning" />
                  )}
                </div>
                <p>
                  Are you sure you want to {selectedAction.toLowerCase()} this applicant?
                  Once confirmed, you will not be able to update this decision.
                </p>
              </div>

              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button 
                  className={`modal-btn confirm ${selectedAction}`} 
                  onClick={handleConfirm}
                  disabled={actionLoading}
                >
                  {actionLoading ? <FaSpinner className="spinner" /> : `Yes, ${selectedAction}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Viewmyapplicats;