import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BPReminder, { BPStatusCard } from "./BPReminder";
import { checkBPStatus, formatBPReading, analyzeBPReadings } from "@/services/bpMonitoringService";
import { 
  Heart, 
  Activity, 
  Clock,
  TrendingUp,
  TrendingDown,
  Plus
} from "lucide-react";

// Simple Input and Label components if not available in UI library
const Input = ({ id, type, placeholder, value, onChange, min, max, className = "" }) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    min={min}
    max={max}
    className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
  />
);

const Label = ({ htmlFor, children, className = "" }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${className}`}>
    {children}
  </label>
);

/**
 * Patient Portal Component
 * 
 * Main dashboard for patients to view their health metrics including BP monitoring
 * with automatic alerts for abnormal readings.
 */
const PatientPortal = () => {
  const [currentSystolic, setCurrentSystolic] = useState(null);
  const [currentDiastolic, setCurrentDiastolic] = useState(null);
  const [bpReadings, setBpReadings] = useState([]);
  const [inputSystolic, setInputSystolic] = useState("");
  const [inputDiastolic, setInputDiastolic] = useState("");
  const [doctorContact] = useState("Dr. Smith - (555) 123-4567");

  // Load saved readings from localStorage (in a real app, this would come from an API)
  useEffect(() => {
    const savedReadings = localStorage.getItem('bpReadings');
    if (savedReadings) {
      try {
        const readings = JSON.parse(savedReadings);
        setBpReadings(readings);
        if (readings.length > 0) {
          const latest = readings[readings.length - 1];
          setCurrentSystolic(latest.systolic);
          setCurrentDiastolic(latest.diastolic);
        }
      } catch (error) {
        console.error('Error loading BP readings:', error);
      }
    }
  }, []);

  // Save readings to localStorage (in a real app, this would save to an API)
  const saveReadings = (readings) => {
    localStorage.setItem('bpReadings', JSON.stringify(readings));
  };

  const handleAddReading = () => {
    const systolic = parseInt(inputSystolic);
    const diastolic = parseInt(inputDiastolic);

    if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
      alert('Please enter valid blood pressure readings');
      return;
    }

    const newReading = {
      systolic,
      diastolic,
      timestamp: new Date().toISOString(),
    };

    const updatedReadings = [...bpReadings, newReading];
    setBpReadings(updatedReadings);
    setCurrentSystolic(systolic);
    setCurrentDiastolic(diastolic);
    setInputSystolic("");
    setInputDiastolic("");
    saveReadings(updatedReadings);
  };

  const bpAnalysis = analyzeBPReadings(bpReadings);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-inter mb-2">
          Patient Portal
        </h1>
        <p className="text-muted-foreground">
          Monitor your health metrics and stay connected with your healthcare team
        </p>
      </div>

      {/* BP Reminder Alert - Shows when BP is abnormal */}
      {currentSystolic && currentDiastolic && (
        <BPReminder
          systolic={currentSystolic}
          diastolic={currentDiastolic}
          doctorContact={doctorContact}
        />
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Current BP Status Card */}
        <BPStatusCard
          systolic={currentSystolic}
          diastolic={currentDiastolic}
          timestamp={bpReadings.length > 0 ? bpReadings[bpReadings.length - 1].timestamp : null}
        />

        {/* Add New BP Reading Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
              Add Blood Pressure Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systolic">Systolic (Top Number)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={inputSystolic}
                    onChange={(e) => setInputSystolic(e.target.value)}
                    min="1"
                    max="300"
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">Diastolic (Bottom Number)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={inputDiastolic}
                    onChange={(e) => setInputDiastolic(e.target.value)}
                    min="1"
                    max="300"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddReading}
                className="w-full"
                aria-label="Add blood pressure reading"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Reading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BP Reading History */}
      {bpReadings.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              Recent Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bpReadings.slice(-5).reverse().map((reading, index) => {
                const status = checkBPStatus(reading.systolic, reading.diastolic);
                const isAbnormal = status.requiresImmediateAttention;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isAbnormal 
                        ? 'bg-destructive/10 border-destructive/30' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <div className="font-semibold">
                          {formatBPReading(reading.systolic, reading.diastolic)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(reading.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {status.status === 'normal' && (
                        <span className="text-sm text-green-600 dark:text-green-400">Normal</span>
                      )}
                      {status.status === 'elevated' && (
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">Elevated</span>
                      )}
                      {isAbnormal && (
                        <span className="text-sm font-semibold text-destructive">
                          {status.status === 'high' ? 'High' : status.status === 'low' ? 'Low' : 'Critical'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* BP Analysis Summary */}
      {bpAnalysis && bpReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              Blood Pressure Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {bpAnalysis.averageSystolic}/{bpAnalysis.averageDiastolic}
                </div>
                <div className="text-sm text-muted-foreground">Average BP</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold mb-1">
                  {bpAnalysis.totalReadings}
                </div>
                <div className="text-sm text-muted-foreground">Total Readings</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className={`text-2xl font-bold mb-1 ${
                  bpAnalysis.abnormalCount > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'
                }`}>
                  {bpAnalysis.abnormalCount}
                </div>
                <div className="text-sm text-muted-foreground">Abnormal Readings</div>
              </div>
            </div>
            {bpAnalysis.requiresAttention && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="font-semibold text-destructive mb-2">
                  ⚠️ Attention Required
                </p>
                <p className="text-sm">
                  {bpAnalysis.recommendation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientPortal;

