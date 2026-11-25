const fs = require('fs');
const path = require('path');

const logoBase64 = fs.readFileSync(path.join(__dirname, 'pulse-logo.png')).toString('base64');
const logoSrc = `data:image/png;base64,${logoBase64}`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Pulse — Hackathon Presentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  @page {
    size: 960px 540px;
    margin: 0;
  }
  body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0f172a;
    color: #0f172a;
    margin: 0;
    padding: 0;
  }
  .slide {
    position: relative;
    width: 960px;
    height: 540px;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    background: #F4F8FF;
  }
  .slide:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* Cover & Closing gradient slides */
  .slide-gradient {
    background: linear-gradient(125deg, #1E3FA3 0%, #235EE3 52%, #1994E8 100%);
    color: #ffffff;
  }

  /* Decorative soft circles on light slides */
  .bg-circle-tr1 {
    position: absolute;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.06);
    top: -150px;
    right: -110px;
    pointer-events: none;
  }
  .bg-circle-tr2 {
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: rgba(14, 165, 233, 0.08);
    top: 20px;
    right: -90px;
    pointer-events: none;
  }
  .bg-circle-bl {
    position: absolute;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.05);
    bottom: -90px;
    left: -80px;
    pointer-events: none;
  }

  /* Brand logo top right on light slides */
  .top-right-logo {
    position: absolute;
    top: 46px;
    right: 56px;
    height: 28px;
    width: auto;
    z-index: 5;
  }

  /* White pill logo on gradient slides */
  .logo-white-pill {
    position: absolute;
    top: 52px;
    left: 56px;
    width: 128px;
    height: 56px;
    background: #ffffff;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 18px;
    z-index: 5;
  }
  .logo-white-pill img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Section header on light slides */
  .section-tag {
    position: absolute;
    top: 50px;
    left: 56px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #1D4ED8;
    text-transform: uppercase;
  }
  .slide-title {
    position: absolute;
    top: 68px;
    left: 56px;
    font-size: 33px;
    font-weight: 700;
    color: #0F172A;
    letter-spacing: -0.5px;
    line-height: 1.18;
  }
  .slide-subtitle {
    position: absolute;
    top: 117px;
    left: 56px;
    font-size: 14.5px;
    font-weight: 400;
    color: #52627A;
  }

  /* Footer on light slides */
  .slide-footer {
    position: absolute;
    bottom: 22px;
    left: 56px;
    right: 56px;
    height: 28px;
    border-top: 1px solid #DCE6F7;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    font-size: 10px;
    color: #52627A;
    padding-top: 8px;
  }

  /* Cards */
  .card {
    background: #ffffff;
    border: 1px solid #DCE7F9;
    border-radius: 16px;
    box-shadow: 0 4px 14px rgba(29, 78, 216, 0.03);
  }

  /* Number badge */
  .num-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%);
    color: #ffffff;
    font-weight: 700;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
</style>
</head>
<body>

<!-- ==================== SLIDE 1: COVER ==================== -->
<section class="slide slide-gradient">
  <div class="logo-white-pill">
    <img src="${logoSrc}" alt="Pulse" />
  </div>

  <!-- Concentric rings + Pulse ECG line -->
  <svg style="position:absolute; top:0; left:0; width:960px; height:540px; pointer-events:none;" viewBox="0 0 960 540">
    <circle cx="770" cy="270" r="250" fill="rgba(255,255,255,0.05)" />
    <circle cx="770" cy="270" r="175" fill="rgba(255,255,255,0.06)" />
    <circle cx="770" cy="270" r="100" fill="rgba(255,255,255,0.07)" />
    <polyline points="580,270 686.4,270 724.4,226 770,319.5 815.6,242.5 846,270 960,270"
      fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <div style="position:absolute; top:194px; left:56px; background:#ffffff; color:#1D4ED8; font-size:9.5px; font-weight:700; padding:5px 14px; border-radius:999px; letter-spacing:0.4px;">
    SOCIAL FINTECH INFRASTRUCTURE
  </div>

  <h1 style="position:absolute; top:232px; left:56px; font-size:50px; font-weight:700; line-height:1.12; letter-spacing:-0.8px; color:#ffffff;">
    Save Together.<br/>Grow Faster.
  </h1>

  <p style="position:absolute; top:372px; left:56px; width:470px; font-size:15px; line-height:1.55; color:rgba(255,255,255,0.88); font-weight:400;">
    Instant NGN wallets, personal &amp; group savings plans, live group savings chat, and instant P2P transfers.
  </p>

  <div style="position:absolute; bottom:42px; left:56px; font-size:11.5px; color:rgba(255,255,255,0.85);">
    Hackathon Presentation &nbsp;·&nbsp; Deployed on Nobus Cloud &nbsp;·&nbsp; 2026
  </div>
</section>

<!-- ==================== SLIDE 2: THE PROBLEM ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">01 · THE PROBLEM</div>
  <h2 class="slide-title">Saving Alone Doesn’t Work</h2>
  <p class="slide-subtitle">Group savings (Ajo, Esusu, Chama) &amp; peer transfers still run on fragmented chats and manual bank screenshots.</p>

  <div style="position:absolute; top:168px; left:56px; right:56px; display:grid; grid-template-columns:repeat(3, 1fr); gap:22px; height:238px;">
    <div class="card" style="padding:28px 24px;">
      <div style="font-size:44px; font-weight:700; color:#1D4ED8; line-height:1.1; margin-bottom:14px;">68%</div>
      <div style="font-size:16.5px; font-weight:700; color:#0F172A; margin-bottom:10px;">Solo plans fail</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">Without shared accountability, automated tracking, or pace insights, most savers quit within 90 days.</div>
    </div>
    <div class="card" style="padding:28px 24px;">
      <div style="font-size:44px; font-weight:700; color:#1D4ED8; line-height:1.1; margin-bottom:14px;">₦14B+</div>
      <div style="font-size:16.5px; font-weight:700; color:#0F172A; margin-bottom:10px;">Informal pools are blind</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">Coordinated in WhatsApp groups with manual receipt screenshots and zero real-time ledger visibility.</div>
    </div>
    <div class="card" style="padding:28px 24px;">
      <div style="font-size:44px; font-weight:700; color:#1D4ED8; line-height:1.1; margin-bottom:14px;">3+ Apps</div>
      <div style="font-size:16.5px; font-weight:700; color:#0F172A; margin-bottom:10px;">Disconnected money flow</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">Friends bounce between chat apps, calculators, and bank apps just to fund goals, split bills, or send P2P cash.</div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>2 / 10</span>
  </div>
</section>

<!-- ==================== SLIDE 3: THE SOLUTION ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">02 · THE SOLUTION</div>
  <h2 class="slide-title">Meet Pulse</h2>
  <p class="slide-subtitle">A social wallet &amp; multiplayer savings OS built for friend circles and communities.</p>

  <!-- Left 3 features -->
  <div style="position:absolute; top:188px; left:56px; width:400px; display:flex; flex-direction:column; gap:28px;">
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <div class="num-badge">1</div>
      <div>
        <div style="font-size:16px; font-weight:700; color:#0F172A; margin-bottom:3px;">Instant NGN wallet &amp; top-ups</div>
        <div style="font-size:13px; color:#52627A;">Fund your wallet instantly via demo top-up or Paystack with an atomic double-entry ledger.</div>
      </div>
    </div>
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <div class="num-badge">2</div>
      <div>
        <div style="font-size:16px; font-weight:700; color:#0F172A; margin-bottom:3px;">Personal &amp; group savings plans</div>
        <div style="font-size:13px; color:#52627A;">Launch solo goals or invite friends with a 6-character code (PLS-XXXX) and track live contributions.</div>
      </div>
    </div>
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <div class="num-badge">3</div>
      <div>
        <div style="font-size:16px; font-weight:700; color:#0F172A; margin-bottom:3px;">Instant @username P2P &amp; splits</div>
        <div style="font-size:13px; color:#52627A;">Send money peer-to-peer by @username or settle 1-click group payment requests in seconds.</div>
      </div>
    </div>
  </div>

  <!-- Right UI preview card -->
  <div class="card" style="position:absolute; top:154px; right:56px; width:404px; padding:24px 26px 22px 26px;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #E8F0FE;">
      <div>
        <div style="font-size:16px; font-weight:700; color:#0F172A;">December Detty Group Plan</div>
        <div style="font-size:11.5px; color:#64748B; margin-top:2px;">6 members &nbsp;·&nbsp; Invite Code: <strong>PLS-89X2</strong></div>
      </div>
      <div style="background:#0284C7; color:#ffffff; font-size:10.5px; font-weight:700; padding:5px 12px; border-radius:999px;">
        GROUP PLAN
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#64748B; letter-spacing:0.4px; margin-bottom:6px;">
      <span>POOLED PLAN BALANCE</span>
      <span>84% of ₦100,000</span>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px;">
      <div style="font-size:32px; font-weight:800; color:#0F172A;">₦84,000.00</div>
      <div style="font-size:12px; font-weight:700; color:#15803D;">+₦15,000 today</div>
    </div>

    <div style="width:100%; height:9px; background:#E2E8F0; border-radius:999px; overflow:hidden; margin-bottom:18px;">
      <div style="width:84%; height:100%; background:linear-gradient(90deg, #1D4ED8 0%, #0EA5E9 100%); border-radius:999px;"></div>
    </div>

    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <span style="background:#DCFCE7; color:#15803D; font-size:10px; font-weight:700; padding:5px 11px; border-radius:999px;">
        🥇 Top Saver: @lam (42%)
      </span>
      <span style="background:#E0F2FE; color:#1D4ED8; font-size:10px; font-weight:700; padding:5px 11px; border-radius:999px;">
        ⚡ Smart Pace: ₦2,600/day to target
      </span>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>3 / 10</span>
  </div>
</section>

<!-- ==================== SLIDE 4: GROUP SAVINGS COMMUNICATION ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">03 · GROUP SAVINGS COMMUNICATION</div>
  <h2 class="slide-title">Save Better Together</h2>
  <p class="slide-subtitle">Real-time chat, automated contribution alerts, and leaderboards inside every group plan.</p>

  <!-- Left 3 items -->
  <div style="position:absolute; top:192px; left:56px; width:400px; display:flex; flex-direction:column; gap:30px;">
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <div class="num-badge">1</div>
      <div>
        <div style="font-size:16px; font-weight:700; color:#0F172A; margin-bottom:3px;">Live contribution alerts</div>
        <div style="font-size:13px; color:#52627A;">Every wallet contribution posts an instant verified system alert into the group feed.</div>
      </div>
    </div>
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <div class="num-badge">2</div>
      <div>
        <div style="font-size:16px; font-weight:700; color:#0F172A; margin-bottom:3px;">Chat inside each savings plan</div>
        <div style="font-size:13px; color:#52627A;">Socket.io powered group rooms — no WhatsApp switching, no fake transfer screenshots.</div>
      </div>
    </div>
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <div class="num-badge">3</div>
      <div>
        <div style="font-size:16px; font-weight:700; color:#0F172A; margin-bottom:3px;">Leaderboards &amp; 1-click splits</div>
        <div style="font-size:13px; color:#52627A;">Rank top savers with contributor badges and drop 1-click payment requests in chat.</div>
      </div>
    </div>
  </div>

  <!-- Right Live Chat & Activity Card -->
  <div class="card" style="position:absolute; top:154px; right:56px; width:404px; padding:22px 26px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <div style="font-size:15.5px; font-weight:700; color:#0F172A;">Group Room · Live Chat</div>
      <div style="background:#DCFCE7; color:#15803D; font-size:10.5px; font-weight:700; padding:4px 11px; border-radius:999px; white-space:nowrap;">
        ● Live Feed
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:700; color:#64748B; margin-bottom:5px;">
      <span>GOAL PROGRESS</span>
      <span style="color:#1D4ED8;">90% complete</span>
    </div>
    <div style="width:100%; height:8px; background:#E2E8F0; border-radius:999px; overflow:hidden; margin-bottom:18px;">
      <div style="width:90%; height:100%; background:linear-gradient(90deg, #1D4ED8 0%, #0EA5E9 100%); border-radius:999px;"></div>
    </div>

    <!-- Chat item 1 -->
    <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:14px;">
      <div style="width:30px; height:30px; border-radius:50%; background:#E0F2FE; color:#1D4ED8; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;">LA</div>
      <div>
        <div style="font-size:11.5px; color:#475569;"><strong>@lam</strong> contributed <strong>₦15,000</strong> from Wallet</div>
        <div style="display:inline-block; margin-top:5px; background:#EFF6FF; color:#1D4ED8; font-size:10.5px; font-weight:600; padding:5px 12px; border-radius:999px;">
          🔥 Activity Alert: Group reached 90% of target!
        </div>
      </div>
    </div>

    <!-- Chat item 2 -->
    <div style="display:flex; align-items:flex-start; gap:12px;">
      <div style="width:30px; height:30px; border-radius:50%; background:#E0F2FE; color:#1D4ED8; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;">HF</div>
      <div>
        <div style="font-size:11.5px; color:#475569;"><strong>@hafidh</strong> posted in group chat</div>
        <div style="display:inline-block; margin-top:5px; background:#EFF6FF; color:#1D4ED8; font-size:10.5px; font-weight:600; padding:5px 12px; border-radius:999px;">
          “Awesome! Dropping my final ₦10k contribution now 🚀”
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>4 / 10</span>
  </div>
</section>

<!-- ==================== SLIDE 5: HOW IT WORKS ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">04 · HOW IT WORKS</div>
  <h2 class="slide-title">Three Steps to Multiplayer Savings</h2>
  <p class="slide-subtitle">Fund your NGN wallet, launch a savings plan, and move money with friends in under 60 seconds.</p>

  <div style="position:absolute; top:168px; left:56px; right:56px; display:grid; grid-template-columns:repeat(3, 1fr); gap:22px; height:238px;">
    <div class="card" style="padding:26px 24px;">
      <div style="display:inline-block; background:#E8F0FE; color:#1D4ED8; font-size:10px; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:22px;">
        STEP 01
      </div>
      <div style="font-size:18px; font-weight:700; color:#0F172A; margin-bottom:10px;">Claim @tag &amp; fund wallet</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">Register your unique @username, auto-provision an NGN wallet, and top up instantly via demo deposit or Paystack.</div>
    </div>

    <div class="card" style="padding:26px 24px;">
      <div style="display:inline-block; background:#E8F0FE; color:#1D4ED8; font-size:10px; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:22px;">
        STEP 02
      </div>
      <div style="font-size:18px; font-weight:700; color:#0F172A; margin-bottom:10px;">Create or join a plan</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">Launch a Personal or Group savings plan with a target &amp; deadline. Invite friends with a 6-character code and fund from your wallet.</div>
    </div>

    <div class="card" style="padding:26px 24px;">
      <div style="display:inline-block; background:#E8F0FE; color:#1D4ED8; font-size:10px; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:22px;">
        STEP 03
      </div>
      <div style="font-size:18px; font-weight:700; color:#0F172A; margin-bottom:10px;">Chat, split &amp; transfer P2P</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">Coordinate in real-time group chat, track contributor rankings, and send instant @username P2P transfers with live notifications.</div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>5 / 10</span>
  </div>
</section>

<!-- ==================== SLIDE 6: PRODUCT PILLARS ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">05 · PRODUCT PILLARS</div>
  <h2 class="slide-title">Built for Trust and Speed</h2>
  <p class="slide-subtitle">Core MVP &amp; bonus capabilities engineered for atomic reliability and real-time collaboration.</p>

  <div style="position:absolute; top:168px; left:56px; right:56px; display:grid; grid-template-columns:repeat(2, 1fr); gap:20px;">
    <div class="card" style="padding:24px; display:flex; align-items:flex-start; gap:14px; height:118px;">
      <div style="width:6px; height:40px; border-radius:99px; background:linear-gradient(180deg,#2563EB,#0EA5E9); flex-shrink:0;"></div>
      <div>
        <div style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:5px;">Atomic NGN wallet &amp; funding</div>
        <div style="font-size:13px; color:#52627A;">1-click instant demo top-ups, Paystack verification, and double-entry transaction ledger records.</div>
      </div>
    </div>

    <div class="card" style="padding:24px; display:flex; align-items:flex-start; gap:14px; height:118px;">
      <div style="width:6px; height:40px; border-radius:99px; background:linear-gradient(180deg,#2563EB,#0EA5E9); flex-shrink:0;"></div>
      <div>
        <div style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:5px;">Group chat &amp; activity alerts</div>
        <div style="font-size:13px; color:#52627A;">Every contribution, member join, and milestone posts automatically inside the plan’s live conversation.</div>
      </div>
    </div>

    <div class="card" style="padding:24px; display:flex; align-items:flex-start; gap:14px; height:118px;">
      <div style="width:6px; height:40px; border-radius:99px; background:linear-gradient(180deg,#2563EB,#0EA5E9); flex-shrink:0;"></div>
      <div>
        <div style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:5px;">Personal &amp; group savings plans</div>
        <div style="font-size:13px; color:#52627A;">Custom targets, invite codes, contributor leaderboards (🥇 Top Saver), and Smart Pace savings advisor insights.</div>
      </div>
    </div>

    <div class="card" style="padding:24px; display:flex; align-items:flex-start; gap:14px; height:118px;">
      <div style="width:6px; height:40px; border-radius:99px; background:linear-gradient(180deg,#2563EB,#0EA5E9); flex-shrink:0;"></div>
      <div>
        <div style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:5px;">Instant P2P transfers &amp; bill splits</div>
        <div style="font-size:13px; color:#52627A;">Live @username lookup, instant wallet-to-wallet transfers, 1-click split payment requests, and live notifications.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>6 / 10</span>
  </div>
</section>

<!-- ==================== SLIDE 7: MARKET ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">06 · MARKET</div>
  <h2 class="slide-title">A Massive Opportunity</h2>
  <p class="slide-subtitle">Informal group savers and peer-to-peer social circles moving to digital rails.</p>

  <div style="position:absolute; top:168px; left:56px; right:56px; display:grid; grid-template-columns:repeat(3, 1fr); gap:22px; height:238px;">
    <div class="card" style="padding:26px 24px;">
      <div style="display:inline-block; background:#0284C7; color:#ffffff; font-size:10px; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:18px;">
        TAM
      </div>
      <div style="font-size:42px; font-weight:700; color:#1D4ED8; line-height:1.1; margin-bottom:14px;">₦180B</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">500M+ informal group savers and community pools worldwide</div>
    </div>

    <div class="card" style="padding:26px 24px;">
      <div style="display:inline-block; background:#0284C7; color:#ffffff; font-size:10px; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:18px;">
        SAM
      </div>
      <div style="font-size:42px; font-weight:700; color:#1D4ED8; line-height:1.1; margin-bottom:14px;">₦28B</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">Digital savings circles &amp; P2P youth wallets across Sub-Saharan Africa</div>
    </div>

    <div class="card" style="padding:26px 24px;">
      <div style="display:inline-block; background:#0284C7; color:#ffffff; font-size:10px; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:18px;">
        SOM
      </div>
      <div style="font-size:42px; font-weight:700; color:#1D4ED8; line-height:1.1; margin-bottom:14px;">₦1.4B</div>
      <div style="font-size:13px; color:#52627A; line-height:1.55;">1.2M active savers across 150K group plans within 36 months</div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>7 / 10</span>
  </div>
</section>

<!-- ==================== SLIDE 8: MONETIZATION ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">07 · MONETIZATION</div>
  <h2 class="slide-title">How Pulse Makes Money</h2>
  <p class="slide-subtitle">Three clear revenue streams built around wallets, group plans, and transfers.</p>

  <div style="position:absolute; top:168px; left:56px; right:56px; display:grid; grid-template-columns:repeat(3, 1fr); gap:22px; height:238px;">
    <div class="card" style="padding:24px; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div class="num-badge" style="margin-bottom:16px;">1</div>
        <div style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:6px;">Pooled float yield share</div>
        <div style="font-size:12.5px; color:#52627A; line-height:1.5;">Net interest margin earned on pooled wallet &amp; active savings plan balances.</div>
      </div>
      <div style="border-top:1px solid #E8F0FE; padding-top:12px; font-size:21px; font-weight:700; color:#1D4ED8;">
        2.5% – 4.0%
      </div>
    </div>

    <div class="card" style="padding:24px; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div class="num-badge" style="margin-bottom:16px;">2</div>
        <div style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:6px;">Funding &amp; payout fees</div>
        <div style="font-size:12.5px; color:#52627A; line-height:1.5;">Internal P2P transfers stay free; small fee on external gateway top-ups &amp; instant payouts.</div>
      </div>
      <div style="border-top:1px solid #E8F0FE; padding-top:12px; font-size:21px; font-weight:700; color:#1D4ED8;">
        0.5% – 1.2%
      </div>
    </div>

    <div class="card" style="padding:24px; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div class="num-badge" style="margin-bottom:16px;">3</div>
        <div style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:6px;">Pulse Pro Circles</div>
        <div style="font-size:12.5px; color:#52627A; line-height:1.5;">Advanced analytics, automated split reminders, and exportable ledgers for clubs &amp; cooperatives.</div>
      </div>
      <div style="border-top:1px solid #E8F0FE; padding-top:12px; font-size:21px; font-weight:700; color:#1D4ED8;">
        ₦1,500 – ₦5k / mo
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>8 / 10</span>
  </div>
</section>

<!-- ==================== SLIDE 9: ARCHITECTURE & ROADMAP ==================== -->
<section class="slide">
  <div class="bg-circle-tr1"></div>
  <div class="bg-circle-tr2"></div>
  <div class="bg-circle-bl"></div>
  <img class="top-right-logo" src="${logoSrc}" alt="Pulse" />

  <div class="section-tag">08 · NOBUS ARCHITECTURE &amp; ROADMAP</div>
  <h2 class="slide-title">Live on Nobus Cloud, Ready to Scale</h2>

  <!-- Top 4 metric cards -->
  <div style="position:absolute; top:126px; left:56px; right:56px; display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; height:106px;">
    <div class="card" style="padding:18px 20px;">
      <div style="font-size:28px; font-weight:700; color:#1D4ED8; margin-bottom:4px;">5 + 4</div>
      <div style="font-size:11.5px; color:#52627A;">Core MVP + 4 bonus features built</div>
    </div>
    <div class="card" style="padding:18px 20px;">
      <div style="font-size:28px; font-weight:700; color:#1D4ED8; margin-bottom:4px;">&lt; 50ms</div>
      <div style="font-size:11.5px; color:#52627A;">Real-time Socket.io chat &amp; P2P</div>
    </div>
    <div class="card" style="padding:18px 20px;">
      <div style="font-size:28px; font-weight:700; color:#1D4ED8; margin-bottom:4px;">Docker</div>
      <div style="font-size:11.5px; color:#52627A;">Frontend, API &amp; DB on Nobus VM</div>
    </div>
    <div class="card" style="padding:18px 20px;">
      <div style="font-size:28px; font-weight:700; color:#1D4ED8; margin-bottom:4px;">100%</div>
      <div style="font-size:11.5px; color:#52627A;">Atomic double-entry wallet ledger</div>
    </div>
  </div>

  <!-- Bottom 4 phase cards -->
  <div style="position:absolute; top:252px; left:56px; right:56px; display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; height:158px;">
    <div class="card" style="padding:18px 20px; position:relative;">
      <div style="height:4px; background:#1D4ED8; border-radius:99px; margin-bottom:18px;"></div>
      <div style="font-size:10px; font-weight:700; color:#1D4ED8; margin-bottom:8px;">PHASE 1 · LIVE TODAY</div>
      <div style="font-size:15px; font-weight:700; color:#0F172A; line-height:1.35;">Auth, NGN Wallet Funding &amp; Ledger</div>
    </div>

    <div class="card" style="padding:18px 20px; position:relative;">
      <div style="height:4px; background:#1D4ED8; border-radius:99px; margin-bottom:18px;"></div>
      <div style="font-size:10px; font-weight:700; color:#1D4ED8; margin-bottom:8px;">PHASE 2 · LIVE TODAY</div>
      <div style="font-size:15px; font-weight:700; color:#0F172A; line-height:1.35;">Personal &amp; Group Savings + Live Chat</div>
    </div>

    <div class="card" style="padding:18px 20px; position:relative; background:#F0F7FF;">
      <div style="height:4px; background:#0284C7; border-radius:99px; margin-bottom:18px;"></div>
      <div style="font-size:10px; font-weight:700; color:#0284C7; margin-bottom:8px;">PHASE 3 · LIVE BONUS</div>
      <div style="font-size:15px; font-weight:700; color:#0F172A; line-height:1.35;">P2P Transfers, Splits, Alerts &amp; Insights</div>
    </div>

    <div class="card" style="padding:18px 20px; position:relative;">
      <div style="height:4px; background:#475569; border-radius:99px; margin-bottom:18px;"></div>
      <div style="font-size:10px; font-weight:700; color:#475569; margin-bottom:8px;">PHASE 4 · NEXT</div>
      <div style="font-size:15px; font-weight:700; color:#0F172A; line-height:1.35;">Auto-Debits, Treasury Yield &amp; Virtual Cards</div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Pulse &nbsp;·&nbsp; Hackathon 2026</span>
    <span>9 / 10</span>
  </div>
</section>




<!-- ==================== SLIDE 10: CLOSING ==================== -->
<section class="slide slide-gradient">
  <div class="logo-white-pill">
    <img src="${logoSrc}" alt="Pulse" />
  </div>

  <svg style="position:absolute; top:0; left:0; width:960px; height:540px; pointer-events:none;" viewBox="0 0 960 540">
    <circle cx="880" cy="70" r="160" fill="rgba(255,255,255,0.05)" />
    <circle cx="780" cy="400" r="240" fill="rgba(255,255,255,0.06)" />
  </svg>

  <div style="position:absolute; top:148px; left:56px; background:#ffffff; color:#1D4ED8; font-size:9.5px; font-weight:700; padding:5px 14px; border-radius:999px; letter-spacing:0.4px;">
    RECAP
  </div>

  <h1 style="position:absolute; top:182px; left:56px; font-size:44px; font-weight:700; color:#ffffff; letter-spacing:-0.6px; line-height:1.15;">
    Why Pulse Wins
  </h1>

  <div style="position:absolute; top:258px; left:56px; right:56px; display:grid; grid-template-columns:repeat(3, 1fr); gap:18px;">
    <div style="background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.22); border-radius:14px; padding:20px 18px;">
      <div style="font-size:28px; font-weight:700; color:#ffffff; margin-bottom:6px;">&#x20A6;1.4B</div>
      <div style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.92); margin-bottom:6px;">Obtainable Market</div>
      <div style="font-size:11px; color:rgba(255,255,255,0.72); line-height:1.45;">1.2M savers across 150K group plans within 36 months.</div>
    </div>
    <div style="background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.22); border-radius:14px; padding:20px 18px;">
      <div style="font-size:28px; font-weight:700; color:#ffffff; margin-bottom:6px;">9 Features</div>
      <div style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.92); margin-bottom:6px;">Live on Nobus Cloud</div>
      <div style="font-size:11px; color:rgba(255,255,255,0.72); line-height:1.45;">Wallets, savings, P2P, group chat, splits, alerts &amp; insights — all shipped.</div>
    </div>
    <div style="background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.22); border-radius:14px; padding:20px 18px;">
      <div style="font-size:28px; font-weight:700; color:#ffffff; margin-bottom:6px;">3 Revenue</div>
      <div style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.92); margin-bottom:6px;">Streams from Day One</div>
      <div style="font-size:11px; color:rgba(255,255,255,0.72); line-height:1.45;">Float yield, funding fees, and Pulse Pro subscriptions.</div>
    </div>
  </div>

  <p style="position:absolute; top:432px; left:56px; width:520px; font-size:14.5px; line-height:1.55; color:rgba(255,255,255,0.88); font-weight:400;">
    Pulse turns informal savings into a real-time, social-first financial platform. The product is live — let us show you.
  </p>

  <div style="position:absolute; bottom:24px; right:56px; font-size:10.5px; color:rgba(255,255,255,0.85);">
    10 / 10
  </div>
</section>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'Pulse_Hackathon_Deck_Updated.html'), html, 'utf8');
console.log('Generated Pulse_Hackathon_Deck_Updated.html');
