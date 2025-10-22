import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import Navigation from './lib/Navigation';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
