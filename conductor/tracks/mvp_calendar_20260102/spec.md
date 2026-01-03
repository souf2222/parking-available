# Specification for: Build the core functionality for the parking availability calendar with basic status updates and a simple authentication mechanism.

## 1. Overview
This document outlines the specifications for the Minimum Viable Product (MVP) of the parking availability application. The goal is to create a simple, functional web application that allows me to share my parking spot's availability with my neighbor.

## 2. User Stories
### As the owner, I want to:
- Be able to log in to the application to manage the parking availability.
- View a calendar of the current month.
- Mark specific dates as "available," "unavailable," or "partially available."
- Add a custom text note for days with partial availability.
- Have the data I enter be saved securely.

### As the neighbor, I want to:
- Access the application to view the parking availability.
- See a clear, color-coded calendar view of the parking status.
- Read any custom notes for days with partial availability.

## 3. Functional Requirements
### 3.1. Authentication
- A simple authentication mechanism (e.g., a shared password) will be implemented to restrict access.
- There will be two roles: "owner" (can edit) and "neighbor" (can view). For the MVP, a single password for both could be sufficient, with the editing functionality only exposed to the owner.

### 3.2. Calendar View
- The main view will be a calendar displaying the current month.
- Each day on the calendar will have a clear visual indicator of its status:
    - **Green:** Available
    - **Red:** Unavailable
    - **Yellow/Orange:** Partially available
- The calendar should be easy to navigate to future months.

### 3.3. Availability Management (Owner only)
- The owner can click on a day in the calendar to change its status.
- The owner can enter a text note for days marked as "partially available."
- All changes will be saved to the database in real-time or via a "save" button.

### 3.4. Data Storage
- A SQLite database will be used to store availability data.
- The database will store the date, status, and any associated notes.
- The application will retain a rolling 30-day history of past availability.

## 4. Non-Functional Requirements
### 4.1. Security
- The application will be protected against common web vulnerabilities.
- Data will be stored securely.

### 4.2. Usability
- The application will have a clean, minimalist, and mobile-friendly interface, following iOS 26 UI Kit guidelines.
- The user experience will be straightforward and intuitive.

### 4.3. Deployment
- The application will be containerized using Docker for easy deployment on an Unraid server.

## 5. Technology Stack
- **Backend:** Node.js with Express.js
- **Frontend:** React
- **Database:** SQLite
- **Deployment:** Docker
