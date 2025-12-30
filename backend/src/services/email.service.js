const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${options.fromName || 'Hackathon Platform'} <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send coordinator invitation
  async sendCoordinatorInvitation(user, hackathon, invitedBy, token) {
    const acceptUrl = `${process.env.FRONTEND_URL}/coordinator/accept/${token}`;
    const declineUrl = `${process.env.FRONTEND_URL}/coordinator/decline/${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .accept-btn { background: #10B981; color: white; }
          .decline-btn { background: #EF4444; color: white; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Coordinator Invitation</h1>
          </div>
          <div class="content">
            <p>Hello ${user.fullName},</p>
            
            <p><strong>${invitedBy.fullName}</strong> has invited you to be a coordinator for the hackathon:</p>
            
            <div class="details">
              <h2>${hackathon.title}</h2>
              <p>${hackathon.description}</p>
              <p><strong>Duration:</strong> ${new Date(hackathon.hackathonStartDate).toLocaleDateString()} - ${new Date(hackathon.hackathonEndDate).toLocaleDateString()}</p>
            </div>

            <p>As a coordinator, you will be able to:</p>
            <ul>
              <li>View and manage registered teams</li>
              <li>Check-in participants</li>
              <li>Assign table numbers to teams</li>
              <li>View submissions</li>
              <li>Communicate with participants</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" class="button accept-btn">Accept Invitation</a>
              <a href="${declineUrl}" class="button decline-btn">Decline</a>
            </div>

            <p>If you have any questions, please contact the organizer at ${hackathon.contactEmail || invitedBy.email}.</p>
            
            <p>Best regards,<br>Hackathon Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Coordinator Invitation: ${hackathon.title}`,
      html: html
    });
  }

  // Send judge invitation
  async sendJudgeInvitation(user, hackathon, invitedBy, token) {
    const acceptUrl = `${process.env.FRONTEND_URL}/judge/accept/${token}`;
    const declineUrl = `${process.env.FRONTEND_URL}/judge/decline/${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7C3AED; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .accept-btn { background: #10B981; color: white; }
          .decline-btn { background: #EF4444; color: white; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #7C3AED; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Judge Invitation</h1>
          </div>
          <div class="content">
            <p>Hello ${user.fullName},</p>
            
            <p><strong>${invitedBy.fullName}</strong> has invited you to be a judge for the hackathon:</p>
            
            <div class="details">
              <h2>${hackathon.title}</h2>
              <p>${hackathon.description}</p>
              <p><strong>Duration:</strong> ${new Date(hackathon.hackathonStartDate).toLocaleDateString()} - ${new Date(hackathon.hackathonEndDate).toLocaleDateString()}</p>
            </div>

            <p>As a judge, you will be able to:</p>
            <ul>
              <li>Access team submissions</li>
              <li>Score teams based on judging criteria</li>
              <li>Provide feedback and remarks</li>
              <li>View the leaderboard</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" class="button accept-btn">Accept Invitation</a>
              <a href="${declineUrl}" class="button decline-btn">Decline</a>
            </div>

            <p>If you have any questions, please contact the organizer at ${hackathon.contactEmail || invitedBy.email}.</p>
            
            <p>Best regards,<br>Hackathon Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Judge Invitation: ${hackathon.title}`,
      html: html
    });
  }

  // Send team registration confirmation
  async sendTeamRegistrationConfirmation(team, hackathon) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hello ${team.teamName} Team,</p>
            
            <p>Your team has been successfully registered for:</p>
            
            <div class="details">
              <h2>${hackathon.title}</h2>
              <p><strong>Team Name:</strong> ${team.teamName}</p>
              <p><strong>Team Members:</strong> ${team.members.length}</p>
              <p><strong>Hackathon Start:</strong> ${new Date(hackathon.hackathonStartDate).toLocaleDateString()}</p>
            </div>

            <p>Next steps:</p>
            <ul>
              <li>Check your dashboard for hackathon updates</li>
              <li>Prepare your project idea</li>
              <li>Review the hackathon rules and guidelines</li>
              <li>Join the hackathon community channels</li>
            </ul>

            <p>We're excited to see what you build!</p>
            
            <p>Best regards,<br>Hackathon Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to team leader
    return await this.sendEmail({
      to: team.leader.email,
      subject: `Registration Confirmed: ${hackathon.title}`,
      html: html
    });
  }

  // Send payment confirmation
  async sendPaymentConfirmation(user, payment, hackathon) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful</h1>
          </div>
          <div class="content">
            <p>Hello ${user.fullName},</p>
            
            <p>Your payment has been successfully processed.</p>
            
            <div class="details">
              <p><strong>Payment ID:</strong> ${payment.razorpayPaymentId}</p>
              <p><strong>Amount:</strong> ₹${payment.amount}</p>
              <p><strong>Hackathon:</strong> ${hackathon.title}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>You're all set for the hackathon! We look forward to seeing you there.</p>
            
            <p>Best regards,<br>Hackathon Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Payment Confirmation: ${hackathon.title}`,
      html: html
    });
  }

  // Send subscription confirmation
  async sendSubscriptionConfirmation(user, subscription, plan) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Activated!</h1>
          </div>
          <div class="content">
            <p>Hello ${user.fullName},</p>
            
            <p>Your ${plan.displayName} subscription has been successfully activated.</p>
            
            <div class="details">
              <p><strong>Plan:</strong> ${plan.displayName}</p>
              <p><strong>Billing Cycle:</strong> ${plan.billingCycle}</p>
              <p><strong>Next Billing Date:</strong> ${new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
            </div>

            <p>You now have access to:</p>
            <ul>
              ${plan.features.canCreateHackathons ? '<li>Create hackathons</li>' : ''}
              ${plan.features.analytics ? '<li>Advanced analytics</li>' : ''}
              ${plan.features.customBranding ? '<li>Custom branding</li>' : ''}
              ${plan.features.prioritySupport ? '<li>Priority support</li>' : ''}
            </ul>

            <p>Thank you for subscribing!</p>
            
            <p>Best regards,<br>Hackathon Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Subscription Activated - Hackathon Platform',
      html: html
    });
  }

  // Send team approval notification
  async sendTeamApprovalNotification(team, hackathon, approvedBy) {
    const teamUrl = `${process.env.FRONTEND_URL}/teams/${team._id}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; }
          .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Team Approved!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            
            <p>Hello ${team.teamName} Team,</p>
            
            <p>Great news! Your team registration has been <strong>approved</strong> for:</p>
            
            <div class="details">
              <h2>${hackathon.title}</h2>
              <p><strong>Team Name:</strong> ${team.teamName}</p>
              <p><strong>Team Members:</strong> ${team.members.filter(m => m.status === 'active').length}</p>
              <p><strong>Approved By:</strong> ${approvedBy.fullName}</p>
              <p><strong>Approved On:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>You're officially registered! Here's what you can do now:</p>
            <ul>
              <li>✅ Start working on your project</li>
              <li>✅ Check hackathon schedule and deadlines</li>
              <li>✅ Prepare for submissions</li>
              <li>✅ Connect with mentors and sponsors</li>
            </ul>

            <div style="text-align: center;">
              <a href="${teamUrl}" class="button">View Team Dashboard</a>
            </div>

            <p>We're excited to see what you build! Good luck!</p>
            
            <p>Best regards,<br>${hackathon.organizerDetails?.name || 'Hackathon'} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to team leader
    return await this.sendEmail({
      to: team.leader.email,
      subject: `✅ Team Approved: ${hackathon.title}`,
      html: html
    });
  }

  // Send team rejection notification
  async sendTeamRejectionNotification(team, hackathon, rejectedBy, reason) {
    const teamUrl = `${process.env.FRONTEND_URL}/teams/${team._id}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #EF4444; }
          .reason-box { background: #FEE2E2; border: 2px solid #EF4444; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Team Registration Update</h1>
          </div>
          <div class="content">
            <p>Hello ${team.teamName} Team,</p>
            
            <p>Thank you for your interest in <strong>${hackathon.title}</strong>. After careful review, we regret to inform you that your team registration was not approved at this time.</p>
            
            <div class="details">
              <p><strong>Team Name:</strong> ${team.teamName}</p>
              <p><strong>Reviewed By:</strong> ${rejectedBy.fullName}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            ${reason ? `
              <div class="reason-box">
                <h3 style="margin-top: 0; color: #991B1B;">Reason for Rejection:</h3>
                <p style="margin-bottom: 0;">${reason}</p>
              </div>
            ` : ''}

            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Review the rejection reason carefully</li>
              <li>Make necessary changes to your team</li>
              <li>Resubmit your team for approval</li>
              <li>Contact the organizers if you have questions</li>
            </ul>

            <div style="text-align: center;">
              <a href="${teamUrl}" class="button">Edit & Resubmit Team</a>
            </div>

            <p>If you have any questions, please don't hesitate to contact us at ${hackathon.organizerDetails?.email || 'support@hackathon.com'}.</p>
            
            <p>Best regards,<br>${hackathon.organizerDetails?.name || 'Hackathon'} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to team leader
    return await this.sendEmail({
      to: team.leader.email,
      subject: `Team Registration Update: ${hackathon.title}`,
      html: html
    });
  }

  // Send team note notification
  async sendTeamNoteNotification(team, hackathon, note, author) {
    const teamUrl = `${process.env.FRONTEND_URL}/teams/${team._id}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366F1; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .note-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #6366F1; }
          .button { display: inline-block; padding: 12px 24px; background: #6366F1; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message from Organizers</h1>
          </div>
          <div class="content">
            <p>Hello ${team.teamName} Team,</p>
            
            <p>The organizers have sent you a message regarding <strong>${hackathon.title}</strong>:</p>
            
            <div class="note-box">
              <p><strong>From:</strong> ${author.fullName}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 10px 0;">
              <p>${note.content}</p>
            </div>

            <div style="text-align: center;">
              <a href="${teamUrl}" class="button">View Team Dashboard</a>
            </div>
            
            <p>Best regards,<br>${hackathon.organizerDetails?.name || 'Hackathon'} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to team leader
    return await this.sendEmail({
      to: team.leader.email,
      subject: `Message from Organizers: ${hackathon.title}`,
      html: html
    });
  }
}

module.exports = new EmailService();