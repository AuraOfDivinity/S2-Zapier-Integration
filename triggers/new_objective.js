const fetchNewObjectives = async (z, bundle) => {
  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/polling/objective`,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
  });

  const objectives = response.json;

  if (objectives.length === 0) {
    // Provide a static sample if no new objectives are found
    return [
      {
        title: "Sample Objective",
        description: "This is a sample objective",
        keyResults: "Sample Key Result",
        milestone30Day: "Sample 30 day Milestone",
        milestone60Day: "Sample 60 day Milestone",
        dueDate: "2024-06-24",
        status: "on-track",
        owner: "Asel Peiris",
      },
    ];
  }

  // TODO FIX
  return objectives.map((objective) => ({
    title: objective.title,
    description: objective.description,
    owner: objective.owner,
    keyResults: objective.keyResults,
    milestone30Day: objective.milestone30Day,
    milestone60Day: objective.milestone60Day,
    dueDate: objective.dueDate,
    status: objective.status,
  }));
};

const subscribeHook = async (z, bundle) => {
  const data = {
    url: bundle.targetUrl, // The URL Zapier provides to receive the webhook notifications
    trigger_type: "objective",
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
  const objective = bundle.cleanedRequest; // This will contain the task data sent by your NestJS application
  return [objective];
};

module.exports = {
  key: "new_objective",
  noun: "Objective",
  display: {
    label: "New Objective",
    description: "Triggers when a new S2 Objective is created.",
  },
  operation: {
    inputFields: [],
    type: "hook",
    perform,
    performSubscribe: subscribeHook,
    performList: fetchNewObjectives,
    performUnsubscribe: unsubscribeHook,
    sample: {
      title: "Sample Objective",
      description: "This is a sample objective",
      keyResults: "Sample Key Result",
      milestone30Day: "Sample 30 day Milestone",
      milestone60Day: "Sample 60 day Milestone",
      dueDate: "2024-06-24",
      status: "on-track",
      owner: "Asel Peiris",
    },
    outputFields: [
      { key: "title", label: "Objective Title" },
      { key: "description", label: "Objective Description" },
      { key: "keyResults", label: "Key Results" },
      { key: "milestone30Day", label: "30 Day Milestone" },
      { key: "milestone60Day", label: "60 Day Milestone" },
      { key: "status", label: "Status" },
      { key: "dueDate", label: "Due Date" },
      { key: "owner", label: "Owner" },
    ],
  },
};
