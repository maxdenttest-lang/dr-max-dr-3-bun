# Deploy pe Railway - Instrucțiuni Pas cu Pas

## Pasul 1: Pregătire GitHub

### 1.1 Creează repository pe GitHub

1. Mergi pe [github.com](https://github.com)
2. Click "New repository"
3. Nume: `ardental-standalone`
4. Descriere: `ArDental - Sistem de programări independent`
5. Selectează "Public" (pentru a putea conecta cu Railway)
6. Click "Create repository"

### 1.2 Push codul pe GitHub

```bash
cd /path/to/ardental-standalone
git init
git add .
git commit -m "Initial commit: ArDental standalone"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ardental-standalone.git
git push -u origin main
```

## Pasul 2: Setup Railway

### 2.1 Creează cont pe Railway

1. Mergi pe [railway.app](https://railway.app)
2. Click "Start New Project"
3. Selectează "Deploy from GitHub"
4. Autentifică-te cu GitHub

### 2.2 Selectează repository-ul

1. Selectează `ardental-standalone` din lista
2. Click "Deploy"

Railway va detecta automat `package.json` și va configura Node.js.

## Pasul 3: Configurare Variabile de Mediu

### 3.1 Adaugă GOOGLE_SERVICE_ACCOUNT_JSON

1. Pe Railway, mergi la project
2. Click "Variables" (sau "Settings" → "Variables")
3. Click "New Variable"
4. **Key:** `GOOGLE_SERVICE_ACCOUNT_JSON`
5. **Value:** Copiază întreg conținutul fișierului JSON descărcat de la Google Cloud
   - Exemplu: `{"type":"service_account","project_id":"arcane-rigging-469015-e8",...}`
6. Click "Add"

### 3.2 Setează PORT (opțional)

Railway setează automat `PORT` din mediu, dar poți verifica:

1. Click "Variables"
2. Caută `PORT` - ar trebui să fie setat automat

## Pasul 4: Deploy

1. Railway va detecta automat `package.json`
2. Va rula `npm install` și `npm start`
3. Așteptă ca deployment să se finalizeze
4. Vei vedea URL-ul public (ex: `https://ardental-production.up.railway.app`)

## Pasul 5: Testare

1. Deschide URL-ul generat de Railway
2. Ar trebui să vezi interfața ArDental
3. Încearcă să adaugi o programare
4. Verifică că apare în Google Sheets

## Troubleshooting

### Eroare: "Service Account JSON not configured"

**Soluție:**
1. Verifică că ai copiat corect JSON-ul în Railway Variables
2. Asigură-te că nu ai caractere speciale neescapate
3. Copiază din nou JSON-ul și încearcă

### Eroare: "Failed to get access token"

**Soluție:**
1. Verifică că JSON-ul e valid (poți testa pe [jsonlint.com](https://jsonlint.com))
2. Asigură-te că Service Account are permisiuni pe Google Sheet
3. Verifică că email-ul din Service Account e adăugat în Share-ul Sheet-ului

### Aplicația e lentă

**Soluție:**
1. Railway oferă gratuit ~$5/lună
2. Dacă ai nevoie de mai mult, poți upgrade-a planul
3. Verific logs-urile pe Railway Dashboard

## Actualizări Viitoare

Când faci schimbări în cod:

```bash
git add .
git commit -m "Descrierea schimbării"
git push origin main
```

Railway va detecta automat push-ul și va redeploy-a aplicația.

## Comenzi Utile

### Vizualizare Logs

Pe Railway Dashboard:
1. Click pe project
2. Click "Logs" tab
3. Vei vedea output-ul serverului

### Restart Application

Pe Railway Dashboard:
1. Click pe project
2. Click "Deployments"
3. Click "Redeploy" pe deployment-ul curent

### Ștergere Project

Pe Railway Dashboard:
1. Click pe project
2. Click "Settings"
3. Scroll down la "Danger Zone"
4. Click "Delete Project"

## Resurse Utile

- [Railway Docs](https://docs.railway.app)
- [Node.js on Railway](https://docs.railway.app/guides/nodejs)
- [Environment Variables](https://docs.railway.app/guides/variables)

## Support

Dacă ai probleme:
1. Verifică Railway Logs
2. Citește [Railway Documentation](https://docs.railway.app)
3. Contactează Railway Support
