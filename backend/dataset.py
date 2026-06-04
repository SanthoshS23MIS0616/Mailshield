"""
dataset.py - Synthetic phishing email dataset generator
Generates realistic phishing and legitimate email samples for training
"""
import random
import re

# ─── PHISHING TEMPLATES ──────────────────────────────────────────────────────
PHISHING_SUBJECTS = [
    "URGENT: Your account has been compromised!",
    "Action Required: Verify your identity immediately",
    "Your PayPal account has been limited",
    "ALERT: Suspicious login detected",
    "Congratulations! You've won $1,000,000",
    "Your Apple ID was used to sign in",
    "Final Notice: Invoice overdue",
    "Security Alert: Unusual activity on your account",
    "Your package could not be delivered",
    "Bank Account Suspended - Immediate Action Required",
    "You have unclaimed funds waiting",
    "Your subscription has expired - Renew now",
    "IMPORTANT: Password reset required",
    "Claim your prize before it expires",
    "Verify your email address now",
]

PHISHING_BODIES = [
    """Dear Valued Customer,

We have detected unusual activity on your account. Your account has been temporarily suspended.

Click here to verify your identity: http://secure-login-paypa1.xyz/verify?user=victim&token=abc123

Please provide your:
- Full name
- Social Security Number  
- Credit card details
- Password

URGENT: Failure to verify within 24 hours will result in permanent account closure.

Do not share this email. Act immediately.

PayPal Security Team""",

    """CONGRATULATIONS!!!

You have been selected as our lucky winner!
Prize: $1,000,000 USD Cash

To claim your prize, click: http://prize-claim-now.ru/winner?id=98765

You must provide:
- Name
- Address  
- Bank account number
- Date of birth

Offer expires in 24 HOURS! Act NOW!

International Lottery Commission""",

    """Dear User,

Your Apple ID has been used to sign in on a new device.
If this wasn't you, your account may be compromised.

VERIFY NOW: http://apple-id-verify.suspicious.co/login

Enter your Apple ID and password to secure your account.
Failure to verify will result in account suspension.

Apple Support""",

    """NOTICE: Your bank account requires immediate verification.

We have detected suspicious transactions on your account ending in XXXX.

Login here to secure your account: http://bank-secure-login.phish.net/auth

Required information:
- Account number
- PIN
- Date of birth
- Mother's maiden name

This is urgent. Respond within 2 hours.

Bank Security Department""",

    """Dear Customer,

Your invoice #INV-2024-8876 is OVERDUE.

Amount Due: $847.50
Due Date: IMMEDIATE

Pay now to avoid legal action: http://invoice-pay.malicious.org/pay?ref=8876

Click the link above to process payment immediately.
Ignoring this notice will result in collection agency referral.

Accounts Receivable""",

    """Your package from Amazon could NOT be delivered.

Tracking Number: TRK9987654321

Update your delivery details: http://amazon-delivery-update.fake.ru/track

Enter your:
- Address
- Credit card for redelivery fee ($2.99)
- Phone number

Package will be returned after 24 hours.

Amazon Delivery Service""",
]

PHISHING_URLS = [
    "http://paypa1-secure.xyz/login",
    "http://amazon-security-alert.net/verify",
    "http://bankofamerica-secure.phish.com/auth",
    "http://apple-id-suspended.ru/restore",
    "http://claim-prize-now.tk/winner",
    "http://netflix-billing-update.suspicious.org/pay",
    "http://microsoft-security-alert.fake.net/reset",
    "http://fedex-delivery-update.malicious.co/track",
    "http://irs-tax-refund-claim.scam.ru/refund",
    "http://wellsfargo-verify.phishing.tk/secure",
]

PHISHING_KEYWORDS = [
    "urgent", "immediately", "verify", "suspended", "compromised",
    "winner", "congratulations", "claim", "expire", "action required",
    "unusual activity", "security alert", "update payment", "confirm identity",
]

# ─── LEGITIMATE EMAIL TEMPLATES ──────────────────────────────────────────────
LEGIT_SUBJECTS = [
    "Meeting agenda for tomorrow",
    "Project update - Q3 Report",
    "Welcome to our newsletter",
    "Your order has shipped",
    "Invoice attached for your records",
    "Team lunch this Friday",
    "Code review requested",
    "Monthly report is ready",
    "Conference call at 3pm",
    "Happy birthday wishes",
    "Feedback on your presentation",
    "New blog post published",
    "Weekend plans?",
    "Re: Marketing campaign ideas",
    "Quarterly performance review",
]

LEGIT_BODIES = [
    """Hi Team,

I wanted to share the agenda for our meeting tomorrow at 2:00 PM in Conference Room B.

Agenda:
1. Q3 results review (30 min)
2. Product roadmap discussion (20 min)  
3. Team updates (10 min)

Please come prepared with your department updates. Let me know if you'd like to add anything.

Best regards,
Sarah Johnson
Product Manager""",

    """Hello John,

Your order #ORD-2024-56789 has been shipped and is on its way!

Order Details:
- Wireless Headphones (x1)
- Estimated delivery: 3-5 business days
- Tracking: UPS 1Z999AA10123456784

You can track your order at: https://ups.com/track

Thank you for your purchase!

Best,
Amazon Customer Service""",

    """Hi team,

Just a reminder that we have our weekly sprint review tomorrow at 10am.

Please make sure to:
- Update your JIRA tickets
- Prepare a brief demo of your completed stories
- Note any blockers for the standup

Looking forward to seeing everyone's progress!

Best,
Mike Chen
Scrum Master""",

    """Dear Newsletter Subscriber,

Thank you for being part of our community! Here's what's new this month:

- New product launch: Check out our latest features
- Company blog: 5 tips for better productivity
- Upcoming webinar: Register at https://company.com/webinar

We hope you find this valuable. Unsubscribe at any time.

The Marketing Team
Company Inc.""",

    """Hi Sarah,

Please find attached the invoice for our services rendered in October 2024.

Invoice #: INV-2024-1098
Amount: $2,450.00
Due Date: November 30, 2024

Payment can be made via bank transfer to our account on file.

If you have any questions, please don't hesitate to reach out.

Best regards,
Robert Williams
Finance Department""",

    """Hey everyone,

We're doing a team lunch this Friday at noon at The Garden Restaurant on Main Street.

RSVP by Thursday so we can make a reservation. 

Looking forward to catching up with everyone outside the office!

Cheers,
Lisa""",
]

LEGIT_URLS = [
    "https://www.amazon.com/orders",
    "https://github.com/company/project",
    "https://zoom.us/j/meeting123",
    "https://docs.google.com/document/d/abc",
    "https://company.slack.com/messages",
    "https://www.linkedin.com/in/profile",
    "https://calendar.google.com/calendar",
    "https://www.office.com",
    "https://trello.com/b/board",
    "https://drive.google.com/file/d/xyz",
]


def generate_dataset(n_phishing=800, n_legit=800):
    """Generate synthetic email dataset"""
    emails = []

    # Generate phishing emails
    for i in range(n_phishing):
        body = random.choice(PHISHING_BODIES)
        # Randomly inject extra phishing URLs
        extra_url = random.choice(PHISHING_URLS)
        body = body + f"\n\nClick here: {extra_url}"

        # Add some variation
        subject = random.choice(PHISHING_SUBJECTS)
        emails.append({
            "subject": subject,
            "body": body,
            "label": 1,  # 1 = phishing
            "label_text": "Phishing"
        })

    # Generate legitimate emails
    for i in range(n_legit):
        body = random.choice(LEGIT_BODIES)
        subject = random.choice(LEGIT_SUBJECTS)
        emails.append({
            "subject": subject,
            "body": body,
            "label": 0,  # 0 = safe
            "label_text": "Safe"
        })

    random.shuffle(emails)
    return emails
