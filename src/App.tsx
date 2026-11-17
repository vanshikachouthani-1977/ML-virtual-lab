import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import HomeView from './views/HomeView';
import ExperimentView from './views/ExperimentView';
import { EXPERIMENTS } from './data/experiments';
import type { Tab } from './types';

export default function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('aim');
  const [cumulativeScore, setCumulativeScore] = useState<number | null>(null);

  const isExp = location.pathname.startsWith('/experiment');
  const currentExp = isExp ? EXPERIMENTS[0] : undefined;

  return (
    <Layout
      title={currentExp ? currentExp.shortTitle : undefined}
      score={cumulativeScore}
      sidebar={
        <Sidebar
          experiments={EXPERIMENTS}
          activeExperimentId={EXPERIMENTS[0].id}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
    >
      <Routes>
        <Route path="/" element={<HomeView experiments={EXPERIMENTS} />} />
        <Route
          path="/experiment/svm"
          element={
            <ExperimentView
              experiments={EXPERIMENTS}
              onScoreUpdate={setCumulativeScore}
            />
          }
        />
        {/* Route fallback for any legacy URL */}
        <Route path="/experiment/*" element={<Navigate to="/experiment/svm" replace />} />
      </Routes>
    </Layout>
  );
}
