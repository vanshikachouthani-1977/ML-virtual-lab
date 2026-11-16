import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

  // Extract active experiment ID from URL path (e.g. /experiment/hard-margin-svm)
  const match = location.pathname.match(/\/experiment\/([^/]+)/);
  const activeExperimentId = match ? match[1] : undefined;
  const currentExp = EXPERIMENTS.find((e) => e.id === activeExperimentId);

  return (
    <Layout
      title={currentExp ? currentExp.shortTitle : undefined}
      score={cumulativeScore}
      sidebar={
        <Sidebar
          experiments={EXPERIMENTS}
          activeExperimentId={activeExperimentId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
    >
      <Routes>
        <Route path="/" element={<HomeView experiments={EXPERIMENTS} />} />
        <Route
          path="/experiment/:id"
          element={
            <ExperimentView
              experiments={EXPERIMENTS}
              onScoreUpdate={setCumulativeScore}
            />
          }
        />
      </Routes>
    </Layout>
  );
}
