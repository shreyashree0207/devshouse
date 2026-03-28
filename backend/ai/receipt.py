import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

def generate_receipt(donation_data: dict) -> bytes:
    from io import BytesIO
    buffer = BytesIO()

    # Extract info with defaults
    donor_name = donation_data.get('donor_name', 'N/A')
    donor_email = donation_data.get('donor_email', 'N/A')
    amount = donation_data.get('amount', 0.0)
    currency = donation_data.get('currency', 'INR')
    ngo_name = donation_data.get('ngo_name', 'N/A')
    ngo_registration_number = donation_data.get('ngo_registration_number', 'N/A')
    project_name = donation_data.get('project_name', 'N/A')
    donation_date = donation_data.get('donation_date', datetime.now().strftime('%Y-%m-%d'))
    transaction_id = donation_data.get('transaction_id', 'N/A')
    sdg_goals = donation_data.get('sdg_goals', [])

    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    elements = []
    styles = getSampleStyleSheet()

    # Custom Styles
    green_color = colors.HexColor('#16a34a')
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        textColor=green_color,
        fontSize=24,
        alignment=0,
        spaceAfter=5
    )
    
    tagline_style = ParagraphStyle(
        'TaglineStyle',
        parent=styles['Normal'],
        textColor=colors.dimgrey,
        fontSize=10,
        italic=True,
        spaceAfter=20
    )

    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        textColor=colors.black,
        fontSize=16,
        alignment=1,
        spaceAfter=20
    )

    amount_style = ParagraphStyle(
        'AmountStyle',
        parent=styles['Heading1'],
        textColor=green_color,
        fontSize=28,
        alignment=1,
        spaceAfter=20
    )

    tax_style = ParagraphStyle(
        'TaxStyle',
        parent=styles['Normal'],
        textColor=colors.black,
        fontSize=10,
        alignment=1,
        spaceAfter=20
    )

    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        textColor=colors.grey,
        fontSize=8,
        alignment=1,
        spaceBefore=30
    )

    # Header
    elements.append(Paragraph("<b>Sustainify</b>", title_style))
    elements.append(Paragraph("Donate with Proof. Give with Purpose.", tagline_style))
    elements.append(Paragraph("OFFICIAL DONATION RECEIPT", heading_style))

    # Details table
    receipt_number = f"REC-{transaction_id[-8:]}" if transaction_id != 'N/A' and len(transaction_id) >= 8 else f"REC-{int(datetime.now().timestamp())}"
    
    data = [
        ["Receipt Number:", receipt_number, "Donation Date:", donation_date],
        ["Donor Name:", donor_name, "NGO Name:", ngo_name],
        ["Donor Email:", donor_email, "Project Name:", project_name],
        ["Transaction ID:", transaction_id, "Registration Form:", ngo_registration_number]
    ]

    t = Table(data, colWidths=[100, 140, 100, 140])
    t.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#dcfce7')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold')
    ]))
    elements.append(t)
    elements.append(Spacer(1, 40))

    # Amount breakdown
    formatted_amount = f"{currency} {amount:,.2f}"
    elements.append(Paragraph(f"<b>{formatted_amount}</b>", amount_style))
    
    amount_desc = ParagraphStyle('Desc', parent=styles['Normal'], alignment=1)
    elements.append(Paragraph("Successful Donation Amount", amount_desc))
    elements.append(Spacer(1, 30))

    # 80G Tax Exemption
    if ngo_registration_number != 'N/A':
        tax_text = f"This donation is eligible for tax exemption under Section 80G of the Income Tax Act, 1961.<br/>NGO Registration Number: <b>{ngo_registration_number}</b>"
        elements.append(Paragraph(tax_text, tax_style))
        elements.append(Spacer(1, 20))

    # SDG Goals
    if sdg_goals:
        elements.append(Paragraph("<b>UN Sustainable Development Goals Supported:</b>", styles['Normal']))
        elements.append(Spacer(1, 10))
        for goal in sdg_goals:
            elements.append(Paragraph(f"• {goal}", styles['Normal']))
        elements.append(Spacer(1, 20))

    # Footer
    elements.append(Spacer(1, 40))
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    elements.append(Paragraph(f"Verified by Sustainify AI | Generated at {timestamp}", footer_style))

    doc.build(elements)
    
    return buffer.getvalue()


if __name__ == "__main__":
    sample_data = {
        "donor_name": "Rohan Sharma",
        "donor_email": "rohan.sharma@example.com",
        "amount": 5000.0,
        "currency": "INR",
        "ngo_name": "Green Earth India",
        "ngo_registration_number": "DEL-80G-2023-4567",
        "project_name": "Plant 10,000 Trees in Delhi",
        "donation_date": "2023-11-15",
        "transaction_id": "TXN9876543210ABC",
        "sdg_goals": [
            "SDG 13 - Climate Action",
            "SDG 15 - Life on Land"
        ]
    }
    
    pdf_bytes = generate_receipt(sample_data)
    
    # Save test receipt
    file_path = "test_receipt.pdf"
    import os
    abs_path = os.path.join(os.path.dirname(__file__), file_path)
    with open(abs_path, "wb") as f:
        f.write(pdf_bytes)
    print(f"{file_path} generated successfully at {abs_path}.")
