# <span style="color: #9478e9ff;">Vault</span> API Documentation

## Base URL (for now)
`http:localhost:8080`

## Authentication
All protected endpoints require Bearer token in header:\
`Authorization: Bearer <access_token>`

## Auth Endpoints
### POST /signup
Create new user account
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```
### POST /login
Login user, returns access token, sets refresh cookie
```json
{
    "identifier": "email_or_username",
    "password": "string"
}
```
### POST /refresh
Refresh access token using cookie
### GET /logout
Logout user, clear refresh_cookie
### PUT /update-profile `[Protected]`
```json
{
    "username": "string",     // optional
    "email": "string",        // optional
    "profile_bio": "string",  // optional
    "pfp_url": "string"       // optional
}
```
### POST /verify-email
Verify email with token
```json
{
  "token": "string"
}
```
### POST /forgot-password
Request password reset
```json
{
    "email": "string"
}
```
### POST /reset-password
Reset password with token
```json
{
    "token": "string",
    "new_password": "string"
}
```



## Core Swipe Features
### POST /snippet/upload `[Protected]`
Upload snippet (one per artist)
```json
Content-Type: multipart/form-data

title: "Snippet Title"
audio: <audio_file> // 15 seconds max, enforced server-side
```
**Response**:
```json
{
    "id": 1,
    "title": "Heat",
    "audio_url": "https://s3.../file.mp3",
    "message": "Snippet uploaded successfully"
}
```
**Rules**:
- One snippet per artist (enforced by DB)
- 15 seconds max duration
- Auto-marks user as artist
### GET /snippet/next `[Protected]`
Get next snippet to play
**Response**:
```json
{
    "id": 42,
    "title": "Unreleased Heat",
    "artist_id": 7,
    "artist_name": "username",
    "audio_url": "https://...",
    "duration_seconds": 15,
    "play_count": 234,
    "fire_count": 89
}
```
Returns null if no more snippets
### POST /swipe `[Protected]`
Record swipe action
```json
{
  "snippet_id": 42,
  "action": "fire"  // or "skip"
}
```
**Response**:
```json
{
  "success": true,
  "followed_artist": true  // only if action was "fire"
}
```
**Side Effects**:
- Updates snippet play/fire/skip counts
- Auto-follows artist if fired
- Updates user last_login
### GET /artist/stats `[Protected]`
Get your snippet stats (artists only)
**Response**:
```json
{
    "snippet": 
    {
        "id": 42,
        "title": "My Track",
        "play_count": 1234,
        "fire_count": 567,
        "skip_count": 667,
        "fire_rate": 0.46,
        "is_active": true,
        "uploaded_at": "2024-01-01T00:00:00Z"
    },
    "new_followers_today": 23,
    "total_followers": 456
}
```
### GET /user/stats `[Protected]`
Get your listener stats
**Response**:
```json
{
    "snippets_played": 234,
    "artists_discovered": 45,
    "artists_followed": 23,
    "joined_at": "2024-01-01T00:00:00Z"
}
```

## Admin Endpoints (optional for launch)
### POST /admin/calculate-similarities
Manually trigger sim calc (normall runs as cron)
### POST /admin/shadowban
Manually shadowban a anippet
```json
{
    "snippet_id": 42,
    "reason": "spam"
}
```

## Error Responses
All errors return consistent format
```json
{
    "error": "Error message here"
}
```

## Common Status Code:
- `200` Success
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `404` Not Found
- `409` Conflict (e.g., snippet already exists)
- `500` Server Error

## Rate Limits
- Upload: 1 snippet per artist (DB enforced)
- Swipes: Unlimited
- Stats: 100 requests/hour

## Notes
- Refresh token stored as httpOnly cookie
- Access token expires in 15 minutes (configurable)
- All timestamps in UTC
- Audio files limited to 5MB