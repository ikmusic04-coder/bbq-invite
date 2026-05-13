const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email, name, registrationId, nickname, inviter } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${registrationId}`;

    const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FF6B35 0%,#FF9A50 50%,#FFAB46 100%);padding:40px 32px;text-align:center;">
      <div style="font-size:3rem;margin-bottom:8px;">🔥</div>
      <h1 style="color:#fff;margin:0;font-size:1.5rem;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.2);line-height:1.4;">
        IK主催BBQ<br>参加登録完了！
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px;">
      <p style="color:#1C1917;font-size:1rem;line-height:1.9;margin:0 0 24px;">
        ${name}（${nickname}）さん、<br>
        BBQへのご参加登録ありがとうございます！🎉<br>
        当日お会いできることを楽しみにしています。
      </p>

      <!-- Event Details -->
      <div style="background:#FFF7ED;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:4px solid #FF6B35;">
        <p style="color:#FF6B35;margin:0 0 10px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">📋 イベント詳細</p>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;white-space:nowrap;font-weight:600;padding-right:12px;">📅 日時</td><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;">7月28日（火）18:00〜22:00（17:30集合）</td></tr>
          <tr><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;white-space:nowrap;font-weight:600;padding-right:12px;">🏕️ 会場</td><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;">WILD MAGIC - The Rainbow Farm -</td></tr>
          <tr><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;white-space:nowrap;font-weight:600;padding-right:12px;">🚉 最寄駅</td><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;">ゆりかもめ「新豊洲駅」徒歩1分</td></tr>
          <tr><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;white-space:nowrap;font-weight:600;padding-right:12px;">💰 参加費</td><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;">¥8,000（当日現金払い）</td></tr>
          <tr><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;white-space:nowrap;font-weight:600;padding-right:12px;">👤 招待者</td><td style="padding:4px 0;font-size:0.88rem;color:#1C1917;">${inviter}</td></tr>
        </table>
      </div>

      <!-- QR Code -->
      <div style="text-align:center;margin-bottom:28px;">
        <p style="color:#1C1917;font-size:0.85rem;font-weight:700;margin:0 0 14px;">🎫 受付用QRコード</p>
        <div style="display:inline-block;background:#fff;border-radius:16px;padding:14px;box-shadow:0 4px 20px rgba(0,0,0,0.1);border:2px solid #FFE4D0;">
          <img src="${qrUrl}" alt="受付用QRコード" width="200" height="200" style="display:block;">
        </div>
        <p style="color:#78716C;font-size:0.75rem;margin:12px 0 0;">当日、受付スタッフにこのQRコードをご提示ください</p>
      </div>

      <!-- Notes -->
      <div style="background:#FFFBEB;border-radius:12px;padding:16px 20px;border:1px dashed #FCD34D;">
        <p style="color:#78350F;font-size:0.8rem;margin:0;line-height:2;">
          ※ 参加費は当日現地にて現金でお支払いください<br>
          ※ お釣りのないようご準備いただけますと助かります<br>
          ※ キャンセルは7月16日（木）までにご連絡ください<br>
          ※ 飲食物の持ち込みOKです！（アルコール歓迎！）
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F5F0E8;padding:20px 32px;text-align:center;">
      <p style="color:#A8A29E;font-size:0.72rem;margin:0;">IK主催BBQ 2025 🌊🔥🌴</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"IK主催BBQ" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '【IK主催BBQ】参加登録完了のお知らせ',
      html,
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
