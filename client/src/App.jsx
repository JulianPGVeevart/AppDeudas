import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DebtStatesProvider } from './context/DebtStatesContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import './styles/App.css';


const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/debts', element: <HomePage /> },
      { path: '/login', element: <LoginPage />},
      { path: '/register', element: <LoginPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DebtStatesProvider>
          <RouterProvider router={router} />
        </DebtStatesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}