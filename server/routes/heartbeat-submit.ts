import { RequestHandler } from "express";
import { executeQuery } from "../config/database";
import { v4 as uuidv4 } from "uuid";

// POST route for heartbeat submission
export const submitHeartbeat: RequestHandler = async (req, res) => {
  try {
    const { ip_address, mac_address } = req.body;

    if (!ip_address) {
      return res.status(400).json({ error: "IP address is required" });
    }

    const uuid = uuidv4();

    // Check if device exists for this MAC address, if not create one
    if (mac_address?.trim()) {
      const deviceCheckQuery = `
        SELECT id FROM devices WHERE device_mac = ?
      `;
      const existingDevice = await executeQuery(deviceCheckQuery, [
        mac_address.trim(),
      ]);

      if (existingDevice.length === 0) {
        // Create new device with inactive status
        const deviceUuid = uuidv4();
        const createDeviceQuery = `
          INSERT INTO devices (
            id, device_name, device_mac, device_type,
            device_status, notes, created_on, updated_on
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        await executeQuery(createDeviceQuery, [
          deviceUuid,
          `Device-${mac_address.trim().slice(-6)}`, // Use last 6 chars of MAC as name
          mac_address.trim(),
          "recorder",
          "inactive",
          "Auto-created from heartbeat",
        ]);

        console.log(`Auto-created new device for MAC: ${mac_address}`);
      }
    }

    // Insert heartbeat into database
    const query = `
      INSERT INTO heartbeat (uuid, ip_address, mac_address, created_on)
      VALUES (?, ?, ?, NOW())
    `;

    await executeQuery(query, [uuid, ip_address, mac_address || null]);

    res.json({
      success: true,
      message: "Heartbeat recorded",
      data: {
        uuid,
        ip_address,
        mac_address: mac_address || null,
      },
    });
  } catch (error) {
    console.error("Error recording heartbeat:", error);
    res.status(500).json({ error: "Failed to record heartbeat" });
  }
};
