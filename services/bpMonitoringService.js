/**
 * Blood Pressure Monitoring Service
 * 
 * This service provides utilities for monitoring blood pressure readings
 * and determining if they are within normal ranges or require immediate attention.
 * 
 * Normal BP ranges:
 * - Normal: Systolic < 120 and Diastolic < 80
 * - Elevated: Systolic 120-129 and Diastolic < 80
 * - High Stage 1: Systolic 130-139 or Diastolic 80-89
 * - High Stage 2: Systolic ≥ 140 or Diastolic ≥ 90
 * - Hypertensive Crisis: Systolic > 180 or Diastolic > 120
 * - Low (Hypotension): Systolic < 90 or Diastolic < 60
 */

/**
 * Check if blood pressure reading is abnormal (high or low)
 * @param {number} systolic - Systolic blood pressure reading
 * @param {number} diastolic - Diastolic blood pressure reading
 * @returns {Object} - { isAbnormal: boolean, status: string, severity: string, message: string }
 */
export const checkBPStatus = (systolic, diastolic) => {
  // Validate inputs
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    return {
      isAbnormal: false,
      status: 'invalid',
      severity: 'none',
      message: 'Invalid blood pressure reading',
    };
  }

  // Check for hypertensive crisis (requires immediate medical attention)
  if (systolic > 180 || diastolic > 120) {
    return {
      isAbnormal: true,
      status: 'crisis',
      severity: 'critical',
      message: 'Hypertensive Crisis: Immediate medical attention required!',
      requiresImmediateAttention: true,
    };
  }

  // Check for low blood pressure (hypotension)
  if (systolic < 90 || diastolic < 60) {
    return {
      isAbnormal: true,
      status: 'low',
      severity: 'high',
      message: 'Low Blood Pressure: Please contact your doctor immediately',
      requiresImmediateAttention: true,
    };
  }

  // Check for high blood pressure (Stage 2)
  if (systolic >= 140 || diastolic >= 90) {
    return {
      isAbnormal: true,
      status: 'high',
      severity: 'high',
      message: 'High Blood Pressure: Please contact your doctor immediately',
      requiresImmediateAttention: true,
    };
  }

  // Check for elevated or Stage 1 (monitor but not critical)
  if ((systolic >= 120 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
    return {
      isAbnormal: false,
      status: 'elevated',
      severity: 'medium',
      message: 'Elevated Blood Pressure: Monitor closely and consult your doctor if it persists',
      requiresImmediateAttention: false,
    };
  }

  // Normal range
  return {
    isAbnormal: false,
    status: 'normal',
    severity: 'none',
    message: 'Blood pressure is within normal range',
    requiresImmediateAttention: false,
  };
};

/**
 * Check if a BP reading requires immediate doctor contact
 * @param {number} systolic - Systolic blood pressure reading
 * @param {number} diastolic - Diastolic blood pressure reading
 * @returns {boolean} - True if immediate doctor contact is recommended
 */
export const requiresImmediateAttention = (systolic, diastolic) => {
  const status = checkBPStatus(systolic, diastolic);
  return status.requiresImmediateAttention || false;
};

/**
 * Get formatted BP reading string
 * @param {number} systolic - Systolic blood pressure reading
 * @param {number} diastolic - Diastolic blood pressure reading
 * @returns {string} - Formatted BP string (e.g., "120/80 mmHg")
 */
export const formatBPReading = (systolic, diastolic) => {
  return `${systolic}/${diastolic} mmHg`;
};

/**
 * Analyze multiple BP readings and provide summary
 * @param {Array} readings - Array of {systolic, diastolic, timestamp} objects
 * @returns {Object} - Summary with average, trends, and recommendations
 */
export const analyzeBPReadings = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      averageSystolic: null,
      averageDiastolic: null,
      abnormalCount: 0,
      requiresAttention: false,
      recommendation: 'No readings available',
    };
  }

  const validReadings = readings.filter(r => r.systolic && r.diastolic);
  if (validReadings.length === 0) {
    return {
      averageSystolic: null,
      averageDiastolic: null,
      abnormalCount: 0,
      requiresAttention: false,
      recommendation: 'No valid readings available',
    };
  }

  const avgSystolic = validReadings.reduce((sum, r) => sum + r.systolic, 0) / validReadings.length;
  const avgDiastolic = validReadings.reduce((sum, r) => sum + r.diastolic, 0) / validReadings.length;

  const abnormalReadings = validReadings.filter(r => 
    requiresImmediateAttention(r.systolic, r.diastolic)
  );

  const avgStatus = checkBPStatus(avgSystolic, avgDiastolic);

  return {
    averageSystolic: Math.round(avgSystolic),
    averageDiastolic: Math.round(avgDiastolic),
    totalReadings: validReadings.length,
    abnormalCount: abnormalReadings.length,
    requiresAttention: abnormalReadings.length > 0 || avgStatus.requiresImmediateAttention,
    status: avgStatus,
    recommendation: avgStatus.requiresImmediateAttention 
      ? 'Contact your doctor immediately'
      : 'Continue monitoring your blood pressure regularly',
  };
};

export default {
  checkBPStatus,
  requiresImmediateAttention,
  formatBPReading,
  analyzeBPReadings,
};

