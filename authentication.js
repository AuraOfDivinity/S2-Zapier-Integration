"use strict";

const getAccessToken = async (z, bundle) => {
  z.console.log("bundle input data:", bundle.inputData);

  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/oauth/token`,
    method: "POST",
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: bundle.inputData.code,
      redirect_uri: bundle.inputData.redirect_uri,
    },
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  if (response.status >= 400) {
    throw new Error(`Error fetching access token: ${response.content}`);
  }

  const result = z.JSON.parse(response.content);
  z.console.log("Access token response:", result); // Log the full token response

  // Fetch user's email using the access token
  const userInfoResponse = await z.request({
    url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    method: "GET",
    headers: {
      Authorization: `Bearer ${result.access_token}`,
    },
  });

  if (userInfoResponse.status >= 400) {
    throw new Error(`Error fetching user info: ${userInfoResponse.content}`);
  }

  const userInfo = z.JSON.parse(userInfoResponse.content);

  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_in: result.expires_in,
    email: userInfo.email,
  };
};

const refreshAccessToken = async (z, bundle) => {
  const response = await z.request({
    url: `${process.env.APP_BASE_URL}/oauth/token`,
    method: "POST",
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: bundle.authData.refresh_token,
    },
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
  };
};

const includeBearerToken = (request, z, bundle) => {
  z.console.log("Bundle Auth:", bundle.authData); // Log the full token response
  z.console.log("Bundle input", bundle.inputData);
  if (bundle.authData.access_token) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

const test = (z, bundle) =>
  z.request({
    url: `${process.env.APP_BASE_URL}/webhook/echo`,
  });

module.exports = {
  config: {
    type: "oauth2",
    oauth2Config: {
      authorizeUrl: {
        url: "https://accounts.google.com/o/oauth2/auth",
        params: {
          client_id: "{{process.env.CLIENT_ID}}",
          state: "{{bundle.inputData.state}}",
          redirect_uri: "{{bundle.inputData.redirect_uri}}",
          response_type: "code",
          scope: "email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
      getAccessToken,
      refreshAccessToken,
      autoRefresh: true,
    },
    fields: [],
    test,
    connectionLabel: "{{bundle.authData.email}}",
  },
  befores: [includeBearerToken],
  afters: [],
};
