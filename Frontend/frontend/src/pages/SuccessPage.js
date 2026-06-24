import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import generatePDF from "../utils/generatePDF";
import Invoice from "../component/Invoice";
import api from "../services/apiClient"; // ✅ ADDED

const SuccessPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Name: ${data.name}`, 10, 70);
    doc.text(`Email: ${data.email}`, 10, 80);
    doc.text(`Order: ${data.orderNumber}`, 10, 10);
    doc.text(`Amount: ₹${data.amount}`, 10, 20);
    doc.text(`Hotel: ${data.hotelName}`, 10, 30);
    doc.text(`Guests: ${data.guests}`, 10, 40);
    doc.text(`Rooms: ${data.rooms}`, 10, 50);
    doc.save("invoice.pdf");
  };

  useEffect(() => {
    // ✅ FIXED — was raw fetch() with no Authorization header, so the
    // backend returned 401 "No token provided" after verifyToken was
    // added to this route. Now uses the shared api instance which
    // automatically attaches the Bearer token via the request interceptor.
    api.get(`/api/payment/receipt/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch receipt:", err));
  }, [id]);

  // Redirect browser back button to Home
  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  if (!data) {
    return (
      <div className="p-6 flex flex-col items-center w-full">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="space-y-4">
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-5 bg-gray-200 rounded w-4/6"></div>
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex gap-3 mt-8 justify-center">
              <div className="h-10 w-28 bg-gray-200 rounded"></div>
              <div className="h-10 w-36 bg-gray-200 rounded"></div>
              <div className="h-10 w-28 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <Invoice data={data} />

      <div className="flex gap-3 mt-4 flex-wrap">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Print
        </button>

        <button
          onClick={() => generatePDF(data)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>

        <button
          onClick={() => navigate("/", { replace: true })}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;