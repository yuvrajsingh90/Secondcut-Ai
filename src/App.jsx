import { useState , useEffect } from "react";
import Auth from "./Auth";
import {supabase} from "./supabaseClient";
import Dashboard from './Dashboard'; // <--- यह लाइन जोड़ें
import Login from './Login'; // (अगर Login अलग फाइल में है)

function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const removeBackground = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "https://secondcut-ai.onrender.com/remove-background",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Background removal failed");
      }

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);

      setResult(resultUrl);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Second Cut AI</h1>
      <p>Remove image backgrounds in one click.</p>

      <label className="upload-btn">
        Upload Image
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </label>

      {preview && (
        <div className="preview">
          <h3>Original Image</h3>
          <img src={preview} alt="Original" />

          <button onClick={removeBackground} disabled={loading}>
            {loading ? "Removing..." : "Remove Background"}
          </button>
        </div>
      )}

      {result && (
        <div className="preview">
          <h3>Result</h3>
          <img src={result} alt="Background removed" />

          <a href={result} download="second-cut-result.png">
            <button>Download</button>
          </a>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. मौजूदा सेशन की जांच करें
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setLoading(false);
    };

    checkSession();

    // 2. ऑथेंटिकेशन स्टेट में बदलाव (लॉगिन/लॉगआउट) को रियल-टाइम में सुनें
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // सेशन चेक होने तक लोडिंग दिखाएगा
  }

  return (
    <div>
      {loggedIn ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;