const { Resend } = require('resend');

const resend = new Resend(process.env.Resend_Api_Key);

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { firstName, lastName, email, phone, address, service, urgency, message } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        // Format the email content
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7E8A6D; border-bottom: 2px solid #7E8A6D; padding-bottom: 10px;">
                    New Quote Request from TickTock Plumbing Website
                </h2>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
                    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
                    ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
                </div>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Service Details</h3>
                    <p><strong>Service Needed:</strong> ${service || 'Not specified'}</p>
                    <p><strong>Urgency:</strong> ${urgency || 'Routine Service'}</p>
                </div>
                
                ${message ? `
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Message</h3>
                    <p>${message}</p>
                </div>
                ` : ''}
                
                <div style="margin-top: 30px; padding: 15px; background-color: #7E8A6D; color: white; border-radius: 8px; text-align: center;">
                    <p style="margin: 0;">Reply directly to this email or call the customer at <strong>${phone}</strong></p>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 20px; text-align: center;">
                    This email was sent from the TickTock Plumbing website contact form.
                </p>
            </div>
        `;

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'TickTock Plumbing <ernesto@maktubworkspace.com>',
            to: ['ticktockplumbing@yahoo.com'],
            replyTo: email,
            subject: `New Quote Request: ${service || 'General Inquiry'} - ${firstName} ${lastName}`,
            html: emailHtml,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message || 'Failed to send email',
                details: error
            });
        }

        console.log('Email sent successfully:', data);
        return res.status(200).json({ success: true, message: 'Quote request sent successfully' });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error',
            details: error.toString()
        });
    }
};

