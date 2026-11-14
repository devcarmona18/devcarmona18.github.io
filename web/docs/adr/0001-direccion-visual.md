# ADR 0001 — Dirección visual (revisada: tema claro)
Papel (#F4F2EE) con tinta negra (#0A0A0A) y un único acento azul (#1D4ED8, hover #2F6BFF): sin degradados, sin tarjetas de vidrio ni "burbujas".
Las ventanas tipo editor/terminal (demos de Especialidad, código de Arsenal) son oscuras (#0E0E10) a propósito, como contraste; redefinen los tokens con `.panel-dark`.
Los colores viven como tokens RGB en `app/globals.css` y Tailwind los referencia: recolorear es cambiar una línea.
Tipografía display Bricolage Grotesque 800 (mayúsculas, interletrado -0.045em, interlineado 0.9) contra cuerpo Manrope y metadatos en JetBrains Mono. El punto final de los titulares es un cuadrado azul (`.period`).
El movimiento está atado al scroll (GSAP ScrollTrigger + Lenis) y al puntero (cursor, imanes, cubo 3D); todo respeta prefers-reduced-motion.
