import { useEffect } from 'react';

// Envolve a tela atual. Como o `key` muda a cada troca de tela, o React recria
// o wrapper e a animação de entrada (CSS) roda de novo.
export default function PageTransition({ screenKey, children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [screenKey]);

  return (
    <div key={screenKey} className="page-transition">
      {children}
    </div>
  );
}
