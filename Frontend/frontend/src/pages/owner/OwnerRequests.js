import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { toast } from "react-toastify";

const API = `${process.env.REACT_APP_API_URL}/api/owners`;
const UPLOAD_API = `${process.env.REACT_APP_API_URL}/api/upload/images`;

const REQUEST_TYPES = [
  { value: "add_hotel", label: "➕ Add New Hotel", desc: "Request to list a new hotel on the platform" },
  { value: "update_hotel", label: "✏️ Update Hotel Details", desc: "Request changes to price, amenities, description" },
  { value: "delete_hotel", label: "🗑️ Remove Hotel", desc: "Request to remove your hotel listing" },
  { value: "cancel_booking", label: "❌ Cancel a Booking", desc: "Request to cancel a guest's booking" },
  { value: "room_availability", label: "🛏️ Change Room Count", desc: "Request to update available rooms" },
];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

function OwnerRequests() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("add_hotel");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { toast.error("Maximum 5 images allowed"); return; }
    setSelectedFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
    setUploadedImages([]);
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) { toast.error("Please select images first"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append("images", f));
      const res = await axios.post(UPLOAD_API, formData, {
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
      });
      setUploadedImages(res.data.images);
      toast.success(`${res.data.images.length} image(s) uploaded ✅`);
    } catch (err) {
      toast.error("Image upload failed");
    } finally { setUploading(false); }
  };

  const removeImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    setUploadedImages([]);
  };

  const resetForm = () => {
    setShowForm(false); setType("add_hotel"); setReason("");
    setDetails({}); setSelectedFiles([]); setPreviewUrls([]); setUploadedImages([]);
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
      await axios.post(`${API}/request`, { type, details: finalDetails, reason },
        { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success("Request submitted to admin ✅");
      resetForm(); fetchRequests();
    } catch (err) { toast.error("Failed to submit request"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/owner/dashboard")} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">📝 My Requests</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + New Request
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Submit New Request</h2>

            {/* Type Selection */}
            <p className="text-sm font-medium text-gray-600 mb-2">Request Type:</p>
            <div className="grid grid-cols-1 gap-2 mb-5">
              {REQUEST_TYPES.map((r) => (
                <button key={r.value} type="button"
                  onClick={() => { setType(r.value); setDetails({}); setSelectedFiles([]); setPreviewUrls([]); setUploadedImages([]); }}
                  className={`text-left p-3 rounded-xl border-2 transition ${type === r.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>

            {/* Add Hotel Form */}
            {type === "add_hotel" && (
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: "name", placeholder: "Hotel Name", full: true },
                    { field: "district", placeholder: "District" },
                    { field: "state", placeholder: "State" },
                    { field: "address", placeholder: "Full Address", full: true },
                    { field: "type", placeholder: "Type (luxury/budget/resort)" },
                    { field: "pricePerNight", placeholder: "Price Per Night (₹)" },
                    { field: "rooms", placeholder: "Total Rooms" },
                  ].map(({ field, placeholder, full }) => (
                    <div key={field} className={full ? "col-span-2" : ""}>
                      <label className="text-xs font-medium text-gray-500 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                      <input placeholder={placeholder}
                        onChange={(e) => setDetails({ ...details, [field]: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm mt-1" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500">Amenities (comma separated)</label>
                    <input placeholder="wifi, pool, parking, breakfast, gym"
                      onChange={(e) => setDetails({ ...details, amenities: e.target.value.split(",").map((a) => a.trim()) })}
                      className="w-full border rounded-lg p-2 text-sm mt-1" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    <textarea rows={3} placeholder="Describe your hotel..."
                      onChange={(e) => setDetails({ ...details, description: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm mt-1 resize-none" />
                  </div>
                </div>

                {/* ✅ Image Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    📸 Hotel Images <span className="text-red-400">*</span>
                    <span className="text-gray-400 font-normal ml-1">(Max 5, 5MB each)</span>
                  </p>
                  <input ref={fileInputRef} type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple className="hidden" onChange={handleFileSelect} />

                  {previewUrls.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt={`preview-${i}`} className="w-full h-24 object-cover rounded-lg" />
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                            {uploadedImages.length > 0 && (
                              <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✓</div>
                            )}
                          </div>
                        ))}
                        {previewUrls.length < 5 && (
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition text-2xl">+</button>
                        )}
                      </div>
                      {uploadedImages.length === 0 ? (
                        <button type="button" onClick={handleUploadImages} disabled={uploading}
                          className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition disabled:opacity-60">
                          {uploading ? "⏳ Uploading..." : "☁️ Upload Images to Server"}
                        </button>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                          <p className="text-green-600 text-sm font-medium">✅ {uploadedImages.length} image(s) uploaded!</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition">
                      <span className="text-4xl">📷</span>
                      <span className="text-sm font-medium">Click to select images</span>
                      <span className="text-xs">JPEG, PNG, WEBP — max 5MB each</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {type === "update_hotel" && (
              <div className="grid grid-cols-1 gap-3 mb-4">
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

            {type === "room_availability" && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500">New Room Count</label>
                <input type="number" min="1" placeholder="e.g. 25"
                  onChange={(e) => setDetails({ rooms: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
            )}

            {type === "cancel_booking" && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500">Booking ID to Cancel</label>
                <input placeholder="Paste booking ID"
                  onChange={(e) => setDetails({ bookingId: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
            )}

            {/* Reason */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">Reason / Notes <span className="text-red-400">*</span></label>
              <textarea rows={3} placeholder="Explain your request..." value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm mt-1 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleSubmit}
                disabled={loading || (type === "add_hotel" && uploadedImages.length === 0)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button onClick={resetForm}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p>No requests submitted yet</p>
              <p className="text-sm mt-1">Click "+ New Request" to submit one</p>
            </div>
          ) : requests.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {REQUEST_TYPES.find((t) => t.value === r.type)?.label || r.type}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{r.reason}</p>
                  {r.type === "add_hotel" && r.details?.images?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {r.details.images.slice(0, 3).map((img, i) => (
                        <img key={i} src={`${process.env.REACT_APP_API_URL}${img}`}
                          alt={`hotel-${i}`} className="w-14 h-10 object-cover rounded-lg" />
                      ))}
                      {r.details.images.length > 3 && (
                        <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                          +{r.details.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ml-3 ${STATUS_COLORS[r.status]}`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>
              {r.adminNote && (
                <div className="mt-3 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-blue-600">Admin Note:</p>
                  <p className="text-sm text-blue-800 mt-0.5">{r.adminNote}</p>
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