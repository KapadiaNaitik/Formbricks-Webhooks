export const fetchSurvey = async (apiKey, surveyId) => {
  try {
    const response = await fetch(`/api/v1/management/surveys/${surveyId}`, {
      method: 'GET',
      headers: { 
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching survey:', error);
    throw error;
  }
};