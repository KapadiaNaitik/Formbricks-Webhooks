import { sendResponse } from "./sendResponse";

export const listenToWebhook = (url, apiKey, onResponseUpdate) => {
  const eventSource = new EventSource(url);
  eventSource.onmessage = async (event) => {
    const webhookData = JSON.parse(event?.data);
    if (webhookData.body && webhookData.body.data.id) {
      if (webhookData.body && webhookData.body.data.data) {
        const updatedData = { ...webhookData.body.data.data };
        for (const key in updatedData) {
          if (typeof updatedData[key] === 'string') {
            updatedData[key] = updatedData[key] + ", Updated Using Lamatic Test Task App";
          } else if (typeof updatedData[key] === 'number') {
            updatedData[key] = updatedData[key] + 1234567890;
          } else if (Array.isArray(updatedData[key])) {
            updatedData[key].push("Updated Using Lamatic Test Task App");
          } else {
            updatedData[key] = "Updated Using Lamatic Test Task App";
          }
        }
        await sendResponse(webhookData.body.data.id, { ...webhookData.body.data, data: updatedData }, apiKey);
        if(onResponseUpdate) onResponseUpdate(prevResponses => [updatedData,...prevResponses]);
        ;
      }
    }
  };
  return eventSource;
};