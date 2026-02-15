import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ImageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    width: "",
    height: "",
    format: "jpg",
    grayscale: false,
  });

  useEffect(() => {
    fetchImage();
  }, [id]);

  const fetchImage = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/images/${id}`);

      setImage(res.data.image);
      setResult(res.data.transformedImage || null);
    } catch (err) {
      setError("Failed to load image");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTransform = async (e) => {
    e.preventDefault();

    try {
      setProcessing(true);
      setError("");

      const payload = {
        transformations: {
          resize:
            form.width && form.height
              ? {
                  width: Number(form.width),
                  height: Number(form.height),
                }
              : undefined,
          format: form.format,
          filters: {
            grayscale: form.grayscale,
          },
        },
      };

      const res = await api.post(`/api/images/${id}/transform`, payload);

      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Transformation failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!image) return <p>Image not found</p>;

  return (
    <div className="page">
      <button className="secondary" onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      <h2 style={{ marginTop: 10 }}>Image Details</h2>

      {error && <div className="error">{error}</div>}

      <div className="two-col">
        <div className="card preview">
          <h4>Original</h4>
          <img src={image.originalUrl} alt="" />
          <p>
            {image.width} x {image.height}
          </p>
        </div>

        <div className="card">
          <h4>Transform</h4>

          <form onSubmit={handleTransform}>
            <input
              type="number"
              name="width"
              placeholder="Width"
              value={form.width}
              onChange={handleChange}
            />

            <input
              type="number"
              name="height"
              placeholder="Height"
              value={form.height}
              onChange={handleChange}
            />

            <select name="format" value={form.format} onChange={handleChange}>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WEBP</option>
            </select>

            <label style={{ display: "block", marginBottom: 12 }}>
              <input
                type="checkbox"
                name="grayscale"
                checked={form.grayscale}
                onChange={handleChange}
              />{" "}
              Grayscale
            </label>

            <button disabled={processing}>
              {processing ? "Processing..." : "Apply transform"}
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="result-box">
          <h3>Result</h3>

          <img src={result.outputUrl} alt="" style={{ maxWidth: "100%" }} />

          <p>
            {result.width} x {result.height} | {result.format}
          </p>
        </div>
      )}
    </div>
  );
}
