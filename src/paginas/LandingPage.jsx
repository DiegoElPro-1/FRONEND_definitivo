// src/components/LandingPage.jsx
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from '../components/imagenes/landing_hero.png'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: "-80px" },
  transition: { duration: 0.6 }
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.15 } },
  viewport: { once: false, margin: "-80px" }
};

const cardItem = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false }
};

function Tooltip({ benefit, style }) {
  if (!benefit) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        position: "fixed", zIndex: 9999, pointerEvents: "none",
        background: "#fff", borderRadius: 16, padding: "20px 22px",
        maxWidth: 300, width: "max-content",
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        ...style
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: benefit.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 10
      }}>
        <i className={`bi ${benefit.icon}`} style={{ fontSize: 18, color: "#fff" }}></i>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
        {benefit.text}
      </div>
      <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>
        {benefit.detail}
      </div>
    </motion.div>
  );
}

const beneficiosData = [
  {
    icon: "bi-tree-fill",
    text: "Ayudas al medio ambiente",
    gradient: "linear-gradient(135deg, #16a34a, #22c55e)",
    detail: "Cada kilo de material reciclado reduce la contaminación del aire y el agua, disminuye la tala de árboles y ahorra energía. Con tu participación, evitamos que toneladas de residuos terminen en rellenos sanitarios."
  },
  {
    icon: "bi-cash-coin",
    text: "Ganas descuentos reales",
    gradient: "linear-gradient(135deg, #f59e0b, #eab308)",
    detail: "Acumula puntos con cada entrega de residuos y canjéalos por descuentos directos en supermercados aliados. Entre más recicles, más ahorras en tus compras del día a día."
  },
  {
    icon: "bi-phone-fill",
    text: "Todo desde tu celular",
    gradient: "linear-gradient(135deg, #3b82f6, #6366f1)",
    detail: "Registra tus entregas, consulta tu saldo de puntos, localiza puntos de reciclaje cercanos y canjea recompensas — todo desde la comodidad de tu smartphone, en cualquier momento."
  },
  {
    icon: "bi-people-fill",
    text: "Comunidad comprometida",
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
    detail: "Únete a una red de personas conscientes que están transformando sus hábitos para construir un futuro más sostenible. Comparte logros, participa en retos e inspira a otros a reciclar."
  }
];

export default function LandingPage() {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [faqOpen, setFaqOpen] = useState(null);
  const cardRefs = useRef([]);

  const handleHover = (index) => {
    const rect = cardRefs.current[index]?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        top: rect.top - 12,
        left: rect.left + rect.width / 2
      });
      setHovered(index);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 40px", background: "#f0fdf4", borderBottom: "1px solid #d1fae5",
          position: "sticky", top: 0, zIndex: 100
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 22, color: "#14CC58" }}>
          <i className="bi bi-recycle me-2"></i>Recycling Points
        </div>
        <nav style={{ display: "flex", gap: 12 }}>
          {["#inicio","#funciona","#beneficios","#faq"].map((href, i) => (
            <motion.a
              key={i}
              href={href}
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(22,163,74,0.15)" }}
              whileTap={{ y: 2, scale: 0.95 }}
              style={{
                color: "#374151", textDecoration: "none", fontSize: 14, fontWeight: 500,
                padding: "8px 16px", borderRadius: 10,
                border: "1.5px solid #e5e7eb", background: "#fff",
                transition: "border-color 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#16a34a"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}
            >
              {["Inicio","Cómo funciona","Beneficios","Preguntas frecuentes"][i]}
            </motion.a>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/login" style={{
              padding: "8px 18px", borderRadius: 8, border: "1.5px solid #22B457",
              color: "#0A150E", textDecoration: "none", fontSize: 14, fontWeight: 500,
              display: "inline-block", transition: "0.2s"
            }}>
              Iniciar sesión
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/registro" style={{
              padding: "8px 18px", borderRadius: 8, background: "#0EC651",
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
        padding: "80px 40px", minHeight: "85vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #A3E9BB 100%)"
      }}>
        <div style={{ maxWidth: 520 }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              background: "#CAE4D3", color: "#15803d", padding: "6px 14px",
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
          style={{ width: 480, height: 480, flexShrink: 0, position: "relative", zIndex: 2 }}
        >
          <img
            src={heroImage}
            alt="Reciclaje"
            style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.08))" }}
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
      <motion.section id="beneficios" {...fadeUp} style={{ padding: "80px 40px", background: "#D0F8DC" }}>
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
          {beneficiosData.map((b, i) => (
            <motion.div
              key={i}
              ref={el => cardRefs.current[i] = el}
              variants={cardItem}
              whileHover={{
                y: -8, borderColor: "transparent",
                boxShadow: "0 12px 30px rgba(0,0,0,0.1)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
              onHoverStart={() => handleHover(i)}
              onHoverEnd={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#fff", border: "1px solid #E4E4E4",
                borderRadius: 12, padding: "18px 24px",
                fontSize: 15, color: "#189A18", fontWeight: 500,
                cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s"
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: b.gradient,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <i className={`bi ${b.icon}`} style={{ fontSize: 18, color: "#fff" }}></i>
              </div>
              {b.text}
              <i className="bi bi-chevron-right" style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}></i>
            </motion.div>
          ))}
          <AnimatePresence>
            {hovered !== null && (
              <Tooltip
                benefit={beneficiosData[hovered]}
                style={{ top: tooltipPos.top, left: tooltipPos.left, transform: "translate(-50%, -100%)" }}
              />
            )}
          </AnimatePresence>
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
          style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}
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
              style={{
                background: "#f9fafb", border: "1px solid #e5e7eb",
                borderRadius: 12, overflow: "hidden",
                cursor: "pointer", transition: "border-color 0.2s"
              }}
            >
              <div
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 22px", fontWeight: 600, color: "#111", fontSize: 15,
                  background: faqOpen === i ? "#C7F4D5" : "transparent",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                onMouseLeave={e => { if (faqOpen !== i) e.currentTarget.style.background = "transparent" }}
              >
                {f.q}
                <motion.i
                  className="bi bi-chevron-down"
                  animate={{ rotate: faqOpen === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: 14, color: "#16a34a" }}
                ></motion.i>
              </div>
              <AnimatePresence initial={false}>
                {faqOpen === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      padding: "0 22px 18px 22px",
                      fontSize: 13, color: "#6b7280", lineHeight: 1.6
                    }}>
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
        © 2026 Recycling Points · Todos los derechos reservados
      </motion.footer>

    </div>
  );
}