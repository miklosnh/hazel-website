export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle Contact Form submissions
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const { topic, email, subject, message, website_hp } = await request.json();

        // Honeypot spam check
        if (website_hp) {
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!topic || !email || !subject || !message) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Hazel Support Form <support@mail.thehazel.app>',
            to: ['support@thehazel.app'],
            reply_to: email,
            subject: `[${topic}] ${subject}`,
            text: `Topic: ${topic}\nReply Email: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          return new Response(JSON.stringify({ error: errorText }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static HTML pages (index.html, contact.html, privacy.html, terms.html)
    return env.ASSETS.fetch(request);
  }
};
