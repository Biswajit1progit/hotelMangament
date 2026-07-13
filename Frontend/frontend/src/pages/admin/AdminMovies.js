import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  searchTmdb,
  importMovie,
  getMovies,
  setMovieActive,
  getTheaters,
  createTheater,
  deleteTheater,
  createShow,
  deleteShow,
  getShowsForMovie,
} from "../../services/Movieservice";

const SECTIONS = [
  { key: "movies", label: "🎬 Movies" },
  { key: "theaters", label: "🏢 Theaters" },
  { key: "shows", label: "🕐 Shows" },
];

function AdminMovies({ dark }) {
  const [section, setSection] = useState("movies");

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1px solid var(--border)", fontSize: 13,
    color: "var(--text-primary)", background: "var(--surface2)",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, display: "block" };

  return (
    <div>
      {/* ── Sub-tabs ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: `1px solid ${section === s.key ? "#e11d48" : "var(--border)"}`,
              background: section === s.key ? "#e11d48" : "var(--surface2)",
              color: section === s.key ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "movies" && <MoviesSection inputStyle={inputStyle} labelStyle={labelStyle} />}
      {section === "theaters" && <TheatersSection inputStyle={inputStyle} labelStyle={labelStyle} />}
      {section === "shows" && <ShowsSection inputStyle={inputStyle} labelStyle={labelStyle} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOVIES — search TMDB, import, list, toggle active
═══════════════════════════════════════════════════════════════ */
function MoviesSection({ inputStyle, labelStyle }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMovies(); }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      toast.error("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await searchTmdb(query);
      setResults(data.results);
    } catch (err) {
      toast.error(err.response?.data?.message || "TMDB search failed — check TMDB_API_KEY in backend .env");
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (tmdbId) => {
    setImportingId(tmdbId);
    try {
      await importMovie(tmdbId);
      toast.success("Movie imported ✅");
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to import movie");
    } finally {
      setImportingId(null);
    }
  };

  const handleToggleActive = async (movie) => {
    try {
      await setMovieActive(movie._id, !movie.isActive);
      toast.success(movie.isActive ? "Movie hidden" : "Movie shown");
      fetchMovies();
    } catch (err) {
      toast.error("Failed to update movie");
    }
  };

  const alreadyImported = (tmdbId) => movies.some((m) => m.tmdbId === tmdbId);

  return (
    <div>
      {/* Search + import */}
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow)", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Search TMDB to import</h3>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text" placeholder="e.g. Inception" value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={inputStyle}
          />
          <button
            type="submit" disabled={searching}
            style={{ background: "#e11d48", color: "#fff", padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </form>

        {results.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {results.slice(0, 12).map((r) => {
              const imported = alreadyImported(r.tmdbId);
              return (
                <div key={r.tmdbId} style={{ display: "flex", gap: 10, background: "var(--surface2)", borderRadius: 12, padding: 10 }}>
                  <img
                    src={r.posterUrl || "/fallback.jpg"}
                    alt={r.title}
                    style={{ width: 50, height: 75, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>{r.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0" }}>
                      {r.releaseDate?.slice(0, 4)} {r.voteAverage > 0 && `· ⭐ ${r.voteAverage.toFixed(1)}`}
                    </p>
                    <button
                      onClick={() => handleImport(r.tmdbId)}
                      disabled={imported || importingId === r.tmdbId}
                      style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, border: "none",
                        cursor: imported ? "default" : "pointer",
                        background: imported ? "#dcfce7" : "#e11d48",
                        color: imported ? "#15803d" : "#fff",
                      }}
                    >
                      {imported ? "✓ Imported" : importingId === r.tmdbId ? "Importing…" : "+ Import"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Imported movies list */}
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Imported Movies</h3>
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : movies.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No movies imported yet — search above to get started</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {movies.map((m) => (
            <div key={m._id} style={{ background: "var(--surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)", opacity: m.isActive ? 1 : 0.5 }}>
              <img src={m.posterUrl || "/fallback.jpg"} alt={m.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>{m.title}</p>
                <button
                  onClick={() => handleToggleActive(m)}
                  style={{ fontSize: 11, fontWeight: 600, marginTop: 6, background: "none", border: "none", color: m.isActive ? "#ef4444" : "#22c55e", cursor: "pointer", padding: 0 }}
                >
                  {m.isActive ? "Hide" : "Unhide"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEATERS — simple create/list/delete
═══════════════════════════════════════════════════════════════ */
function TheatersSection({ inputStyle, labelStyle }) {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", address: "", screens: 1 });

  useEffect(() => { fetchTheaters(); }, []);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const data = await getTheaters();
      setTheaters(data);
    } catch (err) {
      toast.error("Failed to load theaters");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTheater({ ...form, screens: Number(form.screens) });
      toast.success("Theater created ✅");
      setForm({ name: "", city: "", address: "", screens: 1 });
      setShowForm(false);
      fetchTheaters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create theater");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this theater?")) return;
    try {
      await deleteTheater(id);
      toast.success("Theater deleted");
      fetchTheaters();
    } catch (err) {
      toast.error("Failed to delete theater");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => setShowForm((s) => !s)}
          style={{ background: "#e11d48", color: "#fff", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ New Theater"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "var(--surface)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow)", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="PVR Esplanade" />
            </div>
            <div>
              <label style={labelStyle}>City *</label>
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} placeholder="Bhubaneswar" />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="Optional" />
            </div>
            <div>
              <label style={labelStyle}>Screens</label>
              <input type="number" min="1" value={form.screens} onChange={(e) => setForm({ ...form, screens: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 14, background: "#e11d48", color: "#fff", padding: "9px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
            Create Theater
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : theaters.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No theaters yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {theaters.map((t) => (
            <div key={t._id} style={{ background: "var(--surface)", borderRadius: 14, padding: "14px 16px", boxShadow: "var(--shadow)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0" }}>{t.city} {t.address && `· ${t.address}`}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{t.screens} screen{t.screens !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => handleDelete(t._id)} style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHOWS — create a screening (movie + theater + seat config)
═══════════════════════════════════════════════════════════════ */
function ShowsSection({ inputStyle, labelStyle }) {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    theaterId: "", screenNumber: 1, showDate: "", showTime: "",
    rows: 5, seatsPerRow: 8, standardPrice: 200, premiumPrice: 350, premiumRows: "A,B",
  });

  useEffect(() => {
    getMovies().then(setMovies).catch(() => toast.error("Failed to load movies"));
    getTheaters().then(setTheaters).catch(() => toast.error("Failed to load theaters"));
  }, []);

  useEffect(() => {
    if (selectedMovie) fetchShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMovie]);

  const fetchShows = async () => {
    setLoadingShows(true);
    try {
      const data = await getShowsForMovie(selectedMovie);
      setShows(data);
    } catch (err) {
      toast.error("Failed to load shows");
    } finally {
      setLoadingShows(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !form.theaterId) {
      toast.error("Select a movie and theater");
      return;
    }
    try {
      await createShow({
        movieId: selectedMovie,
        theaterId: form.theaterId,
        screenNumber: Number(form.screenNumber),
        showDate: form.showDate,
        showTime: form.showTime,
        rows: Number(form.rows),
        seatsPerRow: Number(form.seatsPerRow),
        standardPrice: Number(form.standardPrice),
        premiumPrice: Number(form.premiumPrice),
        premiumRows: form.premiumRows.split(",").map((r) => r.trim().toUpperCase()).filter(Boolean),
      });
      toast.success("Show created ✅");
      setShowForm(false);
      fetchShows();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create show");
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm("Delete this show?")) return;
    try {
      await deleteShow(id);
      toast.success("Show deleted");
      fetchShows();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete show");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Select a movie to manage its shows</label>
        <select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)} style={inputStyle}>
          <option value="">-- Choose a movie --</option>
          {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
      </div>

      {selectedMovie && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button
              onClick={() => setShowForm((s) => !s)}
              style={{ background: "#e11d48", color: "#fff", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              {showForm ? "Cancel" : "+ New Show"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ background: "var(--surface)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow)", marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Theater *</label>
                  <select required value={form.theaterId} onChange={(e) => setForm({ ...form, theaterId: e.target.value })} style={inputStyle}>
                    <option value="">Select theater</option>
                    {theaters.map((t) => <option key={t._id} value={t._id}>{t.name} — {t.city}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Screen #</label>
                  <input type="number" min="1" value={form.screenNumber} onChange={(e) => setForm({ ...form, screenNumber: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Show Date *</label>
                  <input required type="date" value={form.showDate} onChange={(e) => setForm({ ...form, showDate: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Show Time *</label>
                  <input required type="time" value={form.showTime} onChange={(e) => setForm({ ...form, showTime: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Rows</label>
                  <input type="number" min="1" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Seats per row</label>
                  <input type="number" min="1" value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Standard price (₹)</label>
                  <input type="number" min="0" value={form.standardPrice} onChange={(e) => setForm({ ...form, standardPrice: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Premium price (₹)</label>
                  <input type="number" min="0" value={form.premiumPrice} onChange={(e) => setForm({ ...form, premiumPrice: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Premium rows (comma-separated)</label>
                  <input value={form.premiumRows} onChange={(e) => setForm({ ...form, premiumRows: e.target.value })} style={inputStyle} placeholder="A,B" />
                </div>
              </div>
              <button type="submit" style={{ marginTop: 14, background: "#e11d48", color: "#fff", padding: "9px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Create Show
              </button>
            </form>
          )}

          {loadingShows ? (
            <p style={{ color: "var(--text-muted)" }}>Loading shows…</p>
          ) : shows.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No shows for this movie yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {shows.map((s) => (
                <div key={s._id} style={{ background: "var(--surface)", borderRadius: 12, padding: "12px 16px", boxShadow: "var(--shadow)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.theater?.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0" }}>
                      {new Date(s.showDate).toLocaleDateString("en-IN")} · {s.showTime} · {s.availableSeats}/{s.totalSeats} seats free
                    </p>
                  </div>
                  <button onClick={() => handleDeleteShow(s._id)} style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminMovies;