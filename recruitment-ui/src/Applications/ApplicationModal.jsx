import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const ApplicationModal = ({ show, handleClose, applicationId }) => {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://localhost:7272/api/Application/${applicationId}/cv`
      );

      if (!res.ok) {
        throw new Error("Không lấy được thông tin CV");
      }

      const data = await res.json();
      setApp(data);
    } catch (err) {
      toast.error("Lỗi khi tải CV");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!app?.cvId) {
      toast.error("Ứng viên chưa upload CV");
      return;
    }

    setShowPreview(!showPreview);
  };

  const handleViewCV = () => {
    if (!app?.cvId) {
      toast.error("Ứng viên chưa upload CV");
      return;
    }
  };

  if (!app && !loading) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thông tin CV ứng viên</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "15px" }}>
              <Button variant="primary" onClick={handlePreview}>
                {showPreview ? "Ẩn Preview CV" : "Preview CV"}
              </Button>

              {"  "}

              <a
                href={`https://localhost:7272/api/Cvs/${app.cvId}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
                onClick={handleViewCV}
              >
                Xem CV chi tiết
              </a>
            </div>

            {showPreview && (
              <iframe
                title="CV Preview"
                src={`https://localhost:7272/api/Cvs/${app.cvId}/download`}
                width="100%"
                height="500px"
                style={{ border: "1px solid #ccc" }}
              />
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApplicationModal;
