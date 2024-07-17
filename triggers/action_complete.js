const fetchCompletedAction = async (z, bundle) => {
  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/polling/action-complete`,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
  });

  const actions = response.json;

  if (actions.length === 0) {
    // Provide a static sample if no new actions are found
    return [
      {
        title: "Sample Action",
        description: "This is a sample action",
        owner: "Asel Peiris",
        date: "2024-05-28",
        completed: "true",
      },
    ];
  }

  return actions.map((action) => ({
    title: action.title,
    description: action.description,
    owner: action.owner,
    date: action.date,
    completed: action.completed,
  }));
};

const subscribeHook = async (z, bundle) => {
  const data = {
    url: bundle.targetUrl, // The URL Zapier provides to receive the webhook notifications
    trigger_type: "action-complete",
    webhook_url: bundle.targetUrl,
  };

  // Log the request object
  z.console.log("Subscribe request data:", data);
  z.console.log("Subscribe request bundle:", bundle);

  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/webhook/subscribe`,
    method: "POST",
    body: data,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
  });

  z.console.log("subscribe response:", bundle);
  return response.data;
};

const unsubscribeHook = async (z, bundle) => {
  const data = {
    url: bundle.targetUrl, // The URL Zapier provided for receiving the webhook notifications
  };

  // Log the request object
  z.console.log("Unsubscribe request data:", data);
  z.console.log("Unsubscribe request bundle:", bundle);

  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/webhook/unsubscribe`,
    method: "POST",
    body: data,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
  });

  return response.data;
};

const perform = async (z, bundle) => {
  const action = bundle.cleanedRequest; // This will contain the task data sent by your NestJS application
  return [action];
};

module.exports = {
  key: "completed_action",
  noun: "Action",
  display: {
    label: "Completed Action",
    description: "Triggers when a S2 action is completed.",
  },
  operation: {
    inputFields: [],
    type: "hook",
    perform,
    performSubscribe: subscribeHook,
    performList: fetchCompletedAction,
    performUnsubscribe: unsubscribeHook,
    sample: {
      title: "Sample Action",
      description: "This is a sample action",
      owner: "Janith Liyanage",
      date: "2024-02-17",
      completed: "true",
    },
    outputFields: [
      { key: "title", label: "Action Title" },
      { key: "description", label: "Action Description" },
      { key: "owner", label: "Owner" },
      { key: "date", label: "Date" },
      { key: "completed", label: "Completed" },
    ],
  },
};
