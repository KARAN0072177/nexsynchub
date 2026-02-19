import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: [email],
    subject: "Verify your NexSyncHub account",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verify your email</h2>
        <p>Click the button below to verify your account:</p>

        <a href="${verifyUrl}" 
           style="
             display:inline-block;
             padding:10px 20px;
             background:#000;
             color:#fff;
             text-decoration:none;
             border-radius:6px;
           ">
          Verify Email
        </a>

        <p>This link expires in 10 minutes.</p>
      </div>
    `
  });
}