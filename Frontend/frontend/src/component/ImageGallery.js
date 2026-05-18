/* function ImageGallery({ images }) {

  const getImageSrc = (img) => {
  if (!img) return "/fallback.jpg";

  // ✅ if already full URL
  if (img.startsWith("http")) {
    return img;
  } */

  // ✅ if local image
/*   return `${process.env.REACT_APP_API_URL}${img}`;
};
  return (
    <div className="flex gap-2 w-full h-full   scrollbar-hide rounded-lg ">
      {images?.map((img, i) => (
      <img
       key={i}
       src={getImageSrc(img)}
       className="rounded-lg  W-full h-full object-cover"
      />
  ))}
    </div>
  );
}

export default ImageGallery; */
import { useState } from "react";

function ImageGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getImageSrc = (img) => {
    if (!img) return "/fallback.jpg";
    if (img.startsWith("http")) return img;
    return `${process.env.REACT_APP_API_URL}${img}`;
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      
      {/* ✅ Main Image */}
      <div className="w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden relative">
        <img
          src={getImageSrc(images[activeIndex])}
          alt={`hotel-${activeIndex}`}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Image counter badge */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>

        {/* ✅ Prev/Next arrows — only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ‹
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* ✅ Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition ${
                activeIndex === i
                  ? "border-blue-500 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img
                src={getImageSrc(img)}
                alt={`thumb-${i}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;