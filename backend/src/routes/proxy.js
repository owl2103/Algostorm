const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const upload = multer({ storage: multer.memoryStorage() });

function pythonBaseUrl() {
  return process.env.PY_INFER_URL || "http://127.0.0.1:8000";
}

function createProxyRouter() {
  const router = express.Router();

  router.get("/metrics", async (_req, res) => {
    try {
      const r = await axios.get(`${pythonBaseUrl()}/metrics`, { timeout: 15000 });
      res.json(r.data);
    } catch (e) {
      res.status(502).json({ error: "Failed to fetch metrics from python service", detail: String(e) });
    }
  });

  router.post("/predict", async (req, res) => {
    try {
      const r = await axios.post(`${pythonBaseUrl()}/predict`, req.body, { timeout: 15000 });
      res.json(r.data);
    } catch (e) {
      res.status(502).json({ error: "Failed to predict via python service", detail: String(e) });
    }
  });

  router.post("/predict-batch", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Missing CSV file (multipart field name: file)" });
      }
      const form = new FormData();
      form.append("file", req.file.buffer, { filename: req.file.originalname || "batch.csv" });

      const r = await axios.post(`${pythonBaseUrl()}/predict-batch`, form, {
        headers: form.getHeaders(),
        timeout: 60000,
      });
      res.json(r.data);
    } catch (e) {
      res.status(502).json({ error: "Failed to batch predict via python service", detail: String(e) });
    }
  });

  return router;
}

module.exports = { createProxyRouter };

