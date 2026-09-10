"""
AstroWave Ticket Dashboard
Built with Streamlit
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
    page_title="AstroWave Dashboard",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
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
    .metric-card {
        background: linear-gradient(135deg, rgba(218,175,72,0.05), rgba(218,175,72,0.02));
        border: 1px solid rgba(218,175,72,0.15);
        border-radius: 12px;
        padding: 20px;
    }
    .stMetric {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 15px;
    }
    div[data-testid="stSidebar"] {
        background: #090909;
    }
    div[data-testid="stSidebar"] .stMarkdown h1,
    div[data-testid="stSidebar"] .stMarkdown h2,
    div[data-testid="stSidebar"] .stMarkdown h3 {
        color: #DAAF48;
    }
</style>
""", unsafe_allow_html=True)


# ─── SIDEBAR NAVIGATION ────────────────────────────────────────────────

with st.sidebar:
    st.markdown("# 🎭 AstroWave")
    st.markdown("---")
    
    page = st.radio(
        "Navigation",
        ["📊 Dashboard", "🎫 Tickets", "🎪 Events", "👤 Users", "📱 Scanner", "📋 Reports"],
        label_visibility="collapsed"
    )
    
    st.markdown("---")
    st.markdown(f"**{datetime.now().strftime('%B %d, %Y')}**")
    st.markdown(f"*{datetime.now().strftime('%I:%M %p')}*")


# ─── DASHBOARD PAGE ────────────────────────────────────────────────────

if page == "📊 Dashboard":
    st.markdown('<p class="main-header">Dashboard</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Mask Mirage Party — Overview</p>', unsafe_allow_html=True)
    st.markdown("")
    
    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Tickets", "0", "0 today")
    with col2:
        st.metric("Checked In", "0", "0%")
    with col3:
        st.metric("Revenue", "GH¢0", "GH¢0 today")
    with col4:
        st.metric("Remaining", "0", "")
    
    st.markdown("")
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Sales Over Time")
        # Sample data
        chart_data = pd.DataFrame({
            'Date': pd.date_range(start='2026-08-01', periods=7),
            'Tickets': [0, 0, 0, 0, 0, 0, 0]
        })
        fig = px.line(chart_data, x='Date', y='Tickets', 
                      template='plotly_dark',
                      line_shape='spline')
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#B4B4B4'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("### Ticket Types")
        type_data = pd.DataFrame({
            'Type': ['Standard', 'Group of 4', 'Complimentary'],
            'Count': [0, 0, 0]
        })
        fig = px.pie(type_data, values='Count', names='Type',
                     template='plotly_dark',
                     color_discrete_sequence=['#DAAF48', '#00C853', '#0EA5E9'])
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#B4B4B4'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Recent activity
    st.markdown("### Recent Activity")
    st.info("No recent activity. Tickets will appear here after purchases.")


# ─── TICKETS PAGE ──────────────────────────────────────────────────────

elif page == "🎫 Tickets":
    st.markdown('<p class="main-header">Tickets</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Manage all tickets</p>', unsafe_allow_html=True)
    st.markdown("")
    
    # Filters
    col1, col2, col3 = st.columns(3)
    with col1:
        search = st.text_input("🔍 Search", placeholder="Name, email, or ticket ID")
    with col2:
        status_filter = st.selectbox("Status", ["All", "Valid", "Used", "Cancelled"])
    with col3:
        type_filter = st.selectbox("Type", ["All", "Standard", "Group of 4", "Complimentary"])
    
    st.markdown("")
    
    # Sample empty table
    st.markdown("### Ticket List")
    st.info("No tickets yet. Tickets will appear here after purchases.")
    
    # Export button
    st.markdown("---")
    if st.button("📥 Export to CSV"):
        st.success("Export feature ready — will download when tickets exist")


# ─── EVENTS PAGE ───────────────────────────────────────────────────────

elif page == "🎪 Events":
    st.markdown('<p class="main-header">Events</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Manage your events</p>', unsafe_allow_html=True)
    st.markdown("")
    
    if st.button("➕ Create New Event", type="primary"):
        st.switch_page("pages/create_event.py") if os.path.exists("pages/create_event.py") else st.info("Event creation form coming soon")
    
    st.markdown("")
    
    # Events list
    st.markdown("### Your Events")
    
    # Sample event card
    with st.container():
        col1, col2 = st.columns([3, 1])
        with col1:
            st.markdown("**🎭 Mask Mirage Party**")
            st.caption("10 October 2026 • Coaches Lounge, East Legon • Published")
        with col2:
            st.button("Edit", key="edit_mask")
    
    st.markdown("---")
    st.info("Add more events from the admin panel or create them here.")


# ─── USERS PAGE ────────────────────────────────────────────────────────

elif page == "👤 Users":
    st.markdown('<p class="main-header">Users</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Manage platform users</p>', unsafe_allow_html=True)
    st.markdown("")
    
    # Add user form
    with st.expander("➕ Add New User"):
        col1, col2 = st.columns(2)
        with col1:
            new_name = st.text_input("Full Name")
            new_email = st.text_input("Email")
        with col2:
            new_role = st.selectbox("Role", ["User", "Editor", "Admin"])
        
        if st.button("Add User"):
            if new_name and new_email:
                st.success(f"User {new_name} added!")
            else:
                st.error("Please fill in all fields")
    
    st.markdown("")
    
    # Users table
    st.markdown("### User List")
    st.info("Users will appear here after they sign up.")


# ─── SCANNER PAGE ──────────────────────────────────────────────────────

elif page == "📱 Scanner":
    st.markdown('<p class="main-header">Ticket Scanner</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Scan and verify tickets at the door</p>', unsafe_allow_html=True)
    st.markdown("")
    
    # Stats
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Tickets", "0")
    with col2:
        st.metric("Checked In", "0")
    with col3:
        st.metric("Remaining", "0")
    
    st.markdown("")
    
    # Manual entry
    st.markdown("### Manual Entry")
    ticket_id = st.text_input("Enter Ticket ID", placeholder="MM26-XXXXXXXX")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("✅ Verify Ticket", type="primary", use_container_width=True):
            if ticket_id:
                st.warning("Connect to Firebase to verify tickets")
            else:
                st.error("Please enter a ticket ID")
    
    with col2:
        if st.button("🔄 Clear", use_container_width=True):
            st.rerun()
    
    st.markdown("")
    
    # Recent scans
    st.markdown("### Recent Scans")
    st.info("Scans will appear here during the event.")


# ─── REPORTS PAGE ──────────────────────────────────────────────────────

elif page == "📋 Reports":
    st.markdown('<p class="main-header">Reports</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Generate and export reports</p>', unsafe_allow_html=True)
    st.markdown("")
    
    # Report types
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
        st.info("Connect to Firebase to generate reports")
    
    st.markdown("")
    
    # Export options
    st.markdown("### Export Options")
    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("📥 Export CSV"):
            st.info("Will download when data exists")
    with col2:
        if st.button("📄 Export PDF"):
            st.info("Coming soon")
    with col3:
        if st.button("📊 Export Excel"):
            st.info("Coming soon")


# ─── FOOTER ────────────────────────────────────────────────────────────

st.markdown("---")
st.markdown(
    '<p style="text-align:center; color: rgba(180,180,180,0.4); font-size: 0.7rem;">'
    '© 2026 AstroWave Entertainment • Mask Mirage Party'
    '</p>',
    unsafe_allow_html=True
)
