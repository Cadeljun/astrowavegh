"""
Firebase connection for Streamlit dashboard
Uses Firebase Admin SDK for server-side access
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
import streamlit as st

@st.cache_resource
def init_firebase():
    """Initialize Firebase connection (cached)"""
    try:
        # Try to use service account key
        if os.path.exists('serviceAccountKey.json'):
            cred = credentials.Certificate('serviceAccountKey.json')
        elif os.environ.get('FIREBASE_SERVICE_ACCOUNT'):
            cred = credentials.Certificate(json.loads(os.environ['FIREBASE_SERVICE_ACCOUNT']))
        else:
            st.error("⚠️ Firebase credentials not found. Add serviceAccountKey.json or set FIREBASE_SERVICE_ACCOUNT env var.")
            return None
        
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        
        return firestore.client()
    except Exception as e:
        st.error(f"Firebase connection error: {e}")
        return None


def get_tickets(db):
    """Get all tickets from Firestore"""
    try:
        tickets_ref = db.collection('tickets')
        docs = tickets_ref.stream()
        return [doc.to_dict() | {'id': doc.id} for doc in docs]
    except Exception as e:
        st.error(f"Error fetching tickets: {e}")
        return []


def get_events(db):
    """Get all events from Firestore"""
    try:
        events_ref = db.collection('events')
        docs = events_ref.stream()
        return [doc.to_dict() | {'id': doc.id} for doc in docs]
    except Exception as e:
        st.error(f"Error fetching events: {e}")
        return []


def get_users(db):
    """Get all users from Firestore"""
    try:
        users_ref = db.collection('users')
        docs = users_ref.stream()
        return [doc.to_dict() | {'id': doc.id} for doc in docs]
    except Exception as e:
        st.error(f"Error fetching users: {e}")
        return []


def mark_ticket_used(db, ticket_id):
    """Mark a ticket as used"""
    try:
        from google.cloud.firestore_v1 import SERVER_TIMESTAMP
        db.collection('tickets').document(ticket_id).update({
            'status': 'used',
            'checkedInAt': SERVER_TIMESTAMP
        })
        return True
    except Exception as e:
        st.error(f"Error marking ticket: {e}")
        return False


def get_ticket_stats(db):
    """Get ticket statistics"""
    tickets = get_tickets(db)
    total = len(tickets)
    checked_in = len([t for t in tickets if t.get('status') == 'used'])
    remaining = total - checked_in
    revenue = sum(t.get('price', 0) for t in tickets if t.get('status') in ['valid', 'used'])
    
    return {
        'total': total,
        'checked_in': checked_in,
        'remaining': remaining,
        'revenue': revenue,
        'tickets': tickets
    }
