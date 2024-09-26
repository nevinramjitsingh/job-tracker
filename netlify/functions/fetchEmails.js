// netlify/functions/fetchEmails.js

const { google } = require("googleapis");
const { default: nextAuth } = require("next-auth");
const {
  addApplication,
  updateApplicationStatus,
  findApplicationByCompanyAndPosition,
} = require("../../lib/applications");

exports.handler = async function (event, context) {


  const accessToken = process.env.ACCESS_TOKEN;

  if (!accessToken) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "from:(jobs@example.com) OR subject:(Your Application)",
      maxResults: 50,
    });

    const messages = response.data.messages || [];

    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      await processEmail(msg.data);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Emails processed successfully" }),
    };
  } catch (error) {
    console.error("Error fetching emails:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An unexpected error occurred" }),
    };
  }
};

async function processEmail(email) {
  // Same logic as in pages/api/applications.js
}
