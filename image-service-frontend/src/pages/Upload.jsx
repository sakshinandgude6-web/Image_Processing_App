import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an image");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      await api.post("/api/images", formData);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card form-card">
        <h2>Upload Image</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <div style={{ marginTop: 15 }}>
            <button disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => navigate("/dashboard")}
              style={{ marginLeft: 10 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
