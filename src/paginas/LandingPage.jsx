// src/components/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from '../components/imagenes/hero.png'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 }
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.15 } },
  viewport: { once: true, margin: "-80px" }
};

const cardItem = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 40px", background: "#fff", borderBottom: "1px solid #e5e7eb",
          position: "sticky", top: 0, zIndex: 100
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 22, color: "#16a34a" }}>
          <i className="bi bi-recycle me-2"></i>EcoRecicla
        </div>
        <nav style={{ display: "flex", gap: 28 }}>
          {["#inicio","#funciona","#beneficios","#faq"].map((href, i) => (
            <a key={i} href={href} style={{ color: "#374151", textDecoration: "none", fontSize: 14 }}>
              {["Inicio","Cómo funciona","Beneficios","Preguntas frecuentes"][i]}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/login" style={{
              padding: "8px 18px", borderRadius: 8, border: "1.5px solid #16a34a",
              color: "#16a34a", textDecoration: "none", fontSize: 14, fontWeight: 500,
              display: "inline-block", transition: "0.2s"
            }}>
              Iniciar sesión
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/registro" style={{
              padding: "8px 18px", borderRadius: 8, background: "#16a34a",
              color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500,
              display: "inline-block", transition: "0.2s"
            }}>
              Regístrate
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* HERO */}
      <section id="inicio" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "80px 40px", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        minHeight: "85vh"
      }}>
        <div style={{ maxWidth: 520 }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              background: "#dcfce7", color: "#15803d", padding: "6px 14px",
              borderRadius: 20, fontSize: 13, fontWeight: 500, display: "inline-block"
            }}
          >
            🌿 Juntos cuidamos el planeta
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: 48, fontWeight: 800, color: "#111", marginTop: 20, lineHeight: 1.2 }}
          >
            Recicla hoy,<br />
            <span style={{ color: "#29B15B" }}>gana beneficios</span><br />
            mañana.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{ color: "#6b7280", fontSize: 17, marginTop: 16, lineHeight: 1.7 }}
          >
            Lleva tus residuos a supermercados aliados, acumula puntos
            y canjéalos por descuentos y recompensas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: "flex", gap: 12, marginTop: 32 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" style={{
                padding: "12px 28px", borderRadius: 10, background: "#127235",
                color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15,
                display: "inline-block", transition: "background 0.2s"
              }}
                onMouseEnter={e => e.target.style.background = "#0d5a28"}
                onMouseLeave={e => e.target.style.background = "#127235"}
              >
                Iniciar sesión
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/registro" style={{
                padding: "12px 28px", borderRadius: 10, border: "2px solid #16a34a",
                color: "#16a34a", textDecoration: "none", fontWeight: 600, fontSize: 15,
                display: "inline-block", transition: "background 0.2s, color 0.2s"
              }}
                onMouseEnter={e => { e.target.style.background = "#16a34a"; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#16a34a"; }}
              >
                Regístrate gratis
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* IMAGEN HERO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{ width: 550, height: 550, flexShrink: 0 }}
        >
          <img
            src={heroImage}
            alt="Reciclaje"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </motion.div>
      </section>

      {/* CÓMO FUNCIONA */}
      <motion.section id="funciona" {...fadeUp} style={{ padding: "80px 40px", background: "#fff" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 48 }}>
          ¿Cómo funciona?
        </h2>
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-80px" }}
          style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}
        >
          {[
            { icon: "bi-geo-alt-fill",  title: "1. Encuentra un punto",   desc: "Localiza el supermercado aliado más cercano a ti." },
            { icon: "bi-recycle",       title: "2. Entrega tus residuos", desc: "Lleva plástico, cartón, vidrio o metal y regístralos." },
            { icon: "bi-star-fill",     title: "3. Acumula puntos",       desc: "Cada kg reciclado te da puntos canjeables." },
            { icon: "bi-gift-fill",     title: "4. Canjea recompensas",   desc: "Obtén descuentos y beneficios exclusivos." },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={cardItem}
              whileHover={{ y: -10, borderColor: "#16a34a", boxShadow: "0 8px 25px rgba(22,163,74,0.12)" }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14,
                padding: "28px 22px", width: 210, textAlign: "center",
                cursor: "default", transition: "border-color 0.2s"
              }}
            >
              <i className={`bi ${f.icon}`} style={{ fontSize: 36, color: "#16a34a" }}></i>
              <div style={{ fontWeight: 700, marginTop: 14, marginBottom: 8, color: "#111", fontSize: 15 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* BENEFICIOS */}
      <motion.section id="beneficios" {...fadeUp} style={{ padding: "80px 40px", background: "#f0fdf4" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 48 }}>
          Beneficios
        </h2>
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-80px" }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
        >
          {[
            { icon: "bi-tree-fill",   text: "Ayudas al medio ambiente" },
            { icon: "bi-cash-coin",   text: "Ganas descuentos reales"  },
            { icon: "bi-phone-fill",  text: "Todo desde tu celular"    },
            { icon: "bi-people-fill", text: "Comunidad comprometida"   },
          ].map((b, i) => (
            <motion.div
              key={i}
              variants={cardItem}
              whileHover={{ y: -5, boxShadow: "0 6px 20px rgba(22,163,74,0.15)", borderColor: "#16a34a" }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#fff", border: "1px solid #E4E4E4",
                borderRadius: 12, padding: "18px 24px",
                fontSize: 15, color: "#189A18", fontWeight: 500,
                cursor: "default", transition: "border-color 0.2s"
              }}
            >
              <i className={`bi ${b.icon}`} style={{ fontSize: 24 }}></i>
              {b.text}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* FAQ */}
      <motion.section id="faq" {...fadeUp} style={{ padding: "80px 40px", background: "#fff" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 40 }}>
          Preguntas frecuentes
        </h2>
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-80px" }}
          style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
        >
          {[
            { q: "¿Es gratis registrarse?",           a: "Sí, el registro y uso de la plataforma es completamente gratuito." },
            { q: "¿Qué materiales puedo reciclar?",   a: "Plástico, cartón, papel, vidrio y metal en los puntos habilitados." },
            { q: "¿Cómo canjeo mis puntos?",          a: "Desde tu perfil en la sección Recompensas puedes ver y canjear tus puntos." },
            { q: "¿En qué ciudades está disponible?", a: "Actualmente en Cali y expandiéndonos a más ciudades de Colombia." },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={cardItem}
              whileHover={{ backgroundColor: "#f0fdf4", borderColor: "#16a34a", x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                background: "#f9fafb", border: "1px solid #e5e7eb",
                borderRadius: 12, padding: "18px 22px",
                cursor: "default", transition: "border-color 0.2s"
              }}
            >
              <div style={{ fontWeight: 600, color: "#111", marginBottom: 6, fontSize: 15 }}>
                {f.q}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{f.a}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: "center", padding: "28px 40px",
          background: "#16a34a", color: "#fff", fontSize: 14
        }}
      >
        <i className="bi bi-recycle me-2"></i>
        © 2026 EcoRecicla · Todos los derechos reservados
      </motion.footer>

    </div>
  );
}