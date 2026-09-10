"""
AstroWave Admin Dashboard
Replaces the admin panel with Streamlit
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import json
import os

# Page config
st.set_page_config(
    page_title="AstroWave Admin",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark theme
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { font-family: 'Inter', sans-serif; }
    
    .stApp {
        background: #090909;
    }
    
    .main-header {
        font-size: 2.5rem;
        font-weight: 800;
        color: #DAAF48;
        text-transform: uppercase;
        letter-spacing: 3px;
        margin-bottom: 0;
    }
    
    .sub-header {
        font-size: 0.8rem;
        color: #B4B4B4;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: 0;
    }
    
    div[data-testid="stSidebar"] {
        background: #0A0A0A;
        border-right: 1px solid rgba(218,175,72,0.1);
    }
    
    div[data-testid="stSidebar"] .stMarkdown h1 { color: #DAAF48; font-size: 1.2rem; }
    div[data-testid="stSidebar"] .stMarkdown h2 { color: #DAAF48; font-size: 1rem; }
    div[data-testid="stSidebar"] .stMarkdown h3 { color: #F5F5F5; font-size: 0.9rem; }
    
    div[data-testid="stMetric"] {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 15px;
    }
    
    div[data-testid="stMetric"] label { color: #B4B4B4 !important; }
    div[data-testid="stMetric"] div[data-testid="stMetricValue"] { color: #F5F5F5 !important; }
    
    .stButton > button {
        background: #DAAF48;
        color: #090909;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .stButton > button:hover {
        background: #C49A3D;
    }
    
    div[data-testid="stExpander"] {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
    }
    
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        color: #B4B4B4;
    }
    
    .stTabs [aria-selected="true"] {
        background: rgba(218,175,72,0.1) !important;
        color: #DAAF48 !important;
    }
</style>
""", unsafe_allow_html=True)


# ─── FIREBASE CONNECTION ───────────────────────────────────────────────

@st.cache_resource
def get_firestore():
    """Initialize Firebase connection"""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        if os.path.exists('serviceAccountKey.json'):
            cred = credentials.Certificate('serviceAccountKey.json')
        elif os.environ.get('FIREBASE_SERVICE_ACCOUNT'):
            cred = credentials.Certificate(json.loads(os.environ['FIREBASE_SERVICE_ACCOUNT']))
        else:
            return None
        
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        
        return firestore.client()
    except Exception as e:
        return None


def get_collection(db, collection_name):
    """Get all documents from a collection"""
    try:
        docs = db.collection(collection_name).stream()
        return [doc.to_dict() | {'_id': doc.id} for doc in docs]
    except:
        return []


# ─── SIDEBAR ───────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("# 🎭 AstroWave")
    st.markdown("### Admin Panel")
    st.markdown("---")
    
    page = st.radio(
        "Navigation",
        ["📊 Dashboard", "🎫 Tickets", "🎪 Events", "👥 Users", "📱 Scanner", "📋 Reports", "⚙️ Settings"],
        label_visibility="collapsed"
    )
    
    st.markdown("---")
    
    # Connection status
    db = get_firestore()
    if db:
        st.success("✓ Connected to Firebase")
    else:
        st.error("✗ Not connected")
        st.caption("Add serviceAccountKey.json to streamlit/ folder")
    
    st.markdown("---")
    st.markdown(f"**{datetime.now().strftime('%B %d, %Y')}**")
    st.markdown(f"*{datetime.now().strftime('%I:%M %p %Z')}*")


# ─── DASHBOARD ─────────────────────────────────────────────────────────

if page == "📊 Dashboard":
    st.markdown('<p class="main-header">Dashboard</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Mask Mirage Party — Live Overview</p>', unsafe_allow_html=True)
    st.markdown("")
    
    # Get data
    tickets = get_collection(db, 'tickets') if db else []
    events = get_collection(db, 'events') if db else []
    
    # Calculate stats
    total_tickets = len(tickets)
    checked_in = len([t for t in tickets if t.get('status') == 'used'])
    remaining = total_tickets - checked_in
    revenue = sum(t.get('price', 0) for t in tickets)
    
    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Tickets", total_tickets)
    with col2:
        st.metric("Checked In", checked_in, f"{(checked_in/total_tickets*100) if total_tickets > 0 else 0:.0f}%")
    with col3:
        st.metric("Revenue", f"GH¢{revenue:,.0f}")
    with col4:
        st.metric("Remaining", remaining)
    
    st.markdown("")
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Ticket Status")
        if total_tickets > 0:
            status_data = pd.DataFrame({
                'Status': ['Checked In', 'Valid', 'Other'],
                'Count': [checked_in, remaining, 0]
            })
            fig = px.pie(status_data, values='Count', names='Status',
                         color_discrete_sequence=['#00C853', '#DAAF48', '#B4B4B4'],
                         hole=0.6)
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font_color='#B4B4B4',
                showlegend=True,
                height=300
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No tickets yet")
    
    with col2:
        st.markdown("#### Ticket Types")
        if tickets:
            type_counts = {}
            for t in tickets:
                tt = t.get('ticketType', 'Unknown')
                type_counts[tt] = type_counts.get(tt, 0) + 1
            
            type_data = pd.DataFrame({
                'Type': list(type_counts.keys()),
                'Count': list(type_counts.values())
            })
            fig = px.bar(type_data, x='Type', y='Count',
                        color_discrete_sequence=['#DAAF48'])
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font_color='#B4B4B4',
                height=300
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No tickets yet")
    
    # Recent tickets
    st.markdown("---")
    st.markdown("#### Recent Tickets")
    if tickets:
        recent = sorted(tickets, key=lambda x: x.get('createdAt', ''), reverse=True)[:5]
        for t in recent:
            col1, col2, col3, col4 = st.columns([3, 2, 2, 1])
            with col1:
                st.write(f"**{t.get('name', 'Unknown')}**")
            with col2:
                st.write(t.get('ticketId', 'N/A'))
            with col3:
                st.write(t.get('ticketType', 'N/A'))
            with col4:
                status = t.get('status', 'unknown')
                if status == 'valid':
                    st.success("Valid")
                elif status == 'used':
                    st.warning("Used")
                else:
                    st.error(status)
    else:
        st.info("No tickets yet. Tickets will appear here after purchases.")


# ─── TICKETS ───────────────────────────────────────────────────────────

elif page == "🎫 Tickets":
    st.markdown('<p class="main-header">Tickets</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Manage all tickets</p>', unsafe_allow_html=True)
    st.markdown("")
    
    tickets = get_collection(db, 'tickets') if db else []
    
    # Filters
    col1, col2, col3 = st.columns(3)
    with col1:
        search = st.text_input("🔍 Search", placeholder="Name, email, or ticket ID")
    with col2:
        status_filter = st.selectbox("Status", ["All", "Valid", "Used", "Cancelled"])
    with col3:
        type_filter = st.selectbox("Type", ["All", "Standard", "Group of 4", "Complimentary"])
    
    # Filter tickets
    filtered = tickets
    if search:
        search_lower = search.lower()
        filtered = [t for t in filtered if 
                   search_lower in (t.get('name', '') + t.get('email', '') + t.get('ticketId', '')).lower()]
    if status_filter != "All":
        filtered = [t for t in filtered if t.get('status', '').lower() == status_filter.lower()]
    if type_filter != "All":
        filtered = [t for t in filtered if t.get('ticketType', '') == type_filter]
    
    st.markdown(f"**{len(filtered)} tickets found**")
    st.markdown("")
    
    # Display tickets
    if filtered:
        for t in filtered:
            with st.container():
                col1, col2, col3, col4, col5 = st.columns([3, 2, 2, 2, 1])
                with col1:
                    st.write(f"**{t.get('name', 'Unknown')}**")
                    st.caption(t.get('email', ''))
                with col2:
                    st.write(f"`{t.get('ticketId', 'N/A')}`")
                with col3:
                    st.write(t.get('ticketType', 'N/A'))
                with col4:
                    st.write(f"GH¢{t.get('price', 0)}")
                with col5:
                    status = t.get('status', 'unknown')
                    if status == 'valid':
                        st.success("✓")
                    elif status == 'used':
                        st.warning("✓")
                    else:
                        st.error("✗")
                st.markdown("---")
    else:
        st.info("No tickets match your filters.")
    
    # Export
    if filtered:
        st.markdown("")
        df = pd.DataFrame(filtered)
        csv = df.to_csv(index=False)
        st.download_button(
            "📥 Export to CSV",
            csv,
            "tickets.csv",
            "text/csv",
            key='export-csv'
        )


# ─── EVENTS ────────────────────────────────────────────────────────────

elif page == "🎪 Events":
    st.markdown('<p class="main-header">Events</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Manage your events</p>', unsafe_allow_html=True)
    st.markdown("")
    
    events = get_collection(db, 'events') if db else []
    
    # Create new event
    with st.expander("➕ Create New Event"):
        with st.form("new_event"):
            col1, col2 = st.columns(2)
            with col1:
                title = st.text_input("Event Title *")
                category = st.selectbox("Category", ["Nightlife", "Parties", "Concerts", "Networking", "Festivals"])
                venue = st.text_input("Venue *")
            with col2:
                event_date = st.date_input("Event Date")
                event_time = st.time_input("Event Time")
                city = st.text_input("City", value="Accra")
            
            description = st.text_area("Description")
            
            st.markdown("##### Ticket Tiers")
            tier_name = st.text_input("Tier Name", value="General Admission")
            col1, col2 = st.columns(2)
            with col1:
                tier_price = st.number_input("Price (GHS)", min_value=0, value=50)
            with col2:
                tier_qty = st.number_input("Quantity", min_value=1, value=100)
            
            submitted = st.form_submit_button("Create Event")
            if submitted:
                if title and venue:
                    st.success(f"Event '{title}' created!")
                    st.info("Note: Connect to Firebase to save events")
                else:
                    st.error("Please fill in required fields")
    
    st.markdown("")
    
    # List events
    st.markdown("### Your Events")
    if events:
        for event in events:
            with st.container():
                col1, col2, col3 = st.columns([4, 2, 1])
                with col1:
                    st.write(f"**{event.get('title', 'Untitled')}**")
                    st.caption(f"{event.get('venue', 'TBA')} • {event.get('city', '')}")
                with col2:
                    st.write(f"📅 {event.get('date', 'TBD')}")
                    st.write(f"Status: {event.get('status', 'draft')}")
                with col3:
                    st.button("Edit", key=f"edit_{event.get('_id', '')}")
                st.markdown("---")
    else:
        st.info("No events yet. Create your first event above.")


# ─── USERS ─────────────────────────────────────────────────────────────

elif page == "👥 Users":
    st.markdown('<p class="main-header">Users</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Manage platform users</p>', unsafe_allow_html=True)
    st.markdown("")
    
    users = get_collection(db, 'users') if db else []
    
    # Stats
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Users", len(users))
    with col2:
        active = len([u for u in users if u.get('active', True)])
        st.metric("Active", active)
    with col3:
        st.metric("Inactive", len(users) - active)
    
    st.markdown("")
    
    # Add user
    with st.expander("➕ Add New User"):
        col1, col2, col3 = st.columns(3)
        with col1:
            new_name = st.text_input("Full Name", key="new_user_name")
        with col2:
            new_email = st.text_input("Email", key="new_user_email")
        with col3:
            new_role = st.selectbox("Role", ["user", "editor", "admin"], key="new_user_role")
        
        if st.button("Add User"):
            if new_name and new_email:
                st.success(f"User {new_name} added!")
                st.info("Note: Connect to Firebase to save users")
            else:
                st.error("Please fill in name and email")
    
    st.markdown("")
    
    # User list
    st.markdown("### User List")
    if users:
        for user in users:
            col1, col2, col3, col4 = st.columns([3, 3, 2, 1])
            with col1:
                st.write(f"**{user.get('displayName', user.get('name', 'Unknown'))}**")
            with col2:
                st.write(user.get('email', ''))
            with col3:
                st.write(user.get('role', 'user'))
            with col4:
                status = "Active" if user.get('active', True) else "Inactive"
                st.success(status) if user.get('active', True) else st.error(status)
            st.markdown("---")
    else:
        st.info("No users found.")


# ─── SCANNER ───────────────────────────────────────────────────────────

