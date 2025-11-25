# 🔐 Security Policy & Best Practices

## CRITICAL: DO NOT EXPOSE

⚠️ **NEVER commit these files to Git:**

- `.env` - Contains all credentials
- `.env.local` - Local overrides
- Private keys or API secrets
- Database passwords
- JWT secrets

**Ensure `.gitignore` includes these:**

```
.env
.env.local
.env.*.local
node_modules/
.DS_Store
*.log
dist/
```

---

## 🛡️ Implemented Security Features

### 1. **Authentication & Authorization**

- ✅ Bcrypt hashing (salt rounds: 10)
- ✅ JWT tokens (24h expiration)
- ✅ Refresh token rotation (7-day cookies)
- ✅ Email allowlist for admin access
- ✅ Google OAuth 2.0 integration
- ✅ HttpOnly, Secure, SameSite cookies

### 2. **Account Protection**

- ✅ Rate limiting: 10 requests/15 minutes per IP
- ✅ Account lockout: 15 minutes after 5 failed attempts
- ✅ Password validation on account creation
- ✅ Login attempt tracking
- ✅ Last login timestamp

### 3. **Audit & Monitoring**

- ✅ Audit logs for all authentication events
- ✅ IP address tracking
- ✅ User-Agent logging
- ✅ Attempt counters
- ✅ 90-day log retention with auto-expiry

### 4. **HTTP Security**

- ✅ HELMET.js (security headers)
- ✅ CORS configuration
- ✅ Content Security Policy ready
- ✅ X-Frame-Options protection
- ✅ X-Content-Type-Options

### 5. **Data Protection**

- ✅ Environment variables for all secrets
- ✅ MongoDB Atlas encryption
- ✅ HTTPS ready (secure cookies in production)
- ✅ Input validation with express-validator
- ✅ Error messages don't leak system info

---

## ⚠️ SECURITY CHECKLIST - BEFORE PRODUCTION

- [ ] Change `JWT_SECRET` to a strong random string (min 32 chars)
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to your actual domain
- [ ] Enable HTTPS/TLS
- [ ] Set cookies as `secure: true`
- [ ] Use strong admin passwords (mix of uppercase, lowercase, numbers, special chars)
- [ ] Rotate credentials every 90 days
- [ ] Set up proper backup strategy
- [ ] Enable MongoDB Atlas VPC
- [ ] Configure IP whitelist for database
- [ ] Set up monitoring/alerting
- [ ] Implement rate limiting at CDN level
- [ ] Review audit logs regularly
- [ ] Use password manager for credentials
- [ ] Enable 2FA for Google OAuth

---

## 🔑 Credential Management

### How to Update Credentials

1. **Edit `.env` file** with new values
2. **Recreate the admin account** in database:

   ```bash
   cd backend
   node -e "
   const mongoose = require('mongoose');
   const bcrypt = require('bcryptjs');
   require('dotenv').config();

   mongoose.connect(process.env.DB_URI).then(async () => {
     await mongoose.connection.db.collection('adminusers').deleteOne({ email: 'admin@furniture-mart.com' });
     const hashedPassword = await bcrypt.hash(process.env.ADMIN_EMAIL_PASSWORD, 10);
     const newAdmin = {
       name: 'Admin User',
       email: process.env.ADMIN_EMAIL,
       password: hashedPassword,
       role: 'admin',
       isActive: true,
       lastLogin: null,
       loginAttempts: 0,
       isLocked: false,
       lockedUntil: null,
       createdAt: new Date(),
       updatedAt: new Date()
     };
     await mongoose.connection.db.collection('adminusers').insertOne(newAdmin);
     console.log('✅ Admin account updated');
     process.exit(0);
   }).catch(e => { console.error(e); process.exit(1); });
   "
   ```

3. **Restart the backend server**

### Never Do This:

- ❌ Put credentials in code
- ❌ Log passwords or sensitive data
- ❌ Use same password for multiple systems
- ❌ Push `.env` to Git
- ❌ Share credentials in chat/email
- ❌ Use weak passwords

---

## 🚨 Security Incidents - What To Do

### Account Locked

```bash
# Unlock an admin account
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DB_URI).then(async () => {
  await mongoose.connection.db.collection('adminusers').updateOne(
    { email: 'admin@furniture-mart.com' },
    { \$set: { loginAttempts: 0, isLocked: false, lockedUntil: null } }
  );
  console.log('✅ Account unlocked');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
"
```

### Suspected Breach

1. Change all passwords immediately
2. Review audit logs: `db.auditlogs.find({}).sort({timestamp:-1})`
3. Check for unauthorized access patterns
4. Rotate JWT_SECRET and restart servers
5. Review Google OAuth connected devices

### Rate Limit Issue

The system automatically applies rate limiting. If legitimate users are affected:

- Increase limit: Modify `rateLimitMiddleware` parameters
- Or whitelist IP addresses for trusted networks

---

## 🔍 What's Protected

| Item      | Protection      | Method                     |
| --------- | --------------- | -------------------------- |
| Passwords | ✅ Hashed       | Bcrypt (10 rounds)         |
| Tokens    | ✅ Signed       | JWT with secret key        |
| Cookies   | ✅ Protected    | HttpOnly, Secure, SameSite |
| API       | ✅ Rate Limited | 10 req/15 min per IP       |
| Logins    | ✅ Tracked      | Audit logs everything      |
| Account   | ✅ Locked       | After 5 failed attempts    |
| Database  | ✅ Encrypted    | MongoDB Atlas encryption   |
| Transit   | ✅ Secure       | HTTPS ready                |

---

## 📋 Audit Log Fields

Every authentication event logs:

- **action**: Type of action (login_attempt, login_success, etc.)
- **email**: User attempting the action
- **ipAddress**: Client IP address
- **userAgent**: Browser/app information
- **status**: success, failed, or blocked
- **reason**: Why the action succeeded/failed
- **timestamp**: When it happened (auto-expires after 90 days)

Access logs:

```javascript
db.auditlogs
  .find({ email: "admin@furniture-mart.com" })
  .sort({ timestamp: -1 })
  .limit(100);
```

---

## 📚 Resources & References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)

---

## Questions or Security Concerns?

1. Check this file first
2. Review audit logs
3. Test in development environment
4. Always backup before major changes

**Last Updated:** November 24, 2025
**Version:** 1.0.0
