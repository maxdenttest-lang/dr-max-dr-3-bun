# ArDental - Sistem Independent de Programări

Versiune standalone a aplicației ArDental, optimizată pentru Railway, fără dependență de Manus.

## Caracteristici

- ✅ Backend Node.js + Express independent
- ✅ Sincronizare bidirectională cu Google Sheets
- ✅ Interfață web responsivă (mobile-first)
- ✅ Fără dependență de Manus
- ✅ Deploy ușor pe Railway

## Setup Local

### 1. Instalare dependențe

```bash
npm install
```

### 2. Configurare variabile de mediu

Creează fișier `.env` în rădăcina proiectului:

```env
PORT=3000
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"arcane-rigging-469015-e8","private_key_id":"8baafb881eba...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"dentalclinic@arcane-rigging-469015-e8.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### 3. Rulare local

```bash
npm run dev
```

Site-ul va fi disponibil la `http://localhost:3000`

## Deploy pe Railway

### 1. Creează cont pe Railway

Mergi pe [railway.app](https://railway.app) și creează cont.

### 2. Conectează GitHub

- Push codul pe GitHub
- Pe Railway, selectează "New Project" → "Deploy from GitHub"
- Selectează repository-ul

### 3. Configurează variabilele de mediu

Pe Railway:
1. Mergi la "Variables"
2. Adaugă `GOOGLE_SERVICE_ACCOUNT_JSON` cu conținutul din fișierul JSON descărcat de la Google Cloud

### 4. Deploy

Railway va detecta automat `package.json` și va rula `npm start`.

## Structură proiect

```
ardental-standalone/
├── server.js              # Backend Express
├── package.json           # Dependențe
├── .env.example           # Template variabile de mediu
├── public/
│   └── index.html         # Frontend HTML + JavaScript
└── README.md              # Acest fișier
```

## API Endpoints

### GET /api/appointments
Obține toate programările din Google Sheets.

**Response:**
```json
[
  {
    "id": "gs-0",
    "nume": "Ion Popescu",
    "nrTelefon": "40790342380",
    "tipProgramare": "Curățare dentară",
    "data": "06.05.2026",
    "oraProgramarii": "10:30",
    "email": "ion@example.com",
    "notite": "Pacient anxios"
  }
]
```

### POST /api/appointments
Adaugă o nouă programare în Google Sheets.

**Request body:**
```json
{
  "nume": "Ion Popescu",
  "nrTelefon": "40790342380",
  "tipProgramare": "Curățare dentară",
  "data": "06.05.2026",
  "oraProgramarii": "10:30",
  "email": "ion@example.com",
  "notite": "Pacient anxios"
}
```

### DELETE /api/appointments/:id
Șterge o programare din Google Sheets.

### DELETE /api/appointments
Șterge TOATE programările din Google Sheets.

## Configurare Google Sheets

### 1. Descarcă Service Account JSON

- Mergi pe [Google Cloud Console](https://console.cloud.google.com/)
- Selectează proiectul
- Mergi la "APIs & Services" → "Service Accounts"
- Click pe Service Account
- Mergi la "Keys" → "Add Key" → "Create new key" → "JSON"
- Descarcă fișierul

### 2. Partajează Google Sheet-ul

- Deschide Google Sheet-ul
- Click "Share"
- Adaugă email-ul din Service Account (client_email)
- Dă permisiuni de editare

### 3. Copiază ID-ul Sheet-ului

URL-ul Sheet-ului: `https://docs.google.com/spreadsheets/d/1SvadqMvXrkVqaQtxdMPjBcGnudFnmt2mz4CO9eAUiG0/edit`

ID-ul: `1SvadqMvXrkVqaQtxdMPjBcGnudFnmt2mz4CO9eAUiG0`

## Troubleshooting

### "Service Account JSON not configured"
- Asigură-te că ai setat variabila `GOOGLE_SERVICE_ACCOUNT_JSON` în `.env` (local) sau în Railway Variables

### "Failed to get access token"
- Verifică că JSON-ul e valid (fără caractere speciale neescapate)
- Asigură-te că Service Account are permisiuni pe Google Sheet

### "Row not found for deletion"
- Verifică că programarea există în Google Sheets
- Asigură-te că nu ai modificat manual rândurile în Sheet

## Sugestii pentru îmbunătățiri

1. **Validare format telefon** - Acceptă doar numere cu format românesc (40...)
2. **Notificări SMS/Email** - Trimitere automate de confirmări și remindere-uri
3. **Calendar vizual** - Afișare programări pe calendar
4. **Rapoarte** - Export PDF cu statistici zilnice/lunare

## Licență

MIT
