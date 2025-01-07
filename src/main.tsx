import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createHashRouter, RouterProvider } from 'react-router';
import { WelcomePage } from '@/pages/WelcomePage.tsx';
import { MainPage } from '@/pages/MainPage.tsx';
import { ExamWaitingPage } from '@/pages/ExamWaitingPage.tsx';
import ExamStartPage from '@/pages/ExamStartPage.tsx';

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
    element: <ExamWaitingPage />
  },
  {
    path: '/exam-start',
    element: <ExamStartPage />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
