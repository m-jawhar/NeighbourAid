import { useState } from 'react';
import { getCrisisAnalysis, getVolunteerMatches } from '../services/geminiService';

export default function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeCrisis = async (crisisData) => {
    setLoading(true);
    setError('');
    try {
      return await getCrisisAnalysis(crisisData);
    } catch (analysisError) {
      const message = analysisError.message || 'Gemini could not analyze the crisis right now.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const matchVolunteers = async (crisisType, location, volunteers) => {
    setLoading(true);
    setError('');
    try {
      return await getVolunteerMatches(crisisType, location, volunteers);
    } catch (matchError) {
      const message = matchError.message || 'Gemini could not match responders right now.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeCrisis,
    matchVolunteers,
    loading,
    error,
  };
}
