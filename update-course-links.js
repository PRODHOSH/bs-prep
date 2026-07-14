const fs = require('fs');

let code = fs.readFileSync('app/dashboard/courses/page.tsx', 'utf8');

// Update course card link
// Original: href={isEnrolled || course.type === "free" ? `/dashboard/courses/${course.id}` : `/payment?course=${course.id}`}
code = code.replace(
  /href=\{isEnrolled \|\| course\.type === "free" \? `\/dashboard\/courses\/\$\{course\.id\}` : `\/payment\?course=\$\{course\.id\}`\}/g,
  'href={`/dashboard/courses/${course.id}`}'
);

// We need to also update the bundle Links. Let's see how the bundles are linking.
// Looking at the view_file from earlier, the bundles had a Next.js Link like:
// href="/payment?plan=qualifier-bundle" or something similar.
// Wait, the user specifically mentioned courses. We can route bundle clicks to a new /dashboard/bundles/qualifier-bundle or just leave them. The user said "on clicking each card it shd go to its corresponding course page man create for all of em and then after clicking enroll in ther it shd go to payment page"
// Let's replace href="/payment?plan=qualifier-bundle" to href="/dashboard/bundles/qualifier-bundle" if it exists, or maybe the user just meant course cards.
// I will check the file contents first to be safe.

fs.writeFileSync('app/dashboard/courses/page.tsx', code);
console.log('Updated app/dashboard/courses/page.tsx');
