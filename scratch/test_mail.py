import smtplib
from email.mime.text import MIMEText

sender = "postmanmail21@gmail.com"
password = "wecwdxpwxsjoupgt"
receiver = "postmanmail21@gmail.com"

msg = MIMEText("Test email from MemoryVerse test script")
msg["Subject"] = "Test SMTP"
msg["From"] = sender
msg["To"] = receiver

try:
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, receiver, msg.as_string())
    print("Email sent successfully!")
except Exception as e:
    print("SMTP Error:", str(e))
