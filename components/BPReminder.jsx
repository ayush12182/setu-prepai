import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Phone, 
  X, 
  Heart,
  Activity
} from "lucide-react";
import { checkBPStatus, requiresImmediateAttention, formatBPReading } from "@/services/bpMonitoringService";

// Simple Alert component if not available in UI library
const Alert = ({ className, children, role, "aria-live": ariaLive, ...props }) => (
  <div className={className} role={role} aria-live={ariaLive} {...props}>
    {children}
  </div>
);

const AlertTitle = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const AlertDescription = ({ className, children }) => (
  <div className={className}>{children}</div>
);

/**
 * BP Reminder Component
 * 
 * Displays alerts when blood pressure readings are abnormal (high or low)
 * and prompts users to contact their doctor immediately.
 * 
 * @param {Object} props
 * @param {number} props.systolic - Current systolic BP reading
 * @param {number} props.diastolic - Current diastolic BP reading
 * @param {boolean} props.showCloseButton - Whether to show close button (default: true)
 * @param {Function} props.onDismiss - Callback when alert is dismissed
 * @param {string} props.doctorContact - Optional doctor contact information
 */
const BPReminder = ({ 
  systolic, 
  diastolic, 
  showCloseButton = true,
  onDismiss,
  doctorContact 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [bpStatus, setBpStatus] = useState(null);

  useEffect(() => {
    if (systolic && diastolic) {
      const status = checkBPStatus(systolic, diastolic);
      setBpStatus(status);
      // Only show alert if BP is abnormal and requires immediate attention
      setIsVisible(status.requiresImmediateAttention);
    } else {
      setIsVisible(false);
    }
  }, [systolic, diastolic]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible || !bpStatus || !bpStatus.requiresImmediateAttention) {
    return null;
  }

  const isHigh = bpStatus.status === 'high' || bpStatus.status === 'crisis';
  const isLow = bpStatus.status === 'low';
  const isCritical = bpStatus.status === 'crisis';

  return (
    <Alert 
      className={`mb-4 border-2 animate-fade-in ${
        isCritical 
          ? 'bg-destructive/20 border-destructive text-destructive-foreground' 
          : isHigh 
          ? 'bg-orange-500/20 border-orange-500 text-orange-900 dark:text-orange-100' 
          : 'bg-blue-500/20 border-blue-500 text-blue-900 dark:text-blue-100'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle 
          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            isCritical ? 'text-destructive' : isHigh ? 'text-orange-600' : 'text-blue-600'
          }`}
          aria-hidden="true"
        />
        <div className="flex-1">
          <AlertTitle className="font-bold text-lg mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" aria-hidden="true" />
            {isCritical 
              ? '⚠️ Critical Blood Pressure Alert' 
              : isHigh 
              ? 'High Blood Pressure Alert' 
              : 'Low Blood Pressure Alert'}
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span className="font-semibold">
                Current Reading: {formatBPReading(systolic, diastolic)}
              </span>
            </div>
            
            <p className="font-medium">
              {bpStatus.message}
            </p>
            
            <div className="bg-background/50 p-3 rounded-md border border-current/20">
              <p className="text-sm font-semibold mb-1">Action Required:</p>
              <p className="text-sm">
                Please connect with your doctor immediately to discuss your blood pressure reading. 
                This is important for your health and safety.
              </p>
            </div>

            {doctorContact && (
              <div className="flex items-center gap-2 pt-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">
                  <strong>Contact:</strong> {doctorContact}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className={
                  isCritical 
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                    : isHigh
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
                onClick={() => {
                  // In a real app, this would open a contact form or call function
                  alert('This would open your doctor contact form or initiate a call.');
                }}
                aria-label="Contact doctor now"
              >
                <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                Contact Doctor Now
              </Button>
            </div>
          </AlertDescription>
        </div>
        
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handleDismiss}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

/**
 * BP Status Card Component
 * 
 * Displays current BP reading with status indicator
 * 
 * @param {Object} props
 * @param {number} props.systolic - Current systolic BP reading
 * @param {number} props.diastolic - Current diastolic BP reading
 * @param {string} props.timestamp - Optional timestamp of reading
 */
export const BPStatusCard = ({ systolic, diastolic, timestamp }) => {
  if (!systolic || !diastolic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            Blood Pressure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent reading available</p>
        </CardContent>
      </Card>
    );
  }

  const bpStatus = checkBPStatus(systolic, diastolic);
  const isAbnormal = bpStatus.isAbnormal && bpStatus.requiresImmediateAttention;

  return (
    <Card className={isAbnormal ? 'border-2 border-destructive/50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
          Blood Pressure
          {isAbnormal && (
            <Badge variant="destructive" className="ml-auto">
              Alert
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatBPReading(systolic, diastolic)}
            </span>
            <Badge 
              variant={
                bpStatus.status === 'normal' ? 'default' :
                bpStatus.status === 'elevated' ? 'secondary' :
                'destructive'
              }
            >
              {bpStatus.status === 'normal' ? 'Normal' :
               bpStatus.status === 'elevated' ? 'Elevated' :
               bpStatus.status === 'high' ? 'High' :
               bpStatus.status === 'low' ? 'Low' :
               bpStatus.status === 'crisis' ? 'Critical' :
               'Unknown'}
            </Badge>
          </div>
          
          {timestamp && (
            <p className="text-sm text-muted-foreground">
              Last reading: {new Date(timestamp).toLocaleString()}
            </p>
          )}
          
          {isAbnormal && (
            <div className="mt-2 p-2 bg-destructive/10 rounded-md">
              <p className="text-sm font-medium text-destructive">
                {bpStatus.message}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BPReminder;

