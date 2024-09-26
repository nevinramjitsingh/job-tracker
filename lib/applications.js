// lib/applications.js

let applications = [];

export function addApplication(app) {
  applications.push(app);
}

export function updateApplicationStatus(id, status) {
  const app = applications.find((a) => a.id === id);
  if (app) {
    app.status = status;
  }
}

export function findApplicationByCompanyAndPosition(company, position) {
  return applications.find(
    (app) => app.company === company && app.position === position
  );
}

export function getApplications() {
  return applications;
}
