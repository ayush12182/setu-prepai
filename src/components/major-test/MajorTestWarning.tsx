import React, { useState } from 'react';
import { AlertTriangle, Clock, Shield, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface MajorTestWarningProps {
  onStart: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const MajorTestWarning: React.FC<MajorTestWarningProps> = ({
  onStart,
  onCancel,
  loading
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const rules = [
    {
      icon: Clock,
      title: '3 Hours - No Pause',
      description: 'Once started, the test cannot be paused or resumed. Plan accordingly.'
    },
    {
      icon: Shield,
      title: 'Full Screen Required',
      description: 'Test runs in full screen mode. Tab switches are monitored - 3 switches = auto-submit.'
    },
    {
      icon: AlertTriangle,
      title: 'No Going Back',
      description: 'Copy/paste, right-click, and page refresh are disabled. Answers auto-save every 10 seconds.'
    },
    {
      icon: Coffee,
      title: 'Be Prepared',
      description: 'Keep water nearby. Use the restroom before starting. Sit with a calm mind.'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Major Test
          </h1>
          <p className="text-lg text-muted-foreground">
            JEE Main Exam Simulation
          </p>
        </div>

        {/* Test Info */}
        <div className="bg-muted/50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">90</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">3 hrs</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">300</div>
              <div className="text-sm text-muted-foreground">Max Marks</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            Physics: 30 | Chemistry: 30 | Maths: 30
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-foreground">Before You Begin</h2>
          {rules.map((rule, index) => (
            <div key={index} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <rule.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{rule.title}</h3>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mentor Message */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
          <p className="text-foreground italic leading-relaxed">
            "This is a serious test. 3 hours. No pause.
            <br /><br />
            Sit with water. Sit with a calm mind.
            <br /><br />
            Treat this like the real exam hall. Give it your best shot."
          </p>
          <p className="text-sm text-primary mt-3 font-medium">— Jeetu Bhaiya</p>
        </div>

        {/* Acknowledgment */}
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg mb-6">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
          />
          <label htmlFor="acknowledge" className="text-sm text-foreground cursor-pointer">
            I understand that this is a 3-hour exam simulation. I have arranged for no distractions
            and am ready to give this test seriously.
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Not Now
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground"
            onClick={onStart}
            disabled={!acknowledged || loading}
          >
            {loading ? 'Preparing Test...' : 'I am ready to start'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MajorTestWarning;
