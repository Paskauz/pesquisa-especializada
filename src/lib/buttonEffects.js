// Comportamento global dos botões: ondinha ao clicar (ripple) e leve "pressionar"
// via CSS. Usa delegação de eventos: um único listener cobre todos os botões,
// inclusive os que o React cria depois.
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ripple(event) {
  const btn = event.target.closest('.btn');
  if (!btn || btn.disabled || btn.getAttribute('aria-busy') === 'true' || reduceMotion()) return;

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.width = span.style.height = `${size}px`;
  span.style.left = `${event.clientX - rect.left - size / 2}px`;
  span.style.top = `${event.clientY - rect.top - size / 2}px`;
  btn.appendChild(span);
  span.addEventListener('animationend', () => span.remove(), { once: true });
}

export function initButtonEffects() {
  document.addEventListener('pointerdown', ripple);
}
