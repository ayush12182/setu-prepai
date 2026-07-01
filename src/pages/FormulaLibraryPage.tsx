import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate, useParams } from 'react-router-dom';
import FormulaSheet from '@/components/revision/FormulaSheet';

const FormulaLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  // We can pass the URL subject if we want, or just let FormulaSheet manage its state.
  // We'll let FormulaSheet manage it for now, just wrapping it in MainLayout.

  return (
    <MainLayout title="Formula Library">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <FormulaSheet onBack={() => navigate('/revision')} />
      </div>
    </MainLayout>
  );
};

export default FormulaLibraryPage;
