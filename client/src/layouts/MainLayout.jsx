import { Outlet } from 'react-router-dom';
//import Navbar from '@components/ui/Navbar'

export default function MainLayout() {
  return (
    <div className = "app-container">
        <main>
            <Outlet />
        </main>
        <footer>2026 | Fullstack Challenge | Julian Pedroza Garcia</footer>
    </div>
  );
}