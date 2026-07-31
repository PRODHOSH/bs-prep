type CourseWelcomeEmailInput = {
  studentName: string
  studentEmail: string
  courses?: Array<{
    title: string
    thumbnailUrl?: string | null
  }>
  courseTitles?: string[]
  dashboardUrl?: string
}

type ResendEmailPayload = {
  from: string
  to: string[]
  subject: string
  html: string
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function joinCourseTitles(courseTitles: string[]): string {
  if (courseTitles.length === 0) {
    return "your course"
  }

  if (courseTitles.length === 1) {
    return courseTitles[0]
  }

  if (courseTitles.length === 2) {
    return `${courseTitles[0]} and ${courseTitles[1]}`
  }

  return `${courseTitles.slice(0, -1).join(", ")}, and ${courseTitles[courseTitles.length - 1]}`
}

function normalizeCourses(input: CourseWelcomeEmailInput): Array<{ title: string; thumbnailUrl: string | null }> {
  const fromCourses = (input.courses ?? [])
    .map((course) => ({
      title: course.title.trim(),
      thumbnailUrl: course.thumbnailUrl ? course.thumbnailUrl.trim() : null,
    }))
    .filter((course) => course.title.length > 0)

  if (fromCourses.length > 0) {
    return fromCourses
  }

  return (input.courseTitles ?? [])
    .map((title) => title.trim())
    .filter((title) => title.length > 0)
    .map((title) => ({ title, thumbnailUrl: null }))
}

async function sendWithResend(payload: ResendEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const responseText = await res.text()
    throw new Error(`Resend API failed: ${res.status} ${responseText}`)
  }
}

export async function sendCourseWelcomeEmail(input: CourseWelcomeEmailInput): Promise<void> {
  const from = process.env.COURSE_EMAIL_FROM || process.env.ANNOUNCEMENT_EMAIL_FROM || process.env.DONATION_EMAIL_FROM
  if (!from) {
    throw new Error("Course enrollment email sender is not configured")
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bsprep.in"
  const dashboardUrl = input.dashboardUrl || new URL("/dashboard", siteUrl).toString()
  const logoUrl = new URL("/new-logo-favicon.png", siteUrl).toString()
  const studentName = escapeHtml(input.studentName || "there")
  const studentEmail = escapeHtml(input.studentEmail)
  const normalizedCourses = normalizeCourses(input)
  const safeCourses = normalizedCourses.map((course) => ({
    title: escapeHtml(course.title),
    thumbnailUrl: course.thumbnailUrl ? escapeHtml(course.thumbnailUrl) : null,
  }))
  const courseTitles = safeCourses.map((course) => course.title)

  const mainCourseTitle = courseTitles[0] || "your course"
  const courseSummary = joinCourseTitles(courseTitles)
  const courseCardsHtml = safeCourses.length > 0
    ? `
        <div style="margin: 32px 0;">
          <p style="font-weight: 700; margin-bottom: 16px; font-size: 14px; color: #1C364A; text-transform: uppercase; letter-spacing: 1px;">Your Enrolled Courses:</p>
          ${safeCourses.map((course) => `
            <div style="margin-bottom: 16px; background: #FFFFFF; padding: 16px; border: 2px solid #1C364A;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  ${course.thumbnailUrl ? `<td width="100" valign="middle"><img src="${course.thumbnailUrl}" alt="${course.title}" width="84" style="border: 2px solid #1C364A; display: block;" /></td>` : ""}
                  <td valign="middle" style="padding-left: ${course.thumbnailUrl ? '16px' : '0'};">
                    <p style="margin: 0; font-weight: 700; font-size: 16px; color: #1C364A; text-transform: uppercase;">${course.title}</p>
                  </td>
                </tr>
              </table>
            </div>
          `).join("")}
        </div>
      `
    : ""

  await sendWithResend({
    from,
    to: [input.studentEmail],
    subject: courseTitles.length > 1
      ? "Your BSPrep enrollment is confirmed"
      : `Welcome to ${mainCourseTitle} at BSPrep`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Your BSPrep Course</title>
<!--[if mso]>
<style>
  body, table, td, h1, p, a {font-family: Arial, sans-serif !important;}
</style>
<![endif]-->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    background-color: #F6F4EE;
    color: #1C364A;
    font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #F6F4EE;
    padding: 40px 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #FFFFFF;
    border: 2px solid #1C364A;
  }
  .header {
    padding: 40px 20px;
    text-align: center;
    border-bottom: 2px solid #1C364A;
    background: #FFFFFF;
  }
  .content {
    padding: 50px 40px;
  }
  .hero-text {
    font-size: 52px;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 1;
    margin: 0 0 24px 0;
    letter-spacing: -2px;
    color: #1C364A;
  }
  .highlight {
    background-color: #1C364A;
    color: #F6F4EE;
    padding: 0 10px;
    display: inline-block;
    margin-top: 8px;
  }
  .p-text {
    font-size: 16px;
    line-height: 1.6;
    color: #3A4E5E;
    margin-bottom: 24px;
  }
  .strong-text {
    color: #1C364A;
    font-weight: 700;
  }
  .reply-box {
    background-color: #F6F4EE;
    border: 2px solid #1C364A;
    padding: 40px 30px;
    margin-top: 50px;
    text-align: left;
  }
  .reply-text {
    font-size: 24px;
    font-weight: 700;
    color: #1C364A;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: -1px;
  }
  .reply-subtext {
    font-size: 15px;
    color: #556B7D;
    margin: 0 0 30px 0;
    line-height: 1.5;
  }
  .btn {
    display: inline-block;
    background-color: #1C364A;
    color: #FFFFFF;
    text-decoration: none;
    padding: 18px 36px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    border: none;
    transition: background-color 0.2s;
  }
  .btn:hover {
    background-color: #122432;
  }
  .footer {
    padding: 40px;
    text-align: center;
    border-top: none;
    background-color: #1C364A;
  }
  .powered-by {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom: 12px;
  }
  .sponsors {
    font-size: 18px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: 1px;
  }
  
  @media screen and (max-width: 600px) {
    .content { padding: 30px 20px; }
    .hero-text { font-size: 40px; }
    .reply-box { padding: 30px 20px; }
  }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- HEADER -->
      <div class="header">
        <a href="${siteUrl}" style="display:inline-block; text-decoration:none;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td style="padding-right: 12px; vertical-align: middle;">
                <img src="${logoUrl}" alt="BSPrep Logo" width="45" style="display:block;">
              </td>
              <td style="vertical-align: middle; font-size: 26px; font-weight: 700; color: #1C364A; letter-spacing: -1px; text-transform: uppercase;">
                BS PREP
              </td>
            </tr>
          </table>
        </a>
      </div>
      
      <!-- CONTENT -->
      <div class="content">
        <h1 class="hero-text">YOUR JOURNEY <br><span class="highlight">STARTS</span> <br>NOW.</h1>
        
        <p class="p-text">
          Welcome, <span class="strong-text">${studentName}</span>! Payment successful. You are officially enrolled in <span class="strong-text">${courseSummary}</span>.
        </p>
        <p class="p-text">
          We are thrilled to have you on board. Prepare to dive into the curriculum, practice in our highly competitive arenas, and master the concepts you need to crush your exams.
        </p>

        ${courseCardsHtml}

        <!-- CTA BOX -->
        <div class="reply-box">
          <p class="reply-text">ACCESS UNLOCKED</p>
          <p class="reply-subtext">Your course is ready. Log in to your BSPrep dashboard right now to access all the materials and start learning immediately.</p>
          <a href="${dashboardUrl}" class="btn">GO TO COURSE</a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="powered-by">THE ULTIMATE PLATFORM FOR</div>
        <div class="sponsors" style="margin-bottom: 24px;">IIT MADRAS BS STUDENTS</div>
      </div>

    </div>
  </div>
</body>
</html>
    `,
  })
}