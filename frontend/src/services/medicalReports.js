
import { apiRequest } from "./api";

const BASE_ENDPOINT = "/reports/medical-records/";

async function getErrorMessage(response) {
  try {
    const data = await response.json();

    if (data.detail) return data.detail;

    return Object.values(data)
      .flat()
      .filter(Boolean)
      .join(" ");
  } catch {
    return `Request failed (${response.status}).`;
  }
}

async function listMedicalReports() {
  const response = await apiRequest(BASE_ENDPOINT);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

async function uploadMedicalReport(file, category = "other") {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("category", category);

  const response = await apiRequest(BASE_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

async function analyzeMedicalReport(id) {
  const response = await apiRequest(
    `${BASE_ENDPOINT}${id}/analyze/`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

async function deleteMedicalReport(id) {
  const response = await apiRequest(`${BASE_ENDPOINT}${id}/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

async function getMedicalReportFile(id, action = "preview") {
  const response = await apiRequest(
    `${BASE_ENDPOINT}${id}/${action}/`
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.blob();
}

export {
  listMedicalReports,
  uploadMedicalReport,
  analyzeMedicalReport,
  deleteMedicalReport,
  getMedicalReportFile,
};
