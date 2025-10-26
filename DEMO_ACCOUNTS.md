# Demo Accounts for Parley

## 👨‍🏫 Teacher Accounts

### John Smith
- **Email:** john.smith@school.com
- **Password:** password123
- **Connected Parents:** Mike Brown (Tommy), Emily Davis (Emma)
- **Has:** Messages, appointments, notices

### Sarah Johnson
- **Email:** sarah.johnson@school.com
- **Password:** password123
- **Connected Parents:** James Wilson (Olivia)
- **Has:** Messages, appointments, complaints

## 👨‍👩‍👧‍👦 Parent Accounts

### Mike Brown
- **Email:** mike.brown@email.com
- **Password:** password123
- **Child:** Tommy Brown
- **Teacher:** John Smith
- **Has:** Ongoing chat conversation, confirmed appointment in 3 days, field trip notice

### Emily Davis
- **Email:** emily.davis@email.com
- **Password:** password123
- **Child:** Emma Davis
- **Teacher:** John Smith
- **Has:** Recent messages about science project, pending appointment in 5 days, commendation notice

### James Wilson
- **Email:** james.wilson@email.com
- **Password:** password123
- **Child:** Olivia Wilson
- **Teacher:** Sarah Johnson
- **Has:** Recent message about spelling bee win, confirmed appointment in 7 days, homework complaint

## 🎫 Active Invite Code

**Code:** DEMO2024
**For Teacher:** John Smith
**Status:** Active (not yet used)
**Expires:** 30 days from creation

## 📊 Sample Data Included

### Messages (7 total)
- Conversation between Mike and John about Tommy's math progress (2 days ago)
- Messages between Emily and John about science project (1 day ago)
- Recent messages between James and Sarah about spelling bee (3 hours ago)

### Appointments (3 total)
- **Confirmed:** Mike & John - 3 days from now (math discussion)
- **Pending:** Emily & John - 5 days from now (science project review)
- **Confirmed:** James & Sarah - 7 days from now (parent-teacher conference)

### Notices (3 total)
- **Notice:** Field trip reminder for Tommy (5 days ago)
- **Notice:** Commendation for Emma's project (3 days ago)
- **Complaint:** Missing homework for Olivia (1 day ago)

## 🚀 Quick Start Demo Flow

1. **Login as Teacher (John Smith)**
   - View connected parents on dashboard
   - Check messages from Mike and Emily
   - See upcoming appointments
   - Generate a new invite code

2. **Login as Parent (Mike Brown)**
   - View chat with teacher
   - See confirmed appointment
   - Read field trip notice
   - Schedule new appointment

3. **Test Invite System**
   - Login as a new parent account
   - Use code: DEMO2024
   - Connect with John Smith

## 🔄 Reset Demo Data

To reset and regenerate demo data:
```bash
npx prisma migrate reset
npx prisma db seed
```

**Note:** This will delete all existing data and recreate the demo accounts.
