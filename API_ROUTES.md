# API Routes Reference - Recorder Dashboard

## 🔍 Quick Reference

### Health Check & Ping
- **GET** `/api/ping` - Health check endpoint

### Heartbeat Routes
- **GET** `/api/heartbeats` - Get all heartbeats (protected)
- **POST** `/api/heartbeats` - Submit heartbeat
- **POST** `/api/heartbeat/submit` - PHP-equivalent heartbeat submit (simplified)

### Voice/Audio Upload Routes
- **POST** `/api/voice/upload` - Upload voice recording (multipart/form-data)
- **GET** `/api/audio/:filename` - Serve/stream audio file for playback

---

## 📋 Detailed Route Information

### 1. Health Check Route

#### GET `/api/ping`
**Purpose**: Check if the API server is running

**Authentication**: None

**Response**:
```json
{
  "message": "CRM Dashboard API - Production Ready",
  "timestamp": "2026-01-30T10:17:09.000Z"
}
```

---

### 2. Heartbeat Routes

#### GET `/api/heartbeats`
**Purpose**: Retrieve all device heartbeats with status calculation

**Authentication**: Required (JWT token)

**Query Parameters**:
- None (automatically filtered by branch if user is not admin)

**Response**:
```json
[
  {
    "uuid": "device-uuid",
    "ip_address": "192.168.1.100",
    "mac_address": "00:11:22:33:44:55",
    "created_on": "2026-01-30T10:00:00.000Z",
    "status": "online"
  }
]
```

---

#### POST `/api/heartbeats`
**Purpose**: Submit a heartbeat from a device

**Authentication**: None (public endpoint for devices)

**Request Body**:
```json
{
  "uuid": "device-uuid",
  "ip_address": "192.168.1.100",
  "mac_address": "00:11:22:33:44:55"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Heartbeat recorded",
  "data": {
    "heartbeat_uuid": "generated-uuid",
    "device_uuid": "device-uuid"
  }
}
```

**Features**:
- Auto-creates device if it doesn't exist
- Validates required fields
- Comprehensive logging

---

#### POST `/api/heartbeat/submit`
**Purpose**: Simplified heartbeat submission (PHP-equivalent)

**Authentication**: None (public endpoint for devices)

**Request Body**:
```json
{
  "ip_address": "192.168.1.100"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Heartbeat recorded",
  "data": {
    "uuid": "generated-uuid",
    "ip_address": "192.168.1.100"
  }
}
```

**Note**: This is a simplified version that only requires IP address

---

### 3. Voice Upload Routes

#### POST `/api/voice/upload`
**Purpose**: Upload voice recording with metadata

**Authentication**: None (public endpoint for recording devices)

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `mp3` (file) - Audio file (MP3 or WAV, max 50MB)
- `ip_address` (string) - Device IP address
- `start_time` (datetime) - Recording start time
- `end_time` (datetime) - Recording end time
- `cnic` (string) - Customer CNIC number
- `mac_address` (string, optional) - Device MAC address

**Example using cURL**:
```bash
curl -X POST http://localhost:3800/api/voice/upload \
  -F "mp3=@recording.mp3" \
  -F "ip_address=192.168.1.100" \
  -F "start_time=2026-01-30 10:00:00" \
  -F "end_time=2026-01-30 10:05:00" \
  -F "cnic=12345-1234567-1" \
  -F "mac_address=00:11:22:33:44:55"
```

**Response**:
```json
{
  "success": true,
  "id": "recording-uuid",
  "message": "File uploaded successfully",
  "playback_url": "/api/audio/audio_1738234567890_abc123xyz.mp3"
}
```

**Features**:
- Accepts MP3 and WAV files only
- Max file size: 50MB
- Auto-extracts audio metadata (duration, bitrate, sample rate)
- Generates unique filename
- Stores file in `uploads/` directory
- Comprehensive logging with request tracking

**Validation**:
- IP address is required
- Start time is required
- End time is required
- CNIC is required
- Audio file is required
- File must be MP3 or WAV format

---

#### GET `/api/audio/:filename`
**Purpose**: Stream/serve audio file for playback

**Authentication**: None (public endpoint)

**URL Parameters**:
- `filename` - The audio filename (e.g., `audio_1738234567890_abc123xyz.mp3`)

**Example**:
```
GET http://localhost:3800/api/audio/audio_1738234567890_abc123xyz.mp3
```

**Response**:
- Content-Type: `audio/mpeg` (for MP3) or `audio/wav` (for WAV)
- Accept-Ranges: `bytes` (supports partial content/streaming)
- Body: Audio file stream

**Features**:
- Supports audio streaming
- Sets appropriate MIME types
- Handles range requests for seeking
- Comprehensive error handling and logging

**Error Responses**:
```json
// File not found
{
  "error": "Audio file not found",
  "debug": {
    "requested_file": "filename.mp3",
    "full_path": "/path/to/uploads/filename.mp3",
    "upload_dir": "/path/to/uploads",
    "upload_dir_exists": true
  }
}
```

---

## 🔧 Configuration

### Upload Directory
- **Location**: `./uploads/` (relative to project root)
- **Auto-created**: Yes, if it doesn't exist
- **Permissions**: Must be writable by the Node.js process

### File Restrictions
- **Allowed formats**: MP3, WAV
- **Max file size**: 50MB
- **Filename pattern**: `audio_{timestamp}_{random}.{ext}`

### Database Tables Used
- `heartbeat` - Stores device heartbeat records
- `devices` - Stores device information
- `recordings` - Stores voice recording metadata

---

## 📝 Example Integration

### Python Example (Voice Upload)
```python
import requests

url = "http://localhost:3800/api/voice/upload"
files = {
    'mp3': open('recording.mp3', 'rb')
}
data = {
    'ip_address': '192.168.1.100',
    'start_time': '2026-01-30 10:00:00',
    'end_time': '2026-01-30 10:05:00',
    'cnic': '12345-1234567-1',
    'mac_address': '00:11:22:33:44:55'
}

response = requests.post(url, files=files, data=data)
print(response.json())
```

### JavaScript Example (Heartbeat)
```javascript
const response = await fetch('http://localhost:3800/api/heartbeat/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ip_address: '192.168.1.100'
  })
});

const result = await response.json();
console.log(result);
```

---

## 🚨 Error Handling

All endpoints return appropriate HTTP status codes:
- **200** - Success
- **201** - Created (for uploads)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **404** - Not Found
- **500** - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

---

## 📊 Logging

All routes include comprehensive logging:
- Request tracking with unique IDs
- Client IP and User-Agent tracking
- Performance metrics (duration)
- Error stack traces
- File metadata logging

Logs are written to the console and can be configured for file output.

---

## 🔐 Security Notes

1. **Heartbeat routes** are public (no authentication) to allow devices to submit data
2. **Voice upload route** is public to allow recording devices to upload files
3. **Audio serving route** is public to allow playback
4. Consider implementing API keys or IP whitelisting for production
5. File uploads are validated for type and size
6. CNIC data is sanitized (dashes removed) before storage

---

## 📍 Server Information

- **Default Port**: 3800 (configured in .env as PORT)
- **Base URL**: `http://localhost:3800`
- **Production URL**: Configure based on deployment

---

**Last Updated**: 2026-01-30
**API Version**: 1.0
**Server**: Express.js with TypeScript
