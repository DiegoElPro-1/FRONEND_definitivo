// src/components/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import heroImage from '../components/imagenes/hero.png'
import logo from '../components/imagenes/logo.png'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 40px", background: "#fff", borderBottom: "1px solid #e5e7eb",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: "#16a34a", display: "flex", alignItems: "center", gap: 8 }}>
          <img src={logo} alt="Recycling Points" style={{ height: 34, width: "auto" }} />
          Recycling Points
        </div>
        <nav style={{ display: "flex", gap: 28 }}>
          {["#inicio","#funciona","#beneficios","#faq"].map((href, i) => (
            <a key={i} href={href} style={{ color: "#374151", textDecoration: "none", fontSize: 14 }}>
              {["Inicio","Cómo funciona","Beneficios","Preguntas frecuentes"][i]}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/login" style={{
            padding: "8px 18px", borderRadius: 8, border: "1.5px solid #16a34a",
            color: "#16a34a", textDecoration: "none", fontSize: 14, fontWeight: 500
          }}>
            Iniciar sesión
          </Link>
          <Link to="/registro" style={{
            padding: "8px 18px", borderRadius: 8, background: "#16a34a",
            color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500
          }}>
            Regístrate
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section id="inicio" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "80px 40px", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        minHeight: "85vh"
      }}>
        <div style={{ maxWidth: 520 }}>
          <span style={{
            background: "#dcfce7", color: "#15803d", padding: "6px 14px",
            borderRadius: 20, fontSize: 13, fontWeight: 500
          }}>
            🌿 Juntos cuidamos el planeta
          </span>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: "#111", marginTop: 20, lineHeight: 1.2 }}>
            Recicla hoy,<br />
            <span style={{ color: "#29B15B" }}>gana beneficios</span><br />
            mañana.
          </h1>
          <p style={{ color: "#6b7280", fontSize: 17, marginTop: 16, lineHeight: 1.7 }}>
            Lleva tus residuos a supermercados aliados, acumula puntos
            y canjéalos por descuentos y recompensas.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Link to="/login" style={{
              padding: "12px 28px", borderRadius: 10, background: "#127235",
              color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15
            }}>
              Iniciar sesión
            </Link>
            <Link to="/registro" style={{
              padding: "12px 28px", borderRadius: 10, border: "2px solid #16a34a",
              color: "#16a34a", textDecoration: "none", fontWeight: 600, fontSize: 15
            }}>
              Regístrate gratis
            </Link>
          </div>
        </div>

        {/* IMAGEN HERO */}
        <div style={{ width: 550, height: 550, flexShrink: 0 }}>
          <img
            src={heroImage}
            alt="Reciclaje"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="funciona" style={{ padding: "80px 40px", background: "#fff" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 48 }}>
          ¿Cómo funciona?
        </h2>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: "bi-geo-alt-fill",  title: "1. Encuentra un punto",   desc: "Localiza el supermercado aliado más cercano a ti." },
            { icon: "bi-recycle",       title: "2. Entrega tus residuos", desc: "Lleva plástico, cartón, vidrio o metal y regístralos." },
            { icon: "bi-star-fill",     title: "3. Acumula puntos",       desc: "Cada kg reciclado te da puntos canjeables." },
            { icon: "bi-gift-fill",     title: "4. Canjea recompensas",   desc: "Obtén descuentos y beneficios exclusivos." },
          ].map((f, i) => (
            <div key={i} style={{
              background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14,
              padding: "28px 22px", width: 210, textAlign: "center"
            }}>
              <i className={`bi ${f.icon}`} style={{ fontSize: 36, color: "#16a34a" }}></i>
              <div style={{ fontWeight: 700, marginTop: 14, marginBottom: 8, color: "#111", fontSize: 15 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" style={{ padding: "80px 40px", background: "#f0fdf4" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 48 }}>
          Beneficios
        </h2>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: "bi-tree-fill",   text: "Ayudas al medio ambiente" },
            { icon: "bi-cash-coin",   text: "Ganas descuentos reales"  },
            { icon: "bi-phone-fill",  text: "Todo desde tu celular"    },
            { icon: "bi-people-fill", text: "Comunidad comprometida"   },
          ].map((b, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#fff", border: "1px solid #E4E4E4",
              borderRadius: 12, padding: "18px 24px",
              fontSize: 15, color: "#189A18", fontWeight: 500
            }}>
              <i className={`bi ${b.icon}`} style={{ fontSize: 24 }}></i>
              {b.text}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "80px 40px", background: "#fff" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 40 }}>
          Preguntas frecuentes
        </h2>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { q: "¿Es gratis registrarse?",           a: "Sí, el registro y uso de la plataforma es completamente gratuito." },
            { q: "¿Qué materiales puedo reciclar?",   a: "Plástico, cartón, papel, vidrio y metal en los puntos habilitados." },
            { q: "¿Cómo canjeo mis puntos?",          a: "Desde tu perfil en la sección Recompensas puedes ver y canjear tus puntos." },
            { q: "¿En qué ciudades está disponible?", a: "Actualmente en Cali y expandiéndonos a más ciudades de Colombia." },
          ].map((f, i) => (
            <div key={i} style={{
              background: "#f9fafb", border: "1px solid #e5e7eb",
              borderRadius: 12, padding: "18px 22px"
            }}>
              <div style={{ fontWeight: 600, color: "#111", marginBottom: 6, fontSize: 15 }}>
                {f.q}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: "center", padding: "28px 40px",
        background: "#16a34a", color: "#fff", fontSize: 14
      }}>
        <i className="bi bi-recycle me-2"></i>
        © 2026 EcoRecicla · Todos los derechos reservados
      </footer>

    </div>
  );
}