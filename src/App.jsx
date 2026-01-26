import { SocketProvider } from './contexts/SocketContext';
import { userAuth } from './hooks/userAuth';
import { AppRoutes } from './routes/AppRoutes'
import "./styles/charts.css";
function App() {
  const { token } = userAuth();

  return (
    <SocketProvider token={token}>
      <AppRoutes />
    </SocketProvider>
  );
}

export default App

