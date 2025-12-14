# API Testing CURLs

## Base URL
```
http://localhost:5001/api
```

## Authentication

### 1. Register
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get Profile
```bash
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Teams

### 1. Get My Teams
```bash
curl -X GET http://localhost:5001/api/teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Create Team
```bash
curl -X POST http://localhost:5001/api/teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Team",
    "description": "Team description",
    "type": "PERSONAL"
  }'
```

### 3. Get Team by ID
```bash
curl -X GET http://localhost:5001/api/teams/TEAM_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Activities & Messages

### 1. Ingest Single Message
```bash
curl -X POST http://localhost:5001/api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "chat",
    "content": "How do I implement authentication in Node.js?",
    "teamId": "YOUR_TEAM_ID",
    "metadata": {
      "source": "chatgpt"
    }
  }'
```

### 2. Batch Ingest Messages
```bash
curl -X POST http://localhost:5001/api/messages/batch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "activityType": "code",
        "content": "function hello() { console.log(\"world\"); }",
        "teamId": "YOUR_TEAM_ID"
      },
      {
        "activityType": "command",
        "content": "npm install express",
        "teamId": "YOUR_TEAM_ID"
      }
    ]
  }'
```

### 3. Get Processing Stats
```bash
curl -X GET http://localhost:5001/api/messages/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get My Activities
```bash
curl -X GET "http://localhost:5001/api/activities/my-activities?limit=10" \
  -H "x-api-key: YOUR_API_KEY"
```

## Processing Queue

### 1. Get Queue Status
```bash
curl -X GET http://localhost:5001/api/processing/queue \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Trigger Processing (Admin Only)
```bash
curl -X POST http://localhost:5001/api/processing/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Knowledge Graph & Search

### 1. Search Activities (Vector Search)
```bash
curl -X POST http://localhost:5001/api/activities/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication implementation",
    "teamId": "YOUR_TEAM_ID",
    "limit": 10
  }'
```

### 2. Get Unprocessed Activities
```bash
curl -X GET "http://localhost:5001/api/activities/unprocessed?teamId=YOUR_TEAM_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Flow

### Complete Test Flow
```bash
# 1. Register
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@test.com",
    "password": "Demo@123",
    "name": "Demo User"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# 2. Extract token and team ID
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
TEAM_ID=$(echo $REGISTER_RESPONSE | jq -r '.team.id')
API_KEY=$(echo $REGISTER_RESPONSE | jq -r '.apiKey')

echo "Token: $TOKEN"
echo "Team ID: $TEAM_ID"
echo "API Key: $API_KEY"

# 3. Get teams
curl -X GET http://localhost:5001/api/teams \
  -H "Authorization: Bearer $TOKEN"

# 4. Ingest a message
curl -X POST http://localhost:5001/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"activityType\": \"chat\",
    \"content\": \"How to use React hooks?\",
    \"teamId\": \"$TEAM_ID\"
  }"

# 5. Check stats
curl -X GET http://localhost:5001/api/messages/stats \
  -H "Authorization: Bearer $TOKEN"

# 6. Get activities
curl -X GET http://localhost:5001/api/activities/my-activities \
  -H "x-api-key: $API_KEY"
```

## Admin Endpoints

### Using Admin Credentials
```bash
# Login as admin
ADMIN_LOGIN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@devgraph.io",
    "password": "Admin@123456"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.token')

# Get all teams (admin)
curl -X GET http://localhost:5001/api/teams \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Trigger processing
curl -X POST http://localhost:5001/api/processing/trigger \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Notes

- Replace `YOUR_JWT_TOKEN` with actual JWT from login/register
- Replace `YOUR_TEAM_ID` with actual team ID
- Replace `YOUR_API_KEY` with actual API key
- All timestamps are in ISO 8601 format
- Rate limits apply (see rate limiting docs)
