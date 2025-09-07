const generateEmailTemplate = (booking, seats) => {
      const tableNumbers = [
        ...new Set(seats.map((seat) => seat.table.tableNumber)),
      ];
      const seatNumbers = seats.map((seat) => seat.seatNumber).join(", ");
      const totalAmount = booking.amount.toLocaleString();

      return `
      <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to La Famiglia - Casablanca</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Crimson Text', serif;
            line-height: 1.6;
            color: #ffffff;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d1f1f 50%, #1a1a1a 100%);
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(180deg, #000000 0%, #1a0d0d 50%, #000000 100%);
            border: 2px solid #d32f2f;
            box-shadow: 0 20px 40px rgba(211, 47, 47, 0.3);
        }

        .header {
            text-align: center;
            padding: 40px 30px 20px;
            background: linear-gradient(45deg, #DC2626 0%, #991B1B 100%);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(45deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.03) 2px,
                    rgba(255, 255, 255, 0.03) 4px);
            animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
            0% {
                transform: translateX(-100%);
            }

            100% {
                transform: translateX(100%);
            }
        }

        .logo {
            position: relative;
            z-index: 2;
        }

        .logo h1 {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 900;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
            margin-bottom: 10px;
            letter-spacing: 3px;
        }

        .casa {
            color: #ffffff;
        }

        .blanca {
            color: #000;
        }

        .tagline {
            font-size: 16px;
            color: #000;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            position: relative;
            z-index: 2;
        }

        .content {
            padding: 40px 30px;
            background: #0a0a0a;
        }

        .welcome-message {
            text-align: center;
            margin-bottom: 40px;
        }

        .welcome-message h2 {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            color: #ef4444;
            margin-bottom: 20px;
            font-style: italic;
        }

        .welcome-text {
            font-size: 18px;
            color: #e0e0e0;
            line-height: 1.8;
            margin-bottom: 30px;
        }

        .booking-details {
            background: linear-gradient(135deg, #1a0d0d, #2d1616);
            border: 1px solid #d32f2f;
            border-radius: 10px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: inset 0 2px 10px rgba(211, 47, 47, 0.2);
        }

        .booking-details h3 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #ef4444;
            text-align: center;
            margin-bottom: 25px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #333;
            font-size: 16px;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: 600;
            color: #d32f2f;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .detail-value {
            font-weight: 400;
            color: #ffffff;
            text-align: right;
        }

        .dress-code {
            background: #991b1b;
            color: white;
            padding: 25px;
            margin: 30px 0;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(211, 47, 47, 0.4);
        }

        .dress-code h4 {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .dress-colors {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-top: 15px;
        }

        .color-swatch {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .color-black {
            background: #000000;
        }

        .color-white {
            background: white;
        }

        .color-red {
            background: #d32f2f;
        }

        .quote {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border-left: 5px solid #d32f2f;
            border-radius: 0 10px 10px 0;
        }

        .quote p {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-style: italic;
            color: #d32f2f;
            line-height: 1.6;
            position: relative;
        }

        .quote p::before,
        .quote p::after {
            font-size: 40px;
            color: #fff;
            font-weight: bold;
        }

        .quote p::before {
            content: '"';
            margin-right: 10px;
        }

        .quote p::after {
            content: '"';
            margin-left: 10px;
        }

        .social-message {
            background: #1a1a1a;
            padding: 30px;
            border-radius: 10px;
            margin: 30px 0;
            border: 1px solid #333;
        }

        .social-message h4 {
            font-family: 'Playfair Display', serif;
            color: #d32f2f;
            font-size: 20px;
            margin-bottom: 15px;
        }

        .social-message p {
            color: #e0e0e0;
            line-height: 1.7;
            margin-bottom: 15px;
        }

        .signature {
            text-align: right;
            color: #d32f2f;
            font-weight: 600;
            font-style: italic;
            margin-top: 20px;
        }

        .footer {
            background: #991b1b;
            color: white;
            text-align: center;
            padding: 30px;
            font-size: 14px;
        }

        .footer p {
            margin-bottom: 10px;
        }

        .footer .copyright {
            font-size: 12px;
            color: #ffcccb;
            margin-top: 20px;
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }

            .header {
                padding: 30px 20px 15px;
            }

            .logo h1 {
                font-size: 36px;
            }

            .content {
                padding: 30px 20px;
            }

            .booking-details {
                padding: 20px;
            }

            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }

            .detail-value {
                text-align: left;
                font-weight: 600;
            }

            .dress-colors {
                flex-wrap: wrap;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <h1><span class="casa">CASA</span><span class="blanca">BLANCA</span></h1>
                <div class="tagline">Honor • Legacy • Ambition</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="welcome-message">
                <h2>Welcome to La Famiglia</h2>
                <p class="welcome-text">
                    Congratulations, <strong style="color: #ef4444; text-transform: capitalize;">${
                      booking.name
                    }</strong>. Your position in the famiglia
                    has been secured.
                    You have been granted access to an evening where legends gather, respect is earned, and every moment
                    becomes a story worth telling.
                </p>
            </div>

            <!-- Booking Details -->
            <div class="booking-details">
                <h3>Your Reservation Details</h3>

                <div class="detail-row">
                    <span class="detail-label">Guest Name</span>
                    <span class="detail-value" style= "text-transform: capitalize;">${
                      booking.name
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guest Email</span>
                    <span class="detail-value">${booking.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guest Phone</span>
                    <span class="detail-value">${booking.phone}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Table Assignment</span>
                    <span class="detail-value">Table ${tableNumbers.join(
                      ", "
                    )}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Seat(s) Reserved</span>
                    <span class="detail-value">${seatNumbers}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount</span>
                    <span class="detail-value">${totalAmount}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Event Date & Time</span>
                    <span class="detail-value" style="color: #ef4444; font-style: italic;">Coming Soon</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Venue</span>
                    <span class="detail-value">Afe Belgore Hall, ABUAD, Ado-Ekiti</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Date</span>
                    <span class="detail-value">${new Date(
                      booking.createdAt
                    ).toLocaleDateString()}</span>
                </div>
            </div>

            <!-- Dress Code -->
            <div class="dress-code">
                <h4>Famiglia Dress Code</h4>
                <p>Present yourself with the dignity befitting a member of our famiglia</p>
                <div class="dress-colors">
                    <div class="color-swatch color-black" title="Black"></div>
                    <div class="color-swatch color-white" title="White" style="background-color: #ffffff;"></div>
                    <div class="color-swatch color-red" title="Red"></div>
                </div>
                <p style="margin-top: 15px; font-size: 16px;"><strong>Black • White • Red</strong></p>
            </div>

            <!-- Quote -->
            <div class="quote">
                <p>Respect is earned, honor is given, but legends... legends are made at Casablanca.</p>
            </div>

            <!-- Social Directors Message -->
            <div class="social-message">
                <h4>A Message from Your Social Directors</h4>
                <p>
                    Dear Esteemed Guest,
                </p>
                <p>
                    Your journey into excellence begins the moment you step through our doors. We have crafted an
                    evening
                    that transcends mere dining – this is your initiation into a world where sophistication meets
                    intrigue,
                    where every detail has been orchestrated with meticulous precision.
                </p>
                <p>
                    Prepare yourself for an unforgettable night where the ambiance whispers secrets of honor, legacy,
                    and ambition.
                    Your seat at our table is not just reserved – it is earned.
                </p>
                <div class="signature">
                    — The Social Directors<br>
                    NUESA ABUAD Famiglia
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>What happens at Casablanca, stays at Casablanca</strong></p>
            <p>Privacy and exclusivity guaranteed for all members of the famiglia</p>
            <p>If you have any questions, please contact us at nuesadinner@gmail.com</p>
            <div class="copyright">
                ©2025 NUESA ABUAD, REFORMATION ADMINISTRATION. All rights reserved.
            </div>
        </div>
    </div>
</body>

</html>
      `;
}


export default generateEmailTemplate