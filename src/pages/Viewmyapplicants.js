import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/viewmyapplicants.css";
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
//pdf generation
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
        <h2 className="applicants-heading">Applicants</h2>
        <button className="pdf" onClick={() => downloadPDF(applicants)}>Download PDF</button>
        {applicants.length === 0 ? (
          <p className="no-data">No applicants found</p>
        ) : (
          applicants.map((applicant) => (
            <div key={applicant.rider._id} className="applicant-card">
              <div className="applicant-info">
                <p><strong>Name:</strong> {applicant.rider.name}</p>
                <p><strong>Email:</strong> {applicant.rider.email}</p>
                <p><strong>Phone:</strong> {applicant.rider.phone}</p>
                <p><strong>Serves Completed:</strong> {applicant.rider.servesCompleted}</p>
                <p><strong>Rating:</strong> {applicant.rider.rating}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-tag ${
                      applicant.status === "accepted"
                        ? "status-booked"
                        : applicant.status === "rejected"
                        ? "status-rejected"
                        : "status-pending"
                    }`}
                  >
                    {applicant.status === "accepted"
                      ? "Booked ✅"
                      : applicant.status === "rejected"
                      ? "Rejected ❌"
                      : "Pending"}
                  </span>
                </p>
              </div>

              <div className="applicant-actions">
                {!["accepted", "rejected"].includes(applicant.status) && (
                  <>
                    <button
                      className="reject-btn"
                      onClick={() => openModal("rejected", applicant.rider._id)}
                    >
                      Reject
                    </button>
                    <button
                      className="book-btn"
                      onClick={() => openModal("accepted", applicant.rider._id)}
                    >
                      Book
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {/* Popup Modal */}
        {showModal && (
          <div className="modal-overlay fade-in">
            <div className="modal scale-up">
              <h3>Confirm {selectedAction}</h3>
              <p>
                Are you sure you want to {selectedAction.toLowerCase()} this
                applicant?,once confirmation made you will not able to update later..
              </p>

              {actionLoading ? (
                <div className="spinner"></div>
              ) : (
                <div className="modal-buttons">
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className="confirm-btn" onClick={handleConfirm}>
                    Yes, {selectedAction}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Viewmyapplicats;
