import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ pts, setView }) {
  const [foto, setFoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedFoto = localStorage.getItem("perfilFoto");
    if (savedFoto) setFoto(savedFoto);

    const handler = (e) => {
      setFoto(e.detail);
      localStorage.setItem("perfilFoto", e.detail);
    };

    window.addEventListener("perfilFoto", handler);
    return () => window.removeEventListener("perfilFoto", handler);
  }, []);

  return (
    <nav
      className="navbar bg-white border-bottom px-3 py-2"
      style={{ borderBottom: "2px solid #16a34a" }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">

        {/* LOGO */}
        <a className="navbar-brand mb-0" href="#">
          <span className="fw-bold text-success fs-5">Recycling Points</span>
          <br />
          <small className="text-muted fw-normal" style={{ fontSize: 11 }}>
            Recicla y gana
          </small>
        </a>

        <div className="d-flex align-items-center gap-2"></div>

        <div className="position-relative d-inline-block">
          <div className="d-flex align-items-center justify-content-end gap-2">

            {/* PERFIL (foto dinámica) */}
            <div
              className="rounded-circle bg-success-subtle border border-success d-flex align-items-center justify-content-center fw-bold text-success"
              role="button"
              onClick={() => navigate("/perfil")}
              title="Mi perfil"
              style={{ width: 42, height: 42 }}
            >
              {foto ? (
                <img
                  src={foto}
                  alt="perfil"
                  className="rounded-circle"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                "AG"
              )}
            </div>

          </div>
        </div>

      </div>
    </nav>
  );
}