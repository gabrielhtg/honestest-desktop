import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createHashRouter, RouterProvider } from 'react-router';
import { WelcomePage } from '@/pages/WelcomePage.tsx';
import { MainPage } from '@/pages/MainPage.tsx';
import { ExamStartPage } from '@/pages/ExamStart.tsx';

const router = createHashRouter([
  {
    path: '/',
    element: <WelcomePage />
  },
  {
    path: '/main',
    element: <MainPage />
  },
  {
    path: '/exam',
    element: <ExamStartPage />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
