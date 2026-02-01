/**
 * Reactアプリケーションの初期化とレンダリングを行うエントリーポイント
 */
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

/**
 * ルート要素を取得してアプリケーションをレンダリングする
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
