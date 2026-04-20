// ============================================
// Project: SYNAPSE — GraphRAG Knowledge Engine
// Author: Telvin Crasta
// GitHub: github.com/yourhandle
// License: CC BY-NC 4.0
// Original design and architecture by Telvin Crasta
// ============================================

import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const uploadDocuments = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await axios.post(`${BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
  });
  return res.data;
};

export const queryGraph = async (question) => {
  const res = await axios.post(`${BASE}/query`, { question }, { timeout: 60000 });
  return res.data;
};

export const getGraph = async () => {
  const res = await axios.get(`${BASE}/graph`);
  return res.data;
};

export const getStatus = async () => {
  const res = await axios.get(`${BASE}/status`);
  return res.data;
};
