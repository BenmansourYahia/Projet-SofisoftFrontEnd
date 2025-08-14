import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Store, BarChart3 } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(0);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    setTimeout(() => setFade(1), 100);
    setTimeout(() => setScale(1), 300);
    const timer = setTimeout(() => {
      setFade(0);
      setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 500);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  const sofisoftColors = {
    primary: '#6c4ccf',
    secondary: '#E53E3E',
    background: '#FFFFFF',
    accent: '#2B6CB0',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: sofisoftColors.background,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'opacity 0.5s',
      opacity: fade,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 60,
        transform: `scale(${scale})`,
        transition: 'transform 0.5s',
      }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: 20,
          background: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }}>
          <img
            src="/sofisoft-logo-new.png"
            alt="Sofisoft Logo"
            style={{ width: 100, height: 80, objectFit: 'contain' }}
          />
        </div>
        <span style={{ fontSize: 32, fontWeight: 'bold', color: sofisoftColors.primary, textAlign: 'center', marginBottom: 8 }}>
          {/* SofiSoft */}
        </span>
        <span style={{ fontSize: 16, color: sofisoftColors.primary + '99', textAlign: 'center', fontWeight: 300 }}>
          Éditeur de Logiciels Banque & Distribution
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 60, transform: `scale(${scale})`, transition: 'transform 0.5s' }}>
        <TrendingUp size={30} color={sofisoftColors.secondary} style={{ margin: '0 20px' }} />
        <BarChart3 size={30} color={sofisoftColors.primary} style={{ margin: '0 20px' }} />
        <Store size={30} color={sofisoftColors.secondary} style={{ margin: '0 20px' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 80, left: 40, right: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', height: 4, background: 'rgba(30, 90, 168, 0.2)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', borderRadius: 2, background: sofisoftColors.secondary, width: fade ? '100%' : '0%', transition: 'width 2.5s' }} />
        </div>
        <span style={{ fontSize: 14, color: sofisoftColors.primary + 'CC', textAlign: 'center' }}>
        </span>
      </div>
    </div>
  );
}
