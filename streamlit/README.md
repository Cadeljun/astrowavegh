# 🎭 AstroWave Ticket Dashboard

A comprehensive Streamlit dashboard for managing Mask Mirage Party tickets.

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time overview of sales, revenue, check-ins |
| 🎫 **Tickets** | View, search, filter, and export all tickets |
| 🎪 **Events** | Manage events and ticket tiers |
| 👤 **Users** | Manage platform users and roles |
| 📱 **Scanner** | Verify tickets at the door |
| 📋 **Reports** | Generate and export reports (CSV, Excel, PDF) |

## Setup

### 1. Install Dependencies

```bash
cd streamlit
pip install -r requirements.txt
```

Or run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Add Firebase Credentials

Get your Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`studio-9129689546-ca9f2`)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Save as `serviceAccountKey.json` in this folder

### 3. Run the Dashboard

```bash
streamlit run app.py
```

The dashboard will open at `http://localhost:8501`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON (alternative to file) |

## Pages

### 📊 Dashboard
- Total tickets sold
- Checked in count
- Revenue
- Sales chart
- Ticket type distribution

### 🎫 Tickets
- Full ticket list
- Search by name, email, ticket ID
- Filter by status (Valid/Used/Cancelled)
- Filter by type (Standard/Group/Complimentary)
- Export to CSV

### 🎪 Events
- List all events
- Create new events
- Edit event details
- Manage ticket tiers

### 👤 Users
- View all users
- Add new users
- Change user roles
- Activate/Deactivate users

### 📱 Scanner
- Manual ticket entry
- Real-time verification
- Stats (total, checked in, remaining)
- Recent scan history

### 📋 Reports
- Sales summary
- Ticket inventory
- Check-in report
- Revenue by tier
- Attendee list
- Export to CSV/Excel/PDF

## Tech Stack

- **Frontend**: Streamlit
- **Database**: Firebase Firestore
- **Auth**: Firebase Admin SDK
- **Charts**: Plotly
- **Data**: Pandas
