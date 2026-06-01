import Navbar from "../component/Navbar";
import Searchbar from "../component/Searchbar";
/* import hero from "../../assets/hero-bg.png"; */
import Movecard from "../component/Movecard";
import Footer from "../component/footer";
import ChatBot from "../component/ChatBot";
function Home() {
  return (
  <>
    <div
      className="
        min-h-screen
        bg-cover
        bg-center
        flex
        flex-col
        justify-between
      "
      style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1546349749-c95c55859424?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
      }}
    >
      {/* Navbar */}
      <div className="w-full fixed top-0 left-0 z-13 ">
        <Navbar />

        
      </div>
      <div className="text-center text-yellow-50  sm:mt-10 text-2xl sm:text-4xl font-bold px-4">
        {/*  <h1 className="mt-38">Book Your Next Adventure</h1> */}

          <h1 className="mt-38">Book Your Next Adventure</h1>
        </div>
      
      {/* Searchbar Section */}
      <div
        className="
          flex
          justify-center
          items-center
          px-4
        
          sm:px-6
          md:px-8
          lg:px-10
          py-6
          sm:py-8
          md:py-10
        "
      >
        
        <Searchbar />
      </div>

      {/* Movie Card Section */}
      <div
        className="
          px-4
          sm:px-6
          md:px-8
          lg:px-10
          pb-6
          sm:pb-8
          md:pb-10
        "
      >
        <Movecard />
      </div>
    </div>

    {/* Footer */}
    <Footer />
    {/* Chat Bot */}
    <ChatBot />
  </>
);
}

export default Home;