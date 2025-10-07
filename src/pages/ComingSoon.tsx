import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl text-center bg-card rounded-3xl p-10 shadow-game">
        <div className="text-6xl mb-4">😊</div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          Stay tuned! Your custom video generation is in progress...
        </h1>
        <p className="text-muted-foreground mb-8">
          We’re preparing personalized learning videos for this module. Check back soon or explore other subjects in the meantime.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/learning')} className="btn-game">
            Go to Learnings
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;


