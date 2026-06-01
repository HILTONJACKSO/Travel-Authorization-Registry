# Ministry of State - Sovereign Ledger

A highly secure, federated architecture platform built to manage official government travel requests, departmental proxy delegations, and secure document verification via cryptographic signatures and immutable archive trails.

## Tech Stack
- **Frontend**: Next.js 16 (React), Bootstrap 5 (Custom Glassmorphic Sovereign Theme), Axios
- **Backend**: Django, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL / SQLite
- **Security**: Rate-limiting, IP-tracking, Token Rotation, File Upload Entropy/Extension Scanning

## Features
- **Centralized Dashboard**: Complete transparency into the system's archive logs and authorization trails.
- **Proxy Workflows**: Officials can temporarily delegate proxy authority to other registered officials securely.
- **Robust Security**: Multi-factor capability, dynamic session validation, explicit file type validation, and strict permissioning algorithms.

## Setup Instructions

### Backend Setup
1. Navigate to `backend/` and create a virtual environment: `python -m venv venv`
2. Activate the virtual environment: `.\venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt` *(Note: requires gunicorn for deployment)*
4. Run migrations: `python manage.py migrate`
5. Start the server: `python manage.py runserver`

### Frontend Setup
1. Navigate to `frontend/`
2. Install Node dependencies: `npm install`
3. Run the development server: `npm run dev`

## Production Deployment
The system is built for containerized deployment (Docker/Docker Compose) with a WSGI entrypoint and Nginx reverse proxy.