elif page == "📱 Scanner":
    st.markdown('<p class="main-header">Ticket Scanner</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Verify tickets at the door</p>', unsafe_allow_html=True)
    st.markdown("")
    
    tickets = get_collection(db, 'tickets') if db else []
    
    # Stats
    total = len(tickets)
    checked_in = len([t for t in tickets if t.get('status') == 'used'])
    remaining = total - checked_in
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total", total)
    with col2:
        st.metric("Checked In", checked_in)
    with col3:
        st.metric("Remaining", remaining)
    
    st.markdown("")
    
    # Scanner
    st.markdown("### Scan Ticket")
    ticket_id = st.text_input("Enter Ticket ID or scan QR", placeholder="MM26-XXXXXXXX", key="scan_input")
    
    col1, col2 = st.columns([3, 1])
    with col1:
        if st.button("✅ Verify Ticket", type="primary", use_container_width=True):
            if ticket_id:
                # Look up ticket
                found = [t for t in tickets if t.get('ticketId', '').upper() == ticket_id.upper()]
                if found:
                    ticket = found[0]
                    if ticket.get('status') == 'valid':
                        st.success(f"✅ VALID — {ticket.get('name', 'Unknown')}")
                        st.write(f"Type: {ticket.get('ticketType', 'N/A')}")
                        st.write(f"ID: {ticket.get('ticketId', 'N/A')}")
                        st.balloons()
                    elif ticket.get('status') == 'used':
                        st.warning(f"⚠️ ALREADY SCANNED — {ticket.get('name', 'Unknown')}")
                    else:
                        st.error(f"❌ INVALID — Status: {ticket.get('status', 'unknown')}")
                else:
                    st.error("❌ Ticket not found")
            else:
                st.error("Please enter a ticket ID")
    
    with col2:
        if st.button("🔄 Clear", use_container_width=True):
            st.rerun()
    
    st.markdown("")
    
    # Recent scans
    st.markdown("### Recent Scans")
    st.info("Scans will appear here during the event.")


# ─── REPORTS ───────────────────────────────────────────────────────────

elif page == "📋 Reports":
    st.markdown('<p class="main-header">Reports</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Generate and export data</p>', unsafe_allow_html=True)
    st.markdown("")
    
    tickets = get_collection(db, 'tickets') if db else []
    
    report_type = st.selectbox("Report Type", [
        "Sales Summary",
        "Ticket Inventory",
        "Check-in Report",
        "Revenue by Tier",
        "Attendee List"
    ])
    
    col1, col2 = st.columns(2)
    with col1:
        start_date = st.date_input("Start Date", value=datetime.now() - timedelta(days=30))
    with col2:
        end_date = st.date_input("End Date", value=datetime.now())
    
    st.markdown("")
    
    if st.button("📊 Generate Report", type="primary"):
        if tickets:
            st.success(f"Report generated with {len(tickets)} records")
            
            # Show preview
            df = pd.DataFrame(tickets)
            st.dataframe(df.head(20))
            
            # Download
            csv = df.to_csv(index=False)
            st.download_button(
                "📥 Download CSV",
                csv,
                f"report_{datetime.now().strftime('%Y%m%d')}.csv",
                "text/csv"
            )
        else:
            st.info("No data available for this report")


# ─── SETTINGS ──────────────────────────────────────────────────────────

elif page == "⚙️ Settings":
    st.markdown('<p class="main-header">Settings</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Configuration</p>', unsafe_allow_html=True)
    st.markdown("")
    
    st.markdown("### Firebase Connection")
    if db:
        st.success("✓ Connected to Firebase")
        st.write(f"Project: studio-9129689546-ca9f2")
    else:
        st.error("✗ Not connected")
        st.markdown("""
        To connect:
        1. Go to Firebase Console → Project Settings → Service Accounts
        2. Generate new private key
        3. Save as `serviceAccountKey.json` in the `streamlit/` folder
        4. Restart the Streamlit app
        """)
    
    st.markdown("")
    st.markdown("### Environment Variables")
    st.code("""
# Required for Firebase connection:
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Or save as file:
streamlit/serviceAccountKey.json
    """)
    
    st.markdown("")
    st.markdown("### App Info")
    st.write(f"Version: 1.0.0")
    st.write(f"Last updated: {datetime.now().strftime('%B %d, %Y')}")


# ─── FOOTER ────────────────────────────────────────────────────────────

st.markdown("---")
st.markdown(
    '<p style="text-align:center; color: rgba(180,180,180,0.3); font-size: 0.7rem;">'
    '© 2026 AstroWave Entertainment • Admin Dashboard'
    '</p>',
    unsafe_allow_html=True
)
