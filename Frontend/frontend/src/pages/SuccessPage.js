 import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import generatePDF from "../utils/generatepdf";
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
    {/* <div className=" flex justify-center items-center h-screen   ">
     <div className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-300 scale-107"> */}
        {/* <div className="ml-26 ">
          <svg
      width="160"
      height="50"
      viewBox="0 0 160 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon */}
     {/*  <g transform="translate(0,5)">
        <circle cx="25" cy="20" r="18" fill="#2563EB" />

        <path
          d="M5 28 C18 5, 32 5, 45 20"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        <polygon
          points="28,10 42,16 28,20 32,26 24,20 12,22"
          fill="white"
        />
      </g> */}

      {/* Text */}
     {/*  <text
        x="50"
        y="31"
        fontFamily="Poppins, Arial, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#091fed"
        display="flex"
      >
      
      </text> */}
       {/*  </svg>
        </div> * */}
      {/* <h2 className="text-green-600 text-xl mb-4 ml-8">
        Payment Successful ✅
      </h2> */}
     {/*  <p><b>User:</b> {data.name}</p>
      <p><b>Email:</b> {data.email}</p>
      <p><b>Phone:</b> {data.phone}</p> */}

      {/* <p><b>Order No:</b> {data.orderNumber}</p>
      <p><b>Transaction ID:</b> {data.razorpayPaymentId}</p>
      <p><b>Amount:</b> ₹{data.amount}</p>
      <p><b>Hotel:</b> {data.hotelName}</p>
      <p><b>Guests:</b> {data.guests}</p>
      <p><b>Rooms:</b> {data.rooms}</p> */}
     
      {/* PRINT BUTTON */}
     {/*  <button
        onClick={downloadPDF}
        className="mt-4 bg-blue-600 text-white ml-19 px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-300 "
      >
        Print Invoice
      </button>
 */}
   {/*  </div>
    </div> */}
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