import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import WebFont from 'webfontloader';
import './index.scss';

WebFont.load({
  google: {
      families: ['Figtree:400,500,600,700']
  }
});
 
const targetModulesData = document.querySelectorAll(
  '.kohorta-voice-feedback-app > script[type="application/json"]',
);
targetModulesData.forEach(({ dataset, textContent }) => {
  const root = document.getElementById(`kohorta-voice-feedback-app--${dataset.moduleInstance}`);
  return ReactDOM.render(
    <ErrorBoundary>
      <App
        portalId={dataset.portalId}
        moduleData={JSON.parse(textContent)}
        moduleInstance={dataset.moduleInstance}
      />
    </ErrorBoundary>,
    root,
  );
});
