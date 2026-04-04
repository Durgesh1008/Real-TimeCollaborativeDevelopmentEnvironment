import nodemailer from "nodemailer";

export const shareRoom = async (req, res) => {
    const { email, roomId, senderName } = req.body;

    console.log(`📧 Sharing Room ${roomId} with ${email} from ${senderName}`);
    
    if (!email || !roomId) {
        return res.status(400).json({ error: "Email and Room ID are required" });
    }

    try {
        // 2. Configure Transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // 16-character App Password
            },
        });

        const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?roomId=${roomId}`;

        // 3. Mail Options
        const mailOptions = {
            from: `"CodeSync" <${process.env.EMAIL_USER}>`,
            to: email,
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
                    <p style="font-size: 0.8rem; color: #6a737d; margin-top: 20px;">
                        If the button doesn't work, copy this link: ${joinLink}
                    </p>
                </div>
            `,
        };

        // 4. Send
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent successfully!" });

    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ error: "Failed to send email. Check backend logs." });
    }
};