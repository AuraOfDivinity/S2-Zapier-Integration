const fetchNewActions = async (z, bundle) => {
  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/polling/action`,
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
        date: "2024-02-29",
      },
    ];
  }

  return actions.map((action) => ({
    title: action.title,
    description: action.description,
    owner: action.owner,
    date: action.date,
  }));
};

const subscribeHook = async (z, bundle) => {
  const data = {
    url: bundle.targetUrl, // The URL Zapier provides to receive the webhook notifications
    trigger_type: "action",
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
  key: "new_action",
  noun: "Action",
  display: {
    label: "New Action",
    description: "Triggers when a new S2 action is created.",
  },
  operation: {
    inputFields: [],
    type: "hook",
    perform,
    performSubscribe: subscribeHook,
    performList: fetchNewActions,
    performUnsubscribe: unsubscribeHook,
    sample: {
      title: "Sample Action",
      description: "This is a sample action",
      owner: "Janith Liyanage",
      date: "2024-02=17",
    },
    outputFields: [
      { key: "title", label: "Action Title" },
      { key: "description", label: "Action Description" },
      { key: "owner", label: "Owner" },
      { key: "date", label: "Date" },
    ],
  },
};
