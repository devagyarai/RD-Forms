import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rd-theme') || 'midnight-dark';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('rd-accent') || '';
  });

  const [borderRadius, setBorderRadius] = useState(() => {
    return localStorage.getItem('rd-radius') || 'default';
  });

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rd-theme', theme);

    // Apply accent color override if set
    if (accentColor) {
      document.documentElement.style.setProperty('--color-primary', accentColor);
      localStorage.setItem('rd-accent', accentColor);
    } else {
      document.documentElement.style.removeProperty('--color-primary');
      localStorage.removeItem('rd-accent');
    }

    // Apply border radius
    if (borderRadius === 'compact') {
      document.documentElement.style.setProperty('--radius-card', '8px');
      document.documentElement.style.setProperty('--radius-input', '6px');
      document.documentElement.style.setProperty('--radius-btn', '6px');
    } else if (borderRadius === 'rounded') {
      document.documentElement.style.setProperty('--radius-card', '24px');
      document.documentElement.style.setProperty('--radius-input', '16px');
      document.documentElement.style.setProperty('--radius-btn', '16px');
    } else {
      document.documentElement.style.removeProperty('--radius-card');
      document.documentElement.style.removeProperty('--radius-input');
      document.documentElement.style.removeProperty('--radius-btn');
    }
    localStorage.setItem('rd-radius', borderRadius);

  }, [theme, accentColor, borderRadius]);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme,
      accentColor, setAccentColor,
      borderRadius, setBorderRadius
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
