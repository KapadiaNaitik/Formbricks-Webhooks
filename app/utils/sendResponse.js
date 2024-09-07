export const sendResponse = async (responseId, updateData, apiKey) => {
  try {
    const response = await fetch(`/api/v1/management/responses/${responseId}`, {
      method: 'PUT',
      headers: { 
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error sending response:', error);
    throw error;
  }
};