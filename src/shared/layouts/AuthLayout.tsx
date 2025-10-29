import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <Outlet />
    </div>
  );
};
