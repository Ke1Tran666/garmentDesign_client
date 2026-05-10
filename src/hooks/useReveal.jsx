// src/hooks/useReveal.js
import { useEffect } from "react";

const useReveal = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else{
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // Cleanup khi component unmount
    return () => revealObserver.disconnect();
  }, []);
};

export default useReveal;