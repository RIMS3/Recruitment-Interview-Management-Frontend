import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";

import Template1 from "./Templates/Template1";
import Template2 from "./Templates/Template2";
import Template3 from "./Templates/Template3";

import "./CreateCV.css";

const CVViewer = () => {

  const { cvId } = useParams();

  const [cvData, setCvData] = useState(null);
  const [templateId, setTemplateId] = useState("tpl-1");
  const [loading, setLoading] = useState(true);

  const cvRef = React.useRef(null);

  useEffect(() => {

    const fetchCV = async () => {

      try {

        const response = await fetch(
          `https://localhost:7272/api/cvs/${cvId}`
        );

        if (!response.ok) {
          throw new Error("Không tải được CV");
        }

        const data = await response.json();

        setCvData(data);

        if (data.templateId) {
          setTemplateId(data.templateId);
        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchCV();

  }, [cvId]);

  const handleExportPDF = () => {

    const element = cvRef.current;

    if (!element) return;

    const fileName = cvData?.fullName
      ? `CV_${cvData.fullName.replace(/\s+/g, "_")}.pdf`
      : "CV.pdf";

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };

  const renderTemplate = () => {

    if (loading) {
      return <div className="loading-spinner">Đang tải CV...</div>;
    }

    if (!cvData) {
      return <div>Không tìm thấy CV</div>;
    }

    switch (templateId) {

      case "tpl-2":
        return <Template2 cvData={cvData} readOnly={true} />;

      case "tpl-3":
        return <Template3 cvData={cvData} readOnly={true} />;

      default:
        return <Template1 cvData={cvData} readOnly={true} />;
    }
  };

  return (

    <div className="create-cv-layout">

      <header className="workspace-header">

        <div className="header-container">

          <h2>CV ứng viên</h2>

          <div style={{display:"flex",gap:"10px"}}>

            <span style={{
              color:"#ef4444",
              fontWeight:"600"
            }}>
              🔒 Chỉ xem
            </span>

            <button
              onClick={handleExportPDF}
              style={{
                background:"#ef4444",
                color:"white",
                border:"none",
                padding:"8px 18px",
                borderRadius:"6px",
                cursor:"pointer"
              }}
            >
              📄 Download PDF
            </button>

          </div>

        </div>

      </header>

      <main className="cv-workspace">

        <div ref={cvRef}>
          {renderTemplate()}
        </div>

      </main>

    </div>

  );
};

export default CVViewer;