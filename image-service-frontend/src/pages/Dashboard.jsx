import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchImages();
  }, [page]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/images?page=${page}&limit=10`);
      setImages(res.data.results);
    } catch (err) {
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <h2>My Images</h2>

        <div>
          <button onClick={() => navigate("/upload")}>Upload</button>

          <button
            className="secondary"
            style={{ marginLeft: 10 }}
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div className="error">{error}</div>}

      {!loading && images.length === 0 && <p>No images yet.</p>}

      <div className="grid">
        {images.map((img) => (
          <div
            key={img._id}
            className="image-card"
            onClick={() => navigate(`/images/${img._id}`)}
          >
            <img src={img.originalUrl} alt="" />
            <small>
              {img.width}x{img.height}
            </small>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>Page {page}</span>

        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
