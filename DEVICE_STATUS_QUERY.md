# Device Status Tab - Data Source Query

## 📍 URL
`https://recorder.setech.pk/?tab=device-status`

## 🔄 Data Flow

### Frontend
**File**: `/client/components/ExactDashboard.tsx`
- **Function**: `loadDevices()` (line 239)
- **API Call**: `fetchHeartbeats()` (line 115)
- **Endpoint**: `GET /api/heartbeats`
- **Refresh**: Auto-refreshes every 30 seconds

### Backend
**File**: `/server/routes/heartbeat-db.ts`
- **Route Handler**: `getHeartbeats` (line 8)
- **Endpoint**: `GET /api/heartbeats`

---

## 📊 Main SQL Query

```sql
SELECT
  COALESCE(ANY_VALUE(b.branch_name), 'Not linked to branch') AS branch_name,
  COALESCE(ANY_VALUE(b.branch_code), 'Not linked to branch') AS branch_code,
  h.ip_address,
  h.mac_address as device_id,
  h.last_seen,

  CASE
    WHEN TIMESTAMPDIFF(MINUTE, h.last_seen, NOW()) <= 5 THEN 'online'
    WHEN TIMESTAMPDIFF(MINUTE, h.last_seen, NOW()) <= 15 THEN 'problematic'
    ELSE 'offline'
  END AS status,
  
  CONCAT(
    FLOOR(IFNULL(ANY_VALUE(h.uptime_count), 0) * 30 / 3600), 'h ',
    FLOOR(MOD(IFNULL(ANY_VALUE(h.uptime_count), 0) * 30, 3600) / 60), 'm'
  ) AS uptime_duration_24h

FROM (
  SELECT
    h1.mac_address,
    h1.ip_address,
    MAX(h1.created_on) AS last_seen,
    (
      SELECT COUNT(*)
      FROM heartbeat h2
      WHERE h2.mac_address = h1.mac_address
        AND h2.created_on >= DATE_SUB(NOW(), INTERVAL 1 DAY)
    ) AS uptime_count
  FROM heartbeat h1
  WHERE h1.mac_address IS NOT NULL
  GROUP BY h1.mac_address, h1.ip_address
) h

LEFT JOIN devices d ON d.device_mac = h.mac_address
LEFT JOIN link_device_branch_user ldbu ON ldbu.device_id = d.id
LEFT JOIN branches b ON b.id = ldbu.branch_id

GROUP BY h.mac_address, h.ip_address, h.last_seen
ORDER BY h.last_seen DESC
LIMIT 100
```

---

## 🔍 Query Breakdown

### Tables Used
1. **`heartbeat`** - Main table storing device heartbeat records
2. **`devices`** - Device registration information
3. **`link_device_branch_user`** - Links devices to branches
4. **`branches`** - Branch information

### Key Logic

#### 1. **Device Deduplication** (Subquery)
```sql
SELECT
  h1.mac_address,
  h1.ip_address,
  MAX(h1.created_on) AS last_seen,
  (SELECT COUNT(*) FROM heartbeat h2 
   WHERE h2.mac_address = h1.mac_address
   AND h2.created_on >= DATE_SUB(NOW(), INTERVAL 1 DAY)
  ) AS uptime_count
FROM heartbeat h1
WHERE h1.mac_address IS NOT NULL
GROUP BY h1.mac_address, h1.ip_address
```
- Groups heartbeats by MAC address and IP
- Gets the latest heartbeat time for each device
- Counts heartbeats in last 24 hours for uptime calculation

#### 2. **Status Calculation**
```sql
CASE
  WHEN TIMESTAMPDIFF(MINUTE, h.last_seen, NOW()) <= 5 THEN 'online'
  WHEN TIMESTAMPDIFF(MINUTE, h.last_seen, NOW()) <= 15 THEN 'problematic'
  ELSE 'offline'
END AS status
```
- **Online**: Last seen within 5 minutes
- **Problematic**: Last seen between 6-15 minutes ago
- **Offline**: Last seen more than 15 minutes ago

#### 3. **Uptime Duration Calculation**
```sql
CONCAT(
  FLOOR(IFNULL(ANY_VALUE(h.uptime_count), 0) * 30 / 3600), 'h ',
  FLOOR(MOD(IFNULL(ANY_VALUE(h.uptime_count), 0) * 30, 3600) / 60), 'm'
) AS uptime_duration_24h
```
- Assumes heartbeats are sent every 30 seconds
- Calculates total uptime in last 24 hours
- Formats as "Xh Ym"

#### 4. **Branch Linking**
```sql
LEFT JOIN devices d ON d.device_mac = h.mac_address
LEFT JOIN link_device_branch_user ldbu ON ldbu.device_id = d.id
LEFT JOIN branches b ON b.id = ldbu.branch_id
```
- Links devices to branches via the linking table
- Shows "Not linked to branch" if no branch association exists

