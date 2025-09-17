# <span style="color: #9478e9ff;">Vault</span>
*Tinder for underground rap. Swipe through 15-second snippets. Find artists you like*

## Problem
Good artists that would have many listeners, have no avenue to get music into their fans hands without label backing or paid promo

## The Solution
Every swipe guarantees your snippet gets heard. No algorithms to game. No playlists to dickride for, no artists to dickride for. Just pure discovery

## How It Works
### For Listeners
1. Open app -> snippet autoplays
2. 🔥 = save/follow artist
3. 🗑️ = next snippet
4. Get addicted to discovering

### For Artists
1. Upload **ONE** 15-second unreleased snippet
2. Watch your play count grow and more listeners checking on DSP's
3. Get real fans, not bots

## Why It's Different
- Not Soundcloud: no searching through trash
- Not Spotify: Underground only, unreleased only
- Not TikTok: Music-first, not personality
- Not Playlists: Every artist gets heard equally

## The Tech
- Backend: Go + PostgreSQL
- Frontend: React Native
- Storage: Amazon S3
- Architecture: Dead simple by design

## Why This Wins
**For Artists**: Finally, guaranteed ears on music. Not begging for plays. Not lost in playlists. Every upload gets heard.

**For Listeners**: No more digging through trash. No paralysis from choice. Just swipe and discover heat.

**The Hook**: *"I found them at 100 plays"* becomes the new *"I knew them before they were famous"*

## Potential issues
- Artists must post their own snippets, not already established artists or stealing snippets
- Trash snippets ruin the experience. After 100 skips in a row, snippet gets shadowbanned
- One snippet per artist until 50+ fire rate

## Other docs
- [API Documenation](docs/api.md)
- [DB Documentation](docs/db.md)
- [Design Documentation](docs/design.md)