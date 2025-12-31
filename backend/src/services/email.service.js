const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service ready:', process.env.EMAIL_HOST);
    } catch (error) {
      console.error('❌ Email service error:', error.message);
    }
  }

  async sendEmail(options) {
    try {
      console.log('📧 Sending email to:', options.to);
      const info = await this.transporter.sendMail({
        from: `${options.fromName || 'Hackathon Platform'} <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
      console.log('✅ Email sent! ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendCoordinatorInvitation(user, hackathon, invitedBy, token) {
    const acceptUrl = `${process.env.FRONTEND_URL}/invitations`;
    const html = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:0;padding:0;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#4F46E5;color:white;padding:30px 20px;text-align:center;border-radius:10px 10px 0 0}.header h1{margin:0;font-size:28px}.content{background:#f9f9f9;padding:30px 20px}.details{background:white;padding:20px;margin:20px 0;border-left:4px solid #4F46E5;border-radius:5px}.details h2{margin-top:0;color:#4F46E5}.button{display:inline-block;padding:15px 30px;margin:10px 5px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;background:#10B981;color:white}.permissions{background:white;padding:15px;margin:15px 0;border-radius:5px}.permissions ul{margin:10px 0;padding-left:20px}.permissions li{margin:8px 0}.footer{text-align:center;padding:20px;color:#666;font-size:14px}.cta{text-align:center;margin:30px 0}</style></head><body><div class="container"><div class="header"><h1>🎯 Coordinator Invitation</h1></div><div class="content"><p><strong>Hello ${user.fullName},</strong></p><p><strong>${invitedBy.fullName}</strong> has invited you to be a coordinator for:</p><div class="details"><h2>${hackathon.title}</h2><p>${hackathon.description}</p><p><strong>📅 Duration:</strong> ${new Date(hackathon.hackathonStartDate).toLocaleDateString()} - ${new Date(hackathon.hackathonEndDate).toLocaleDateString()}</p></div><div class="permissions"><h3 style="color:#4F46E5;margin-top:0">🛡️ As a coordinator, you can:</h3><ul><li>✅ View and manage registered teams</li><li>✅ Check-in participants</li><li>✅ Assign table numbers</li><li>✅ View submissions</li><li>✅ Communicate with participants</li></ul></div><div class="cta"><a href="${acceptUrl}" class="button">✅ View & Accept Invitation</a></div><p style="font-size:14px;color:#666;text-align:center;margin-top:30px">This invitation is waiting in your dashboard.<br>Click the button to review and accept.</p><hr style="border:none;border-top:1px solid #ddd;margin:30px 0"><p style="font-size:14px;color:#666"><strong>Questions?</strong> Contact: ${invitedBy.fullName} - ${invitedBy.email}</p></div><div class="footer"><p>Hackathon Platform © 2025</p></div></div></body></html>`;
    return await this.sendEmail({
      to: user.email,
      subject: `🎯 Coordinator Invitation: ${hackathon.title}`,
      html: html,
      fromName: invitedBy.fullName || 'Hackathon Platform'
    });
  }
}

module.exports = new EmailService();  