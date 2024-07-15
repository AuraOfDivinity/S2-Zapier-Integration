const fetchNewCompletedMeetings = async (z, bundle) => {
  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/polling/meeting-completion`,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
  });

  const completedMeetings = response.json;

  if (completedMeetings.length === 0) {
    // Provide a static sample if no new actions are found
    return [
      {
        owner: "Asel Peiris",
        title: "Weekly Sync",
        type: "standard_weekly_sync",
        participants: "Asel Peiris, Nileshi Harasgama, Jehan Perera",
        notes: "Sample notes",
        participantRatings: "Asel Peiris: 3.5, Nileshi Harasgama: 2",
        date: "2024-06-24",
      },
    ];
  }

  return completedMeetings.map((meeting) => ({
    owner: meeting.owner,
    title: meeting.title,
    type: meeting.type,
    participants: meeting.participants,
    notes: meeting.notes,
    participantRatings: meeting.participantRatings,
    date: meeting.date,
  }));
};

const subscribeHook = async (z, bundle) => {
  const data = {
    url: bundle.targetUrl, // The URL Zapier provides to receive the webhook notifications
    trigger_type: "meeting_completion",
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
  const meeting = bundle.cleanedRequest;
  return [meeting];
};

module.exports = {
  key: "new_meeting_completion",
  noun: "Meeting Completion",
  display: {
    label: "Meeting Completion",
    description:
      "Triggers when a new S2 Meeting that you have started is completed.",
  },
  operation: {
    inputFields: [],
    type: "hook",
    perform,
    performSubscribe: subscribeHook,
    performList: fetchNewCompletedMeetings,
    performUnsubscribe: unsubscribeHook,
    sample: {
      owner: "Nileshi Harasgama",
      title: "Weekly Sync",
      type: "standard_weekly_sync",
      participants: "Asel Peiris, Nileshi Harasgama, Jehan Perera",
      notes: "Sample Notes",
      participantRatings: "Asel Peiris: 3.5, Nileshi Harasgama: 2",
      date: "2024-06-24",
    },
    outputFields: [
      { key: "owner", label: "Owner" },
      { key: "title", label: "Title" },
      { key: "type", label: "Type" },
      { key: "participants", label: "Participants" },
      { key: "notes", label: "Notes" },
      { key: "participantRatings", label: "Participant Ratings" },
      { key: "date", label: "Date" },
    ],
  },
};
