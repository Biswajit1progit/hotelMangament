import { useState } from "react";
import FlightSearch from "./search/FlightSearch";
import HotelSearch from "./search/HotelSearch";
import TrainSearch from "./search/TrainSearch";
import MovieSearch from "./search/MovieSearch";
import axios from "axios";


function SearchBar() {
  const [activeTab, setActiveTab] = useState("flights");

  const renderSearch = () => {
    switch (activeTab) {
      case "flights":
        return <FlightSearch />;
      case "hotels":
        return <HotelSearch />;
      case "trains":
        return <TrainSearch />;
      case "movies":
        return <MovieSearch />;
      default:
        return <FlightSearch />;
    }
  };
  

 /*  return (
    <div className="bg-white rounded-xl shadow-xl w-[80%] p-6 ">

      {/* Tabs */
    /*   <div className="flex gap-6 border-b pb-3 mb-4">
        <button onClick={() => setActiveTab("flights")}>Flights</button>
        <button onClick={() => setActiveTab("hotels")}>Hotels</button>
        <button onClick={() => setActiveTab("trains")}>Trains</button>
        <button onClick={() => setActiveTab("movies")}>Movies</button>
      </div> */

      {/* Dynamic Search */}
      /* {renderSearch()}

    </div> */
  /* );
}*/

return (
  <div
    className="
      bg-white
      rounded-xl
      shadow-xl
      w-full
      sm:w-[95%]
      md:w-[90%]
      lg:w-[80%]
      mx-auto
      p-4
      sm:p-5
      md:p-6
    "
  >
    {/* Tabs */}
    <div
      className="
        flex
        flex-wrap
        justify-center
        sm:justify-start
        gap-2
        sm:gap-4
        md:gap-6
        border-b
        pb-3
        mb-4
        overflow-x-auto
        scrollbar-hide
      "
    >
      <button
        onClick={() => setActiveTab("flights")}
        className="
          px-3
          py-2
          text-sm
          sm:text-base
          whitespace-nowrap
          hover:text-blue-600
          transition
        "
      >
        Flights
      </button>

      <button
        onClick={() => setActiveTab("hotels")}
        className="
          px-3
          py-2
          text-sm
          sm:text-base
          whitespace-nowrap
          hover:text-blue-600
          transition
        "
      >
        Hotels
      </button>

      <button
        onClick={() => setActiveTab("trains")}
        className="
          px-3
          py-2
          text-sm
          sm:text-base
          whitespace-nowrap
          hover:text-blue-600
          transition
        "
      >
        Trains
      </button>

      <button
        onClick={() => setActiveTab("movies")}
        className="
          px-3
          py-2
          text-sm
          sm:text-base
          whitespace-nowrap
          hover:text-blue-600
          transition
        "
      >
        Movies
      </button>
    </div>

    {/* Dynamic Search Section */}
    <div className="w-full overflow-hidden">
      {renderSearch()}
    </div>
  </div>
);
}

export default SearchBar; 

