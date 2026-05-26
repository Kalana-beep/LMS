import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isModern, setIsModern] = useState(false);

  useEffect(() => {
    if (isModern) {
      document.body.classList.add('modern-bg');
      document.body.classList.remove('default-bg');
    } else {
      document.body.classList.add('default-bg');
      document.body.classList.remove('modern-bg');
    }
  }, [isModern]);

  const toggleTheme = () => setIsModern(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isModern, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};