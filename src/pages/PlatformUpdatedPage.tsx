import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, GraduationCap } from 'lucide-react';

/**
 * Shown when a B2C user hits a legacy dashboard route.
 * Platform has moved to institute-based (B2B) access only.
 */
const PlatformUpdatedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-10">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-2xl shadow-accent/30">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Platform Updated</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            This platform has moved to institute-based access.
            Students now learn through their teacher's classroom.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="h-14 text-base font-semibold w-full"
            onClick={() => navigate('/auth?require_batch=1')}
          >
            <Users className="w-5 h-5 mr-2" />
            Join via Teacher Code
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 text-base font-semibold w-full"
            onClick={() => navigate('/auth')}
          >
            <Building2 className="w-5 h-5 mr-2" />
            I am a Teacher / Institute
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60">
          Your account and data are safe. Sign in to continue.
        </p>

      </div>
    </div>
  );
};

export default PlatformUpdatedPage;
