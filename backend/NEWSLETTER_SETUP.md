# Newsletter Subscription System

## Overview
This system allows users to subscribe to the Ethiopian IT Park newsletter and automatically sends email notifications when new news or events are posted.

## Features
- ✅ Newsletter subscription with email validation
- ✅ Welcome email sent to new subscribers
- ✅ Automatic email notifications for new news/events
- ✅ Toast notifications for user feedback
- ✅ Admin dashboard to view all subscribers
- ✅ Unsubscribe functionality
- ✅ Duplicate email prevention
- ✅ Reactivation for previously unsubscribed users

## Setup Instructions

### 1. Database Setup
Run the SQL file to create the subscribers table:
```bash
mysql -u root -p cms < backend/models/cms.sql
```

Or manually run this SQL:
```sql
CREATE TABLE `subscribers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `status` enum('active','unsubscribed') DEFAULT 'active',
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:50053002
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in EMAIL_PASS

### 3. Install Dependencies
```bash
# Backend
cd backend/ITPCMS/backend
npm install nodemailer dotenv

# Frontend
cd ITPCWEBSITE
npm install react-toastify
```

### 4. Start the Servers
```bash
# Backend (Terminal 1)
cd backend/ITPCMS/backend
node server.js

# Frontend (Terminal 2)
cd ITPCWEBSITE
npm run dev
```

## API Endpoints

### Public Endpoints
- `POST /api/subscribe` - Subscribe to newsletter
  ```json
  {
    "email": "user@example.com"
  }
  ```

- `POST /api/unsubscribe` - Unsubscribe from newsletter
  ```json
  {
    "email": "user@example.com"
  }
  ```

### Protected Endpoints (Admin Only)
- `GET /api/subscribers` - Get all subscribers
  - Requires: `Authorization: Bearer <token>`

## Usage

### Frontend Integration
The subscription form is integrated in the Footer component:
```tsx
import { toast } from 'react-toastify';

const handleSubmit = async (e) => {
  const response = await fetch('http://localhost:5005/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  if (data.success) {
    toast.success(data.message);
  }
};
```

### Sending Notifications
When creating news or events, automatically notify subscribers:

```javascript
const { notifySubscribers } = require('../controllers/subscriptionController');

// After creating news/event
await notifySubscribers('news', newsItem);
// or
await notifySubscribers('event', eventItem);
```

## Admin Dashboard
To view subscribers in the admin dashboard, create a new page at:
`backend/ITPCMS/src/pages/subscribers/SubscribersAdmin.tsx`

Example:
```tsx
import { useEffect, useState } from 'react';

const SubscribersAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5005/api/subscribers', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => setSubscribers(data.data));
  }, []);

  return (
    <div>
      <h1>Newsletter Subscribers ({subscribers.length})</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Subscribed At</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map(sub => (
            <tr key={sub.id}>
              <td>{sub.email}</td>
              <td>{sub.status}</td>
              <td>{new Date(sub.subscribed_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Email Templates
The system includes beautiful HTML email templates for:
1. **Welcome Email** - Sent when user subscribes
2. **News Notification** - Sent when new news is posted
3. **Event Notification** - Sent when new event is posted

## Troubleshooting

### Emails not sending?
1. Check EMAIL_USER and EMAIL_PASS in .env
2. Verify Gmail app password is correct
3. Check server logs for errors
4. Test with a simple email first

### Toast notifications not showing?
1. Ensure react-toastify is installed
2. Check ToastContainer is rendered
3. Verify CSS is imported

### Database errors?
1. Ensure subscribers table exists
2. Check database connection
3. Verify unique email constraint

## Security Notes
- Never commit .env file
- Use app passwords, not account passwords
- Validate email addresses on both frontend and backend
- Rate limit subscription endpoints to prevent abuse
- Use HTTPS in production

## Future Enhancements
- [ ] Email templates customization in admin
- [ ] Subscription preferences (news only, events only, both)
- [ ] Email scheduling
- [ ] Analytics dashboard
- [ ] Export subscribers to CSV
- [ ] Bulk email campaigns
