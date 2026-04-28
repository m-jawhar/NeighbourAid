import { DEMO_MODE } from './firebaseService';

export function generateMissionBrief(volunteer, crisis, task, coordinatorName) {
  const reportBy = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const mapsLink = `https://www.google.com/maps?q=${crisis.lat},${crisis.lng}`;
  const checkinLink = `${window.location.origin}/missions?crisisId=${crisis.id}&volunteerId=${volunteer.id}`;

  return `🚨 *EMERGENCY ALERT — NeighborAid*

You have been identified as a community responder for a *${crisis.type}* emergency near your location.

*Your assigned task:* ${task}

📍 *Location:* ${mapsLink}
⏱ *Report by:* ${reportBy}

✅ *Check in when you arrive:* ${checkinLink}

This request expires in 2 hours. Your identity is protected — only your skill was shared.

_NeighborAid Community Response Network_`;
}

export async function sendWhatsApp(phone, message) {
  try {
    if (!phone || !message) {
      throw new Error('Phone number and message are required.');
    }

    if (DEMO_MODE) {
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return { mode: 'demo', url };
    }

    const response = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, message }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || 'WhatsApp dispatch failed.');
    }

    return response.json();
  } catch (error) {
    console.error('WhatsApp dispatch error:', error);
    throw new Error(error.message || 'Unable to send WhatsApp notification right now.');
  }
}
