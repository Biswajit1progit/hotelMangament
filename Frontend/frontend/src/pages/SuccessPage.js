 import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import generatePDF from "../utils/generatePDF";
import Invoice from "../component/Invoice";


const SuccessPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
    const downloadPDF = () => {
  const doc = new jsPDF();
   
   doc.text(`Name: ${data.name}`,10,70);
   doc.text(`Email: ${data.email}`,10,80);
  doc.text(`Order: ${data.orderNumber}`, 10, 10);
  doc.text(`Amount: ₹${data.amount}`, 10, 20);
  doc.text(`Hotel: ${data.hotelName}`, 10, 30);
  doc.text(`Guests: ${data.guests}`, 10, 40);
  doc.text(`Rooms: ${data.rooms}`, 10, 50);
  /* doc.text(`Nights: ${data.nights}`, 10, 60); */
 
  doc.save("invoice.pdf");
     };
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/payment/receipt/${id}`)
      .then(res => res.json())
      .then(setData);
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <> 
   
     <div className="p-6 flex flex-col items-center">

      <Invoice data={data} />

      <div className="flex gap-3 mt-4">

        <button onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded">
          Print
        </button>

        <button onClick={() => generatePDF(data)}
          className="bg-green-600 text-white px-4 py-2 rounded">
          Download PDF
        </button>

      </div>
    </div>
    </>
   
  );
};

export default SuccessPage;