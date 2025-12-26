// WhatsApp API integration helper
// Replace with your actual WhatsApp API provider

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || '';

export interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'template' | 'document';
  document_url?: string;
}

export async function sendWhatsAppMessage(msg: WhatsAppMessage): Promise<boolean> {
  try {
    // This is a placeholder - replace with your actual WhatsApp API provider
    // Examples: Twilio, WhatsApp Business API, or other providers
    
    if (!WHATSAPP_API_KEY) {
      console.log('WhatsApp API not configured. Simulated message:', msg);
      return true; // Simulate success for demo
    }

    const response = await fetch(`${WHATSAPP_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({
        to: msg.to,
        message: msg.message,
        type: msg.type || 'text',
        ...(msg.document_url && { document_url: msg.document_url }),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return false;
  }
}

export function formatMessageTemplate(template: string, data: Record<string, any>): string {
  let message = template;
  
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    message = message.replace(regex, String(data[key] || ''));
  });
  
  return message;
}

