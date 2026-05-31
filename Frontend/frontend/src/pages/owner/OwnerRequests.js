// ─────────────────────────────────────────────────────────────
// frontend/src/pages/owner/OwnerRequests.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { toast } from "react-toastify";
import { uploadImagesToCloudinary } from "../../services/uploadService";

const API = `${process.env.REACT_APP_API_URL}/api/owners`;

const getRequestTypes = (hasHotel) => {
  if (!hasHotel) return [
    { value: "add_hotel", label: "➕ Add New Hotel", desc: "Request to list a new hotel on the platform" },
  ];
  return [
    { value: "update_hotel",     label: "✏️ Update Hotel Details", desc: "Request changes to price, amenities, description" },
    { value: "delete_hotel",     label: "🗑️ Remove Hotel",         desc: "Request to remove your hotel listing"             },
    { value: "cancel_booking",   label: "❌ Cancel a Booking",     desc: "Request to cancel a guest's booking"              },
    { value: "room_availability",label: "🛏️ Change Room Count",    desc: "Request to update available rooms"                },
  ];
};

const STATUS_COLORS = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

// ── Shimmer ───────────────────────────────────────────────────
function OwnerRequestsShimmer() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between gap-3 animate-pulse">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-14 bg-gray-200 rounded-lg" />
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-28 sm:w-36" />
        </div>
        <div className="h-9 w-28 sm:w-32 bg-gray-200 rounded-lg" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-2/5 sm:w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-3/4 sm:w-3/5" />
                {/* Image thumbnails row */}
                <div className="flex gap-2 mt-1">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-12 h-9 sm:w-14 sm:h-10 bg-gray-200 rounded-lg" />
                  ))}
                </div>
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-6 w-16 sm:w-20 bg-gray-200 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
function OwnerRequests() {
  const [requests, setRequests]           = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [reason, setReason]               = useState("");
  const [details, setDetails]             = useState({});
  const [loading, setLoading]             = useState(false);
  const [pageLoading, setPageLoading]     = useState(true);
  const [myHotel, setMyHotel]             = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls]     = useState([]);
  const [uploading, setUploading]         = useState(false);
  const [uploadedImages, setUploadedImages]   = useState([]);
  const [uploadProgress, setUploadProgress]   = useState({});
  const [type, setType]                   = useState("add_hotel");
  const fileInputRef                      = useRef(null);
  const navigate                          = useNavigate();

  useEffect(() => { init(); }, []);

  const init = async () => {
    await Promise.all([fetchRequests(), fetchMyHotel()]);
    setPageLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyHotel = async () => {
    try {
      const res = await axios.get(`${API}/hotel`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMyHotel(res.data);
      setType("update_hotel");
    } catch {
      setMyHotel(null);
      setType("add_hotel");
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { toast.error("Maximum 5 images allowed"); return; }
    setSelectedFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
    setUploadedImages([]);
    setUploadProgress({});
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) { toast.error("Please select images first"); return; }
    setUploading(true);
    try {
      const urls = await uploadImagesToCloudinary(selectedFiles, (index, percent) => {
        setUploadProgress((prev) => ({ ...prev, [index]: percent }));
      });
      setUploadedImages(urls);
      toast.success(`${urls.length} image(s) uploaded to Cloudinary ✅`);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally { setUploading(false); }
  };

  const removeImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    setUploadedImages([]);
    setUploadProgress({});
  };

  const resetForm = () => {
    setShowForm(false); setType("add_hotel"); setReason(""); setDetails({});
    setSelectedFiles([]); setPreviewUrls([]); setUploadedImages([]); setUploadProgress({});
  };

  const handleSubmit = async () => {
    if (!reason) return toast.error("Please provide a reason");
    if (type === "add_hotel") {
      if (!details.name || !details.district || !details.state) return toast.error("Name, district, state required");
      if (uploadedImages.length === 0) return toast.error("Please upload at least one image");
    }
    try {
      setLoading(true);
      const finalDetails = { ...details, ...(type === "add_hotel" && { images: uploadedImages }) };
      const hotelId = ["delete_hotel", "update_hotel", "room_availability"].includes(type) ? myHotel?._id : undefined;
      await axios.post(`${API}/request`, { type, details: finalDetails, reason, hotelId },
        { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success("Request submitted to admin ✅");
      resetForm(); fetchRequests();
    } catch { toast.error("Failed to submit request"); }
    finally { setLoading(false); }
  };

  if (pageLoading) return <OwnerRequestsShimmer />;

  const REQUEST_TYPES = getRequestTypes(!!myHotel);
  const hasPendingAddRequest = requests.some(r => r.type === "add_hotel" && r.status === "pending");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => navigate("/owner/dashboard")}
            className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">
            ← Back
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 whitespace-nowrap">📝 My Requests</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={hasPendingAddRequest && !myHotel}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0">
          {hasPendingAddRequest && !myHotel ? "⏳ Pending..." : "+ New Request"}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── New request form ── */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-5 sm:mb-6">
            <h2 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Submit New Request</h2>

            {/* Hotel info banner */}
            {myHotel ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm font-bold text-blue-800">🏨 Your Hotel: {myHotel.name}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {myHotel.district}, {myHotel.state} · ₹{myHotel.pricePerNight}/night · {myHotel.rooms} rooms
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  To add another hotel, first request deletion of your current hotel.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm font-bold text-yellow-800">📋 No Hotel Listed Yet</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Submit a request to add your hotel. Admin will review and approve it.
                </p>
              </div>
            )}

            {/* Request type selector */}
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Request Type:</p>
            <div className="grid grid-cols-1 gap-2 mb-5">
              {REQUEST_TYPES.map((r) => (
                <button key={r.value} type="button"
                  onClick={() => { setType(r.value); setDetails({}); setSelectedFiles([]); setPreviewUrls([]); setUploadedImages([]); setUploadProgress({}); }}
                  className={`text-left p-3 rounded-xl border-2 transition ${type === r.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className="font-medium text-xs sm:text-sm">{r.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>

            {/* ── Add hotel fields ── */}
            {type === "add_hotel" && (
              <div className="space-y-4 mb-4">
                {/* 2-col on sm+, 1-col on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { field: "name",          placeholder: "Hotel Name",                  full: true  },
                    { field: "district",      placeholder: "District"                                 },
                    { field: "state",         placeholder: "State"                                    },
                    { field: "address",       placeholder: "Full Address",                full: true  },
                    { field: "type",          placeholder: "Type (luxury/budget/resort)"              },
                    { field: "pricePerNight", placeholder: "Price Per Night (₹)"                      },
                    { field: "rooms",         placeholder: "Total Rooms"                              },
                  ].map(({ field, placeholder, full }) => (
                    <div key={field} className={full ? "sm:col-span-2" : ""}>
                      <label className="text-xs font-medium text-gray-500 capitalize">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        placeholder={placeholder}
                        onChange={(e) => setDetails({ ...details, [field]: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm mt-1" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500">Amenities (comma separated)</label>
                    <input
                      placeholder="wifi, pool, parking, breakfast, gym"
                      onChange={(e) => setDetails({ ...details, amenities: e.target.value.split(",").map((a) => a.trim()) })}
                      className="w-full border rounded-lg p-2 text-sm mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    <textarea rows={3} placeholder="Describe your hotel..."
                      onChange={(e) => setDetails({ ...details, description: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm mt-1 resize-none" />
                  </div>
                </div>

                {/* Image upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      📸 Hotel Images <span className="text-red-400">*</span>
                      <span className="text-gray-400 font-normal ml-1">(Max 5, 5MB each)</span>
                    </p>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                      ☁️ Cloudinary CDN
                    </span>
                  </div>
                  <input ref={fileInputRef} type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple className="hidden" onChange={handleFileSelect} />

                  {previewUrls.length > 0 ? (
                    <div className="space-y-3">
                      {/* 3-col grid for previews */}
                      <div className="grid grid-cols-3 gap-2">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt={`preview-${i}`}
                              className="w-full h-20 sm:h-24 object-cover rounded-lg" />
                            {uploading && uploadProgress[i] !== undefined && uploadProgress[i] < 100 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 rounded-b-lg p-1">
                                <div className="bg-gray-300 rounded-full h-1.5">
                                  <div className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress[i]}%` }} />
                                </div>
                                <p className="text-white text-xs text-center mt-0.5">{uploadProgress[i]}%</p>
                              </div>
                            )}
                            {uploadedImages.length > 0 && (
                              <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✓</div>
                            )}
                            {!uploading && (
                              <button type="button" onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                            )}
                          </div>
                        ))}
                        {previewUrls.length < 5 && !uploading && (
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition text-2xl">+</button>
                        )}
                      </div>
                      {uploadedImages.length === 0 ? (
                        <button type="button" onClick={handleUploadImages} disabled={uploading}
                          className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition disabled:opacity-60">
                          {uploading
                            ? `☁️ Uploading... ${Math.min(...Object.values(uploadProgress).filter(v => v !== undefined), 100) || 0}%`
                            : "☁️ Upload to Cloudinary"}
                        </button>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <p className="text-green-600 text-xs sm:text-sm font-medium">✅ {uploadedImages.length} image(s) uploaded!</p>
                          <p className="text-green-400 text-xs mt-0.5">Images permanently hosted in cloud</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full py-6 sm:py-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition">
                      <span className="text-4xl">📷</span>
                      <span className="text-xs sm:text-sm font-medium">Click to select images</span>
                      <span className="text-xs">JPEG, PNG, WEBP — max 5MB each</span>
                      <span className="text-xs text-blue-400">Powered by Cloudinary CDN ☁️</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Update hotel fields ── */}
            {type === "update_hotel" && (
              <div className="grid grid-cols-1 gap-3 mb-4">
                {myHotel && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 font-medium">
                      Updating: <span className="font-bold text-blue-800">{myHotel.name}</span>
                    </p>
                  </div>
                )}
                {["pricePerNight", "description", "amenities"].map((field) => (
                  <div key={field}>
                    <label className="text-xs font-medium text-gray-500 capitalize">{field}</label>
                    <input placeholder={`New ${field}`}
                      onChange={(e) => setDetails({ ...details, [field]: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm mt-1" />
                  </div>
                ))}
              </div>
            )}

            {/* ── Room availability fields ── */}
            {type === "room_availability" && (
              <div className="mb-4">
                {myHotel && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-blue-600 font-medium">
                      Hotel: <span className="font-bold text-blue-800">{myHotel.name}</span> · Current rooms: {myHotel.rooms}
                    </p>
                  </div>
                )}
                <label className="text-xs font-medium text-gray-500">New Room Count</label>
                <input type="number" min="1" placeholder="e.g. 25"
                  onChange={(e) => setDetails({ rooms: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
            )}

            {/* ── Delete hotel warning ── */}
            {type === "delete_hotel" && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-600 font-medium">⚠️ This will request permanent removal</p>
                {myHotel
                  ? <p className="text-xs text-gray-600 mt-2">Hotel: <span className="font-bold">{myHotel.name}</span></p>
                  : <p className="text-xs text-red-400 mt-2">No hotel found.</p>}
              </div>
            )}

            {/* ── Cancel booking field ── */}
            {type === "cancel_booking" && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500">Booking ID to Cancel</label>
                <input placeholder="Paste booking ID"
                  onChange={(e) => setDetails({ bookingId: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
            )}

            {/* ── Reason textarea ── */}
            <div className="mb-4">
              <label className="text-xs sm:text-sm font-medium text-gray-600">
                Reason / Notes <span className="text-red-400">*</span>
              </label>
              <textarea rows={3} placeholder="Explain your request..." value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm mt-1 resize-none" />
            </div>

            {/* ── Form actions — full width on mobile ── */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading || (type === "add_hotel" && uploadedImages.length === 0)}
                className="flex-1 sm:flex-none bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 sm:flex-none bg-gray-100 text-gray-600 px-5 sm:px-6 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Request list ── */}
        <div className="space-y-3 sm:space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm">No requests submitted yet</p>
              <p className="text-xs sm:text-sm mt-1">Click "+ New Request" to submit one</p>
            </div>
          ) : requests.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                    {REQUEST_TYPES.find((t) => t.value === r.type)?.label || r.type}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 break-words">{r.reason}</p>

                  {/* Hotel images preview */}
                  {r.type === "add_hotel" && r.details?.images?.length > 0 && (
                    <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
                      {r.details.images.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt={`hotel-${i}`}
                          className="w-12 h-9 sm:w-14 sm:h-10 object-cover rounded-lg" />
                      ))}
                      {r.details.images.length > 3 && (
                        <div className="w-12 h-9 sm:w-14 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                          +{r.details.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_COLORS[r.status]}`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>

              {/* Admin note */}
              {r.adminNote && (
                <div className="mt-3 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-blue-600">Admin Note:</p>
                  <p className="text-xs sm:text-sm text-blue-800 mt-0.5 break-words">{r.adminNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OwnerRequests;