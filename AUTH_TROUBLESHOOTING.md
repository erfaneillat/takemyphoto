# Authentication Protection - Troubleshooting Guide

## 🔧 Implementation Fixed

The route protection has been updated with a simpler, more reliable approach.

## ✅ What Was Changed

### 1. Simplified Route Protection
Instead of using wrapper components, we now check `isAuthenticated` directly in the App component:

```typescript
// OLD (Complex)
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

// NEW (Simple)
{isAuthenticated ? (
  <Route element={<MainLayout />}>
    {/* protected routes */}
  </Route>
) : (
  <Route path="*" element={<Navigate to="/login" replace />} />
)}
```

### 2. Fixed useAuthInit Hook
Now properly sets loading state in all cases:

```typescript
// Always set loading to true at start
setLoading(true);

// Always set loading to false at end
setLoading(false);
```

### 3. Added Debug Component
A visual debug panel shows authentication state in development mode.

## 🧪 How to Test

### Step 1: Clear Everything
```javascript
// Open browser console (F12)
localStorage.clear()
// Refresh page
```

### Step 2: Check Debug Panel
Look at the bottom-right corner of the screen. You should see:
```
Auth Debug
Loading: No
Authenticated: No
User: None
Token: None
```

### Step 3: Try Accessing Protected Route
```
1. Go to http://localhost:5173/
2. Should redirect to /login
3. Debug panel should show: Authenticated: No
```

### Step 4: Try Other Routes
```
1. Go to http://localhost:5173/profile
2. Should redirect to /login
3. Go to http://localhost:5173/edit
4. Should redirect to /login
```

### Step 5: Login
```
1. At /login, enter phone number
2. Enter verification code
3. Should redirect to home (/)
4. Debug panel should show:
   - Authenticated: Yes
   - User: +1234567890
   - Token: Exists
```

### Step 6: Access Protected Routes
```
1. Go to /profile - Should work ✅
2. Go to /edit - Should work ✅
3. Go to /upgrade - Should work ✅
```

### Step 7: Refresh Page
```
1. Press F5
2. Should stay on same page
3. Should stay logged in
4. Debug panel should still show: Authenticated: Yes
```

## 🐛 Common Issues & Solutions

### Issue 1: Can access routes without login
**Symptoms:**
- Can visit /, /profile, /edit without logging in
- Debug panel shows: Authenticated: No

**Solution:**
```javascript
// 1. Check if App.tsx has the new code
// 2. Clear browser cache
// 3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
// 4. Check console for errors
```

### Issue 2: Infinite redirect loop
**Symptoms:**
- Browser keeps redirecting
- URL keeps changing
- Console shows navigation errors

**Solution:**
```javascript
// 1. Clear localStorage
localStorage.clear()

// 2. Close all tabs
// 3. Reopen browser
// 4. Go to http://localhost:5173/login directly
```

### Issue 3: Debug panel not showing
**Symptoms:**
- No debug panel in bottom-right corner

**Solution:**
```javascript
// 1. Check if running in development mode
npm run dev

// 2. Check console for errors
// 3. Verify AuthDebug component is imported in App.tsx
```

### Issue 4: Login works but redirects back to login
**Symptoms:**
- Enter phone and code
- Briefly see home page
- Redirects back to /login

**Solution:**
```javascript
// 1. Check if tokens are being stored
console.log(localStorage.getItem('accessToken'))

// 2. Check auth store state
console.log(JSON.parse(localStorage.getItem('nero-auth-storage')))

// 3. Check if backend is returning tokens correctly
// Look at Network tab in DevTools
```

### Issue 5: "Loading..." screen never goes away
**Symptoms:**
- Stuck on loading screen
- Debug panel not visible

**Solution:**
```javascript
// 1. Check console for errors
// 2. Check if backend is running
// 3. Check if API_BASE_URL is correct in .env
// 4. Try:
localStorage.clear()
// Refresh page
```

## 🔍 Debugging Steps

### 1. Check Authentication State
```javascript
// In browser console
const authState = JSON.parse(localStorage.getItem('nero-auth-storage'))
console.log('Auth State:', authState)
console.log('Access Token:', localStorage.getItem('accessToken'))
console.log('Refresh Token:', localStorage.getItem('refreshToken'))
```

### 2. Check if Backend is Running
```bash
# Should see: ✅ MongoDB connected successfully
# Server running on port 5000
```

### 3. Check Network Requests
```
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for:
   - POST /auth/send-code (should return 200)
   - POST /auth/verify-code (should return 200 with tokens)
```

### 4. Check Console Errors
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Common errors:
   - "Cannot find module" - Missing import
   - "Network Error" - Backend not running
   - "401 Unauthorized" - Invalid token
```

### 5. Force Logout
```javascript
// In browser console
localStorage.clear()
window.location.href = '/login'
```

## 📊 Expected Behavior

### When NOT Logged In
```
✅ Can access: /login
❌ Cannot access: /, /profile, /edit, /upgrade
→ Redirects to: /login
```

### When Logged In
```
✅ Can access: /, /profile, /edit, /upgrade
❌ Cannot access: /login (redirects to /)
```

### Debug Panel Shows
```
Not Logged In:
- Loading: No
- Authenticated: No
- User: None
- Token: None

Logged In:
- Loading: No
- Authenticated: Yes
- User: +1234567890
- Token: Exists
```

## 🔧 Manual Testing Checklist

- [ ] Clear localStorage
- [ ] Go to / → Should redirect to /login
- [ ] Go to /profile → Should redirect to /login
- [ ] Go to /edit → Should redirect to /login
- [ ] Login with phone + code
- [ ] Should redirect to /
- [ ] Debug panel shows: Authenticated: Yes
- [ ] Go to /profile → Should work
- [ ] Go to /edit → Should work
- [ ] Refresh page → Should stay logged in
- [ ] Close browser, reopen → Should stay logged in
- [ ] Clear localStorage → Should logout

## 🚀 Quick Fix Commands

### Reset Everything
```bash
# In browser console
localStorage.clear()
location.reload()
```

### Check Auth State
```bash
# In browser console
console.table({
  authenticated: JSON.parse(localStorage.getItem('nero-auth-storage'))?.isAuthenticated,
  hasToken: !!localStorage.getItem('accessToken'),
  user: JSON.parse(localStorage.getItem('nero-auth-storage'))?.user?.phoneNumber
})
```

### Force Login State (Testing Only)
```bash
# In browser console
localStorage.setItem('nero-auth-storage', JSON.stringify({
  state: {
    user: { id: '1', phoneNumber: '+1234567890' },
    isAuthenticated: true
  }
}))
localStorage.setItem('accessToken', 'test-token')
location.reload()
```

## 📝 Files to Check

If protection still not working, verify these files:

### 1. src/App.tsx
```typescript
// Should have:
const { isLoading, isAuthenticated } = useAuthStore();

// Should conditionally render routes:
{isAuthenticated ? (
  <Route element={<MainLayout />}>
    {/* protected routes */}
  </Route>
) : (
  <Route path="*" element={<Navigate to="/login" replace />} />
)}
```

### 2. src/shared/stores/useAuthStore.ts
```typescript
// Should have persist middleware:
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'nero-auth-storage',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
  }
)
```

### 3. src/shared/hooks/useAuthInit.ts
```typescript
// Should always set loading:
setLoading(true);
// ... do work ...
setLoading(false);
```

## ✅ Success Criteria

Route protection is working when:

1. ✅ Cannot access /, /profile, /edit, /upgrade without login
2. ✅ All protected routes redirect to /login
3. ✅ After login, can access all protected routes
4. ✅ After refresh, stay logged in
5. ✅ After browser close/reopen, stay logged in
6. ✅ Debug panel shows correct state
7. ✅ No infinite redirect loops
8. ✅ No console errors

## 🆘 Still Not Working?

If route protection still doesn't work after following this guide:

1. **Share the debug panel info**
   - Screenshot the debug panel
   - Copy console errors

2. **Check these values**
   ```javascript
   console.log({
     isAuthenticated: useAuthStore.getState().isAuthenticated,
     hasToken: !!localStorage.getItem('accessToken'),
     authStorage: localStorage.getItem('nero-auth-storage')
   })
   ```

3. **Verify backend is running**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

4. **Check .env file**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

## 🎉 Summary

The authentication protection has been simplified and should now work correctly:

- ✅ Simple conditional rendering based on `isAuthenticated`
- ✅ Proper loading state management
- ✅ Debug panel for troubleshooting
- ✅ Clear redirect logic

**Test it now and check the debug panel!**
