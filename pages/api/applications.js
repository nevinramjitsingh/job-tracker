// pages/api/applications.js

import { google } from "googleapis";
import { getToken } from "next-auth/jwt";
import {
  addApplication,
  updateApplicationStatus,
  findApplicationByCompanyAndPosition,
  getApplications,
} from "../../lib/applications";
import { trainClassifier, classifyText } from "../../lib/classifier";

// Train the classifier when the server starts
trainClassifier();

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.error === "RefreshAccessTokenError") {
    console.error("No token or token error:", token);
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if token.user is defined
  if (!token.user) {
    console.error("Token user is undefined");
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Replace with your actual email address
  const authorizedEmail = "nevinramjitsingh0@gmail.com";

  if (token.user.email !== authorizedEmail) {
    console.error("Email does not match authorized email");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const accessToken = token.accessToken;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  try {
    // Refined Gmail query to fetch relevant emails
    const response = await gmail.users.messages.list({
      userId: "me",
      q: 'subject:(application OR interview OR assessment OR offer OR "thank you for applying" OR "your application" OR "we received your application")',
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

    res.status(200).json({ applications: getApplications() });
  } catch (error) {
    console.error("Error fetching emails:", error);
    if (error.code === 429) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
}

async function processEmail(email) {
  const { payload, internalDate, id } = email;
  const headers = payload.headers;

  const subjectHeader = headers.find(
    (h) => h.name.toLowerCase() === "subject"
  );
  const fromHeader = headers.find((h) => h.name.toLowerCase() === "from");

  const subject = subjectHeader ? subjectHeader.value : "";
  const from = fromHeader ? fromHeader.value : "";

  // Get the email body content
  const body = await getEmailBody(payload);

  // Check if email is job-related
  if (!isJobRelatedEmail(subject, body)) {
    return; // Skip processing this email
  }

  // Extract company and position
  const company = extractCompany(from, body);
  const position = extractPosition(subject, body);

  const existingApp = findApplicationByCompanyAndPosition(company, position);

  // Combine subject and body for classification
  const emailContent = `${subject} ${body}`;

  // Use the classifier to determine status
  const status = classifyText(emailContent);

  // Construct the email link
  const emailLink = `https://mail.google.com/mail/u/0/#inbox/${id}`;

  const applicationData = {
    id: email.id,
    company,
    position,
    dateApplied: new Date(parseInt(internalDate)),
    status,
    emailLink, // Add the email link
  };

  if (existingApp) {
    updateApplicationStatus(existingApp.id, status);
  } else {
    addApplication(applicationData);
  }
}

// Helper functions

function isJobRelatedEmail(subject, body) {
  const emailContent = `${subject} ${body}`.toLowerCase();
  const jobKeywords = [
    "application",
    "interview",
    "assessment",
    "offer",
    "thank you for applying",
    "your application",
    "we received your application",
    "job opportunity",
    "position",
  ];

  return jobKeywords.some((keyword) => emailContent.includes(keyword));
}

function extractCompany(from, body) {
  // Try to extract company from the 'From' header
  const fromRegex = /"?(.*?)"?\s*<.*?>/;
  const matches = from.match(fromRegex);
  if (matches && matches[1]) {
    return matches[1];
  }

  // Alternative method: Extract from body
  const companyRegex = /Company:\s*(.+)/i;
  const bodyMatch = body.match(companyRegex);
  return bodyMatch ? bodyMatch[1].trim() : "Unknown Company";
}

function extractPosition(subject, body) {
  // Try to extract position from the email subject
  const positionRegex = /for\s+(.*?)$/i;
  const matches = subject.match(positionRegex);
  if (matches && matches[1]) {
    return matches[1].trim();
  }

  // Alternative method: Extract from body
  const positionRegexBody = /Position:\s*(.+)/i;
  const bodyMatch = body.match(positionRegexBody);
  return bodyMatch ? bodyMatch[1].trim() : "Unknown Position";
}

async function getEmailBody(payload) {
  let body = "";

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body.data) {
        body += Buffer.from(part.body.data, "base64").toString("utf-8");
      } else if (part.mimeType === "text/html" && part.body.data) {
        const htmlContent = Buffer.from(part.body.data, "base64").toString("utf-8");
        // Strip HTML tags to get text content
        const textContent = htmlContent.replace(/<[^>]*>/g, " ");
        body += textContent;
      } else if (part.parts) {
        body += await getEmailBody(part);
      }
    }
  } else if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  return body;
}