---

## 📋 Fallback Query

If the main query fails, a simpler fallback query is used:

```sql
SELECT
  'Not linked to branch' AS branch_name,
  'Not linked to branch' AS branch_code,
  h.ip_address,
  h.mac_address as device_id,
  MAX(h.created_on) AS last_seen,
  
  CASE
    WHEN TIMESTAMPDIFF(MINUTE, MAX(h.created_on), NOW()) <= 5 THEN 'online'
    WHEN TIMESTAMPDIFF(MINUTE, MAX(h.created_on), NOW()) <= 15 THEN 'problematic'
    ELSE 'offline'
  END AS status,
  
  '0h 0m' AS uptime_duration_24h

FROM heartbeat h
LEFT JOIN devices d ON d.device_mac = h.mac_address
WHERE h.mac_address IS NOT NULL
GROUP BY h.mac_address, h.ip_address
ORDER BY MAX(h.created_on) DESC
LIMIT 50
```

---

## 🎯 Response Format

```json
[
  {
    "branch_name": "Karachi Main Branch",
    "branch_code": "KHI-001",
    "ip_address": "192.168.1.100",
    "device_id": "00:11:22:33:44:55",
    "last_seen": "2026-01-30T10:30:00.000Z",
    "status": "online",
    "uptime_duration_24h": "23h 45m"
  },
  {
    "branch_name": "Not linked to branch",
    "branch_code": "Not linked to branch",
    "ip_address": "192.168.1.101",
    "device_id": "AA:BB:CC:DD:EE:FF",
    "last_seen": "2026-01-30T10:20:00.000Z",
    "status": "problematic",
    "uptime_duration_24h": "12h 30m"
  }
]
```

---

## 📊 Frontend Display

The device-status tab shows:

1. **Stats Overview** (4 cards):
   - Total Devices
   - Online (green)
   - Problematic (yellow)
   - Offline (red)

2. **Device List Table**:
   - Branch Name
   - Branch Code
   - Device ID (MAC Address)
   - IP Address
   - Status (with color-coded badge)
   - Uptime (last 24h)
   - Last Seen (formatted time)

---

## 🔄 Auto-Refresh

- **Initial Load**: On tab switch to "device-status"
- **Auto-Refresh**: Every 30 seconds
- **Manual Refresh**: Refresh button in the header
- **Timeout**: 30 seconds per request

---

## 🔐 Authentication & Filtering

- **Authentication**: Required (JWT token)
- **Branch Filtering**: Automatically applied based on user role
  - **Admin**: Sees all devices
  - **User**: Sees only devices from their assigned branch

---

## 🗄️ Database Schema

### `heartbeat` Table
```sql
CREATE TABLE heartbeat (
  uuid VARCHAR(100) PRIMARY KEY,
  ip_address VARCHAR(45),
  mac_address VARCHAR(50),
  created_on DATETIME
);
```

### `devices` Table
```sql
CREATE TABLE devices (
  id VARCHAR(36) PRIMARY KEY,
  device_name VARCHAR(255),
  device_mac VARCHAR(50),
  device_type VARCHAR(50),
  device_status VARCHAR(50),
  notes TEXT,
  created_on TIMESTAMP,
  updated_on TIMESTAMP
);
```

### `link_device_branch_user` Table
```sql
CREATE TABLE link_device_branch_user (
  device_id VARCHAR(36),
  branch_id VARCHAR(36),
  user_id VARCHAR(36)
);
```

### `branches` Table
```sql
CREATE TABLE branches (
  id VARCHAR(36) PRIMARY KEY,
  branch_name VARCHAR(255),
  branch_code VARCHAR(50),
  branch_city VARCHAR(100),
  branch_address TEXT
);
```

---

## 🎨 Status Colors

- **Online** (green): `bg-green-100 text-green-800`
- **Problematic** (yellow): `bg-yellow-100 text-yellow-800`
- **Offline** (red): `bg-red-100 text-red-800`

---

## 🔧 Performance Notes

1. **Limit**: Query limited to 100 devices
2. **Indexing**: Should have indexes on:
   - `heartbeat.mac_address`
   - `heartbeat.created_on`
   - `devices.device_mac`
3. **Caching**: No caching (real-time data)
4. **Retry Logic**: 2 retries on network errors
5. **Timeout**: 30 seconds

---

**Last Updated**: 2026-01-30  
**Query Location**: `/server/routes/heartbeat-db.ts` (lines 33-71)  
**Frontend Location**: `/client/components/ExactDashboard.tsx` (lines 979-1168)
