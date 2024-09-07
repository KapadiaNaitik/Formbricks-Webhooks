'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSurvey } from '../utils/fetchSurvey';
import { listenToWebhook } from '../utils/listenToWebhook';
export default function SurveyPage({ params }) {
  const [survey, setSurvey] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [responses, setResponses] = useState([]);
  const router = useRouter();
  const surveyId = params.surveyId[0];

  useEffect(() => {
    const savedApiKey = localStorage.getItem('formbricksApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      fetchSurvey(savedApiKey,surveyId).then(setSurvey);
    } else {
      router.push('/');
    }
  }, [router, surveyId]);



  useEffect(() => {
    if (apiKey) {
      const webhookUrl = localStorage.getItem('webhookUrls') ? JSON.parse(localStorage.getItem('webhookUrls'))[surveyId] : null;
      if (webhookUrl) {
        listenToWebhook(webhookUrl,apiKey,setResponses);
      }
    }
  }, [apiKey, surveyId]);



  return (
    <div className="min-h-screen bg-white text-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Survey Details</h1>
        
        {survey && (
          <div className="mb-8 p-4 border border-blue-300 rounded">
            <h2 className="text-2xl font-semibold mb-2">{survey.name}</h2>
            <p className="mb-4">{survey.description}</p>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Recent Responses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses?.map((response, index) => (
            <div key={index} className="p-4 border border-blue-300 rounded">
              {Object.entries(response).map(([key, value]) => (
                <p key={key} className="mb-2">
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
