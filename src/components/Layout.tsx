import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import ParticleField from './ParticleField';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navigation />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;