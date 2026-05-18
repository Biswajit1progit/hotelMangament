/*  import PaymentForm from "../component/PaymentForm";
import BookingSummary from "../component/BookingSummery";

const PaymentPage = ({ booking }) => {
  return (
    <div className="grid grid-cols-3 gap-5 p-6">
      
     
       <div className="col-span-2">
        <PaymentForm booking={booking} />
      </div> 

      {/* RIGHT - Summary *//* }
        <BookingSummary booking={booking} />

    </div>
  );
};  */ 

//export default PaymentPage; 
 // src/pages/PaymentPage.js

 import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PaymentForm from "../component/PaymentForm";
import BookingSummary from "../component/BookingSummary";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";
const PaymentPage = () => {
  const { id } = useParams(); // get booking ID from URL
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/${id}`);
      const data = await res.json();
      setBooking(data);
    };
    fetchBooking();
  }, [id]);

  if (!booking) return <div>Loading...</div>;

  return (

    <>
    <div className="fixed left-0 right-0 top-0">
      <Hotelnav/>
    </div>
     
    <div className="flex  flex-wrap gap-5 p-6 items-center  justify-center mt-24 ">
      {/* <div className="col-span-2 h-[60vh ] items-center  w-[30vw]">
        <PaymentForm booking={booking} />
         
      </div> */}
       <PaymentForm booking={booking} />
       <BookingSummary booking={booking} />
    </div>
    <div>
      <Footer/>
    </div>
    </>
  );
};

export default PaymentPage;
