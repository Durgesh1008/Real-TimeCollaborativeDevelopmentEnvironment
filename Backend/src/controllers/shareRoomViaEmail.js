import sgMail from '@sendgrid/mail';

// Initialize with your API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const shareRoom = async (req, res) => {
    const { email, roomId, senderName } = req.body;

    if (!email || !roomId) {
        return res.status(400).json({ error: "Email and Room ID are required" });
    }

    try {
        const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?roomId=${roomId}`;

        const msg = {
            to: email, // Recipient
            from: { name: 'VelocityPad', email: process.env.SENDGRID_SENDER_EMAIL }, // MUST be your verified SendGrid sender email
            subject: `🚀 ${senderName} invited you to a Coding Session`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 10px;">
                    <h2 style="color: #24292e;">CodeSync Collaboration</h2>
                    <p>Hi there!</p>
                    <p><strong>${senderName}</strong> has invited you to join a real-time collaborative coding session.</p>
                    <div style="background: #f6f8fa; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; font-size: 0.9rem; color: #586069;">Room ID:</p>
                        <code style="font-size: 1.2rem; font-weight: bold; color: #0366d6;">${roomId}</code>
                    </div>
                    <a href="${joinLink}" 
                       style="display: block; text-align: center; background: #238636; color: white; padding: 12px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Join Now
                    </a>
                </div>
            `,
        };

        await sgMail.send(msg);
        console.log(`✅ Email sent to ${email}`);
        res.status(200).json({ success: true, message: "Invitation sent!" });

    } catch (error) {
        console.error("❌ SendGrid Error:", error.response?.body || error.message);
        res.status(500).json({
            error: "Failed to send email.",
            details: error.response?.body?.errors[0]?.message || error.message
        });
    }
};