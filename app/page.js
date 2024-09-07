'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [webhookUrls, setWebhookUrls] = useState({});

  useEffect(() => {
    const savedApiKey = localStorage.getItem('formbricksApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      fetchSurveys(savedApiKey);
    }

    const savedWebhookUrls = JSON.parse(localStorage.getItem('webhookUrls') || '{}');
    setWebhookUrls(savedWebhookUrls);
  }, []);

  useEffect(() => {
    Object.entries(webhookUrls).forEach(([surveyId, url]) => {
      listenToWebhook(url, surveyId);
    });
  }, [webhookUrls]);

  const fetchSurveys = async (key) => {
    try {
      const response = await fetch('api/v1/management/surveys', {
        method: 'GET',
        headers: { 
          'x-api-key': key,
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSurveys(data.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('formbricksApiKey', apiKey);
    fetchSurveys(apiKey);
  };

  const createWorkflow = async (surveyId) => {
    try {
      const smeeUrl = `https://smee.io/${surveyId}`;
      setWebhookUrls(prev => ({ ...prev, [surveyId]: smeeUrl }));
      const updatedWebhookUrls = { ...webhookUrls, [surveyId]: smeeUrl };
      localStorage.setItem('webhookUrls', JSON.stringify(updatedWebhookUrls));

      await fetch('api/v1/webhooks', {
        method: 'POST',
        headers: { 
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: smeeUrl,
          triggers: ['responseCreated'],
          surveyIds: [surveyId]
        })
      });

      // Start listening to the webhook
      listenToWebhook(smeeUrl, surveyId);
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };



  const listenToWebhook = (url, surveyId) => {
    const eventSource = new EventSource(url);
    eventSource.onmessage = async (event) => {
      const webhookData = JSON.parse(event?.data);
      if (webhookData.body && webhookData.body.data.id) {
        if (webhookData.body && webhookData.body.data.data) {
          for (const key in webhookData.body.data.data) {
            if (typeof webhookData.body.data.data[key] === 'string') {
              webhookData.body.data.data[key] = webhookData.body.data.data[key] + ", Updated Using Lamatic Test Task App";
            } else if (typeof webhookData.body.data.data[key] === 'number') {
              webhookData.body.data.data[key] = webhookData.body.data.data[key] + 1234567890;
            } else if (Array.isArray(webhookData.body.data.data[key])) {
              webhookData.body.data.data[key].push("Updated Using Lamatic Test Task App");
            } else {
              webhookData.body.data.data[key] = "Updated Using Lamatic Test Task App";
            }
          }
        }
        await sendResponse(webhookData.body.data.id, webhookData.body.data);
      }
    };
  };

  const sendResponse = async (responseId, updateData) => {
    try {
      const response = await fetch(`api/v1/management/responses/${responseId}`, {
        method: 'PUT',
        headers: { 
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-blue-600 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Formbricks Survey Manager</h1>
        
        <form onSubmit={handleApiKeySubmit} className="mb-8">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Formbricks API Key"
            className="w-full p-2 border border-blue-300 rounded"
          />
          <button type="submit" className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Fetch Surveys
          </button>
        </form>

        {surveys.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Surveys</h2>
            <div className="grid grid-cols-1 gap-4">
              {surveys.map((survey) => (
                <div key={survey.id} className="border border-blue-300 p-4 rounded">
                  <h3 className="font-bold">{survey.name}</h3>
                  <p>{survey.description}</p>
                  <button
                    onClick={() => createWorkflow(survey.id)}
                    className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    Create Workflow
                  </button>
                  {webhookUrls[survey.id] && (
                    <p className="mt-2 text-sm">
                      Webhook created: {webhookUrls[survey.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
