import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './lib/AuthContext';
import Navigation from './lib/Navigation';

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
