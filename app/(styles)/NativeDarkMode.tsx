// components/NativeDarkMode.js
'use client';

import { useEffect } from 'react';

export default function NativeDarkMode() {
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
      document.body.classList.add('native-dark-active');
    } else {
      document.body.classList.remove('native-dark-active');
    }
  }, []);

  return null;
}
