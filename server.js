import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as jose from 'jose';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Google Sheets configuration
const SHEET_ID = "1SvadqMvXrkVqaQtxdMPjBcGnudFnmt2mz4CO9eAUiG0";
const SHEET_NAME = "Foaie1";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cache for access token
let cachedAccessToken = { token: '', expiresAt: 0 };

// Helper to get access token from Service Account
async function getAccessToken() {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      console.warn("[Google Sheets] Service Account JSON not configured");
      return "";
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Check if token is still valid
    if (cachedAccessToken.token && cachedAccessToken.expiresAt > Date.now()) {
      return cachedAccessToken.token;
    }

    // Create JWT
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour

    const jwt = await new jose.SignJWT({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + expiresIn,
      iat: now,
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .sign(await jose.importPKCS8(serviceAccount.private_key, "RS256"));

    // Exchange JWT for access token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    });

    if (!response.ok) {
      console.warn("[Google Sheets] Failed to get access token:", response.statusText);
      return "";
    }

    const data = await response.json();
    
    // Cache token
    cachedAccessToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    return data.access_token;
  } catch (error) {
    console.error("[Google Sheets] Error getting access token:", error);
    return "";
  }
}

// Helper to append to Google Sheets
async function appendToGoogleSheets(data) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.warn("[Google Sheets] Could not get access token");
      return;
    }

    const values = [[
      data.nume,
      data.nrTelefon,
      data.tipProgramare,
      data.data,
      data.oraProgramarii,
      data.email,
      data.notite,
    ]];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:G:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn("[Google Sheets] Failed to append:", response.statusText, error);
      return;
    }

    console.log("[Google Sheets] Appointment appended successfully");
  } catch (error) {
    console.error("[Google Sheets] Error appending:", error);
  }
}

// Helper to delete row from Google Sheets
async function deleteFromGoogleSheets(nume, oraProgramarii) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.warn("[Google Sheets] Could not get access token");
      return;
    }

    // First, read all rows to find the one to delete
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn("[Google Sheets] Failed to read for deletion:", response.statusText);
      return;
    }

    const data = await response.json();
    const rows = data.values || [];

    // Find the row index (skip header)
    let rowToDelete = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === nume && rows[i][4] === oraProgramarii) {
        rowToDelete = i;
        break;
      }
    }

    if (rowToDelete === -1) {
      console.warn("[Google Sheets] Row not found for deletion");
      return;
    }

    // Delete the row using batchUpdate
    const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`;

    const deleteResponse = await fetch(deleteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: "ROWS",
                startIndex: rowToDelete,
                endIndex: rowToDelete + 1,
              },
            },
          },
        ],
      }),
    });

    if (!deleteResponse.ok) {
      const error = await deleteResponse.text();
      console.warn("[Google Sheets] Failed to delete:", deleteResponse.statusText, error);
      return;
    }

    console.log("[Google Sheets] Appointment deleted successfully");
  } catch (error) {
    console.error("[Google Sheets] Error deleting:", error);
  }
}

// Helper to clear all rows from Google Sheets
async function clearAllFromGoogleSheets() {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.warn("[Google Sheets] Could not get access token");
      return;
    }

    // Clear all data using batchUpdate
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requests: [
          {
            updateCells: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
              },
              fields: "*",
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn("[Google Sheets] Failed to clear all:", response.statusText);
      return;
    }

    console.log("[Google Sheets] All appointments cleared successfully");
  } catch (error) {
    console.error("[Google Sheets] Error clearing all:", error);
  }
}

// Helper to read from Google Sheets
async function readFromGoogleSheets() {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.warn("[Google Sheets] Could not get access token");
      return [];
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn("[Google Sheets] Failed to read:", response.statusText);
      return [];
    }

    const data = await response.json();
    const rows = data.values || [];

    // Skip header row and map to appointments
    return rows.slice(1).map((row, index) => ({
      id: `gs-${index}`,
      nume: row[0] || "",
      nrTelefon: row[1] || "",
      tipProgramare: row[2] || "",
      data: row[3] || "",
      oraProgramarii: row[4] || "",
      email: row[5] || "",
      notite: row[6] || "",
    }));
  } catch (error) {
    console.error("[Google Sheets] Error reading:", error);
    return [];
  }
}

// API Routes
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await readFromGoogleSheets();
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { nume, nrTelefon, tipProgramare, data, oraProgramarii, email, notite } = req.body;

    // Validation
    if (!nume || !nrTelefon || !tipProgramare || !data || !oraProgramarii || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const appointment = {
      nume,
      nrTelefon,
      tipProgramare,
      data,
      oraProgramarii,
      email,
      notite: notite || '',
    };

    await appendToGoogleSheets(appointment);
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Error adding appointment:', error);
    res.status(500).json({ error: 'Failed to add appointment' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const appointments = await readFromGoogleSheets();
    const appointment = appointments.find(a => a.id === req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await deleteFromGoogleSheets(appointment.nume, appointment.oraProgramarii);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

app.delete('/api/appointments', async (req, res) => {
  try {
    await clearAllFromGoogleSheets();
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing appointments:', error);
    res.status(500).json({ error: 'Failed to clear appointments' });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
