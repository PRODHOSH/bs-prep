const fs = require('fs');

const publicCode = fs.readFileSync('app/courses/page.tsx', 'utf8');
const dashboardCode = fs.readFileSync('app/dashboard/courses/page.tsx', 'utf8');

const packageStartStr = '{/* Package deals */}';
const packageEndStr = '{/* Courses Grid */}';

const pStart = publicCode.indexOf(packageStartStr);
const pEnd = publicCode.indexOf('{/* Course grid */}'); // Note: 'Course grid' in public

let packagesUI = publicCode.substring(pStart, pEnd);

// Modify packagesUI to use Links or router push instead of setShowLogin
packagesUI = packagesUI.replace(/onClick=\{\(\) => setShowLogin\(true\)\}/g, '');
// Wrap the divs in Link
packagesUI = packagesUI.replace(
  /className="col-span-1 md:col-span-2 relative bg-\[\#0a192f\]/g, 
  'href="/payment?plan=qualifier-bundle" className="block col-span-1 md:col-span-2 relative bg-[#0a192f]'
);
packagesUI = packagesUI.replace(
  /className="col-span-1 relative bg-white ring-1 ring-black\/5/g, 
  'href="/payment?plan=coding-bundle" className="block col-span-1 relative bg-white ring-1 ring-black/5'
);
// Change the <div to <Link for those two blocks
packagesUI = packagesUI.replace(/<div\n *href="\/payment\?plan=qualifier/g, '<Link\n                  href="/payment?plan=qualifier');
packagesUI = packagesUI.replace(/<div\n *href="\/payment\?plan=coding/g, '<Link\n                  href="/payment?plan=coding');

// It's easier to just replace them directly in the string
packagesUI = packagesUI.replace(
  '<div\n                  \n                  className="block col-span-1 md:col-span-2 relative bg-[#0a192f] text-white p-8 md:p-10 rounded-3xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden"',
  '<Link\n                  href="/payment?plan=qualifier-bundle"\n                  className="block col-span-1 md:col-span-2 relative bg-[#0a192f] text-white p-8 md:p-10 rounded-3xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden"'
);

packagesUI = packagesUI.replace(
  '<div\n                  \n                  className="block col-span-1 relative bg-white ring-1 ring-black/5 p-8 md:p-10 rounded-3xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 shadow-xl"',
  '<Link\n                  href="/payment?plan=coding-bundle"\n                  className="block col-span-1 relative bg-white ring-1 ring-black/5 p-8 md:p-10 rounded-3xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 shadow-xl"'
);

packagesUI = packagesUI.replace(/<\/div>\n\n                <Link/g, '</Link>\n\n                <Link');
packagesUI = packagesUI.replace(/<\/div>\n              <\/div>\n            \)}/g, '</Link>\n              </div>\n            )}');


// Wait, since Dashboard activeTab must be "explore"
packagesUI = packagesUI.replace('{(selectedLevel === "all" || selectedLevel === "qualifier") && searchQuery === "" && (', '{activeTab === "explore" && (selectedLevel === "all" || selectedLevel === "qualifier") && searchQuery === "" && (');

const dStart = dashboardCode.indexOf(packageStartStr);
const dEnd = dashboardCode.indexOf('{/* Courses Grid */}');

if (dStart !== -1 && dEnd !== -1) {
  const newDashboardCode = dashboardCode.substring(0, dStart) + packagesUI + dashboardCode.substring(dEnd);
  fs.writeFileSync('app/dashboard/courses/page.tsx', newDashboardCode);
  console.log('Successfully updated bundles UI in dashboard.');
} else {
  console.log('Could not find replace targets in dashboard code.');
}
