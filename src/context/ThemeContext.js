import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Kullanıcı giriş yapmış mı kontrol et
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return false; // Giriş yapılmamışsa açık tema
    }

    // Giriş yapılmışsa kayıtlı tema tercihini kontrol et
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    // Kullanıcı giriş yapmışsa tema tercihini kaydet
    const userStr = localStorage.getItem('user');
    if (userStr) {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } else {
      // Kullanıcı giriş yapmamışsa açık temayı zorla
      setDarkMode(false);
      localStorage.removeItem('darkMode');
    }
  }, [darkMode]);

  // Login/Logout durumlarını dinle
  useEffect(() => {
    const handleStorageChange = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        // Kullanıcı çıkış yaptığında açık temaya geç
        setDarkMode(false);
        localStorage.removeItem('darkMode');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    // Sadece giriş yapmış kullanıcılar tema değiştirebilir
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setDarkMode(!darkMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 