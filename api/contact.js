export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Build payload — API key lives only here, as an env variable
    const payload = {
      ...body,
      access_key: process.env.WEB3FORMS_KEY,
      subject: `New message from Portfolio — ${body['First Name'] || 'Visitor'}`,
      from_name: 'Rohan Kakkar Portfolio',
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
