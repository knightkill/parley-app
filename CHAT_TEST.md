# Real-Time Chat Testing Guide

## ✅ Fixes Applied

1. **Added NEXT_PUBLIC_SITE_URL** to `.env`
2. **Updated Socket.io client** with fallback URL handling
3. **Fixed socket event listener** to prevent duplicate messages and stale closures

## 🧪 How to Test Real-Time Chat

### Method 1: Two Browser Windows (Easiest)

1. **Open First Window:**
   - Go to http://localhost:3000
   - Login as: `mike.brown@email.com` / `password123`
   - Navigate to Chat → Click on conversation with John Smith

2. **Open Second Window (Incognito/Private):**
   - Go to http://localhost:3000
   - Login as: `john.smith@school.com` / `password123`
   - Navigate to Chat → Click on conversation with Mike Brown

3. **Test Real-Time:**
   - Type a message in Window 1 (Mike's view)
   - **Watch Window 2** - Message should appear instantly!
   - Type a response in Window 2 (John's view)
   - **Watch Window 1** - Response should appear instantly!

### Method 2: Two Different Browsers

1. **Browser 1 (e.g., Chrome):** Login as Parent
2. **Browser 2 (e.g., Firefox):** Login as Teacher
3. Send messages and watch them appear in real-time!

## 🔍 What to Look For

### ✅ Success Indicators:
- Messages appear **instantly** in both windows
- No page refresh needed
- Smooth, real-time experience
- Messages show up in the correct order

### ❌ If Not Working:
- Check browser console for errors (F12 → Console tab)
- Look for Socket.io connection messages
- Verify both users are in the same conversation

## 🎯 Test Scenarios

### Basic Test
1. User A sends: "Hello!"
2. User B should see it immediately
3. User B sends: "Hi there!"
4. User A should see it immediately

### Multiple Messages
1. Send 3-4 messages rapidly from User A
2. All should appear in User B's window
3. No duplicates, correct order

### Reconnection Test
1. Close one browser window
2. Reopen and login again
3. Send a message
4. Should still work!

## 📊 Technical Details

### Socket.io Connection
The app now:
- Connects to: `http://localhost:3000`
- Uses path: `/api/socket/io`
- Joins conversation rooms automatically
- Broadcasts messages to all participants

### What Changed
- **Socket URL**: Now properly configured with environment variable
- **Event Handling**: Prevents duplicate messages
- **Connection**: More reliable with fallback URL handling

## 🐛 Debugging

If you see issues, check console logs for:
- "Socket connected" - Confirms connection
- "Socket KqcD3Rp6... joined conversation ..." - Confirms room join
- Any Socket.io errors

Server logs will show:
- New socket connections
- Join/leave events
- Message broadcasts
