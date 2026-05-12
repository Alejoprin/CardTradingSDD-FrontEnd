import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function OAuth2CallbackPage() {
  const { loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  console.log('OAuth2CallbackPage montado, loading:', loading);

  useEffect(() => {
    console.log('useEffect ejecutado, loading:', loading);
    // Esperar a que AuthContext termine de inicializarse
    if (loading) return;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('accessToken');

      if (!accessToken) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        await loginWithGoogle(accessToken);
        navigate('/dashboard', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    }

    handleCallback();
  }, [loading]); // ← se ejecuta cuando loading cambia a false

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Iniciando sesión...</p>
    </div>
  );
}

export default OAuth2CallbackPage;