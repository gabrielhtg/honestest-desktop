import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createHashRouter, RouterProvider } from 'react-router';
import { WelcomePage } from '@/pages/WelcomePage.tsx';
import { MainPage } from '@/pages/MainPage.tsx';

const router = createHashRouter([
  {
    path: '/',
    element: <WelcomePage />
    // children: [
    //     {
    //         path: "",
    //         title: "Home",
    //         element: <HomePage />,
    //     },
    // ],
  },
  {
    path: '/main',
    element: <MainPage />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
