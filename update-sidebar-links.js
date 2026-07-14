const fs = require('fs');

let code = fs.readFileSync('components/sidebar.tsx', 'utf8');

// Update SIDEBAR_LINKS
code = code.replace(
  '{ name: "RESOURCES", href: "/resources", icon: Library },',
  '{ name: "RESOURCES", href: "/dashboard/resources", icon: Library },'
);

// Update TOOLS_LINKS
code = code.replace(
  '{ name: "GPA CALCULATOR", href: "/tools/gpa-calculator", icon: Calculator },',
  '{ name: "GPA CALCULATOR", href: "/dashboard/tools/gpa-calculator", icon: Calculator },'
);
code = code.replace(
  '{ name: "GPA PREDICTOR", href: "/tools/gpa-predictor", icon: LineChart },',
  '{ name: "GPA PREDICTOR", href: "/dashboard/tools/gpa-predictor", icon: LineChart },'
);

// Convert Notifications button to Link
const btnStr = `<button
              onClick={() => handleNotifOpen(true)}
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors text-black/60 hover:text-black hover:bg-black/5"
            >`;
const linkStr = `<Link
              href="/dashboard/notifications"
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors text-black/60 hover:text-black hover:bg-black/5"
            >`;
code = code.replace(btnStr, linkStr);

// Also we need to change </button> to </Link> for the notifications button.
// We can find the block by searching for the badge span
const badgeBlock = `{unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>`;
const newBadgeBlock = `{unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>`;
code = code.replace(badgeBlock, newBadgeBlock);

// Remove the entire DropdownMenu for notifications
const dropdownStart = '{/* Auth Modals and Dropdown Data for Notifs overlay */}';
const dropdownStartActual = '<DropdownMenu open={notifOpen} onOpenChange={handleNotifOpen}>';
const dropdownEnd = '</DropdownMenu>';
const pStart = code.indexOf(dropdownStartActual);
const pEnd = code.indexOf(dropdownEnd, pStart);

if (pStart !== -1 && pEnd !== -1) {
  code = code.substring(0, pStart) + code.substring(pEnd + dropdownEnd.length);
}

fs.writeFileSync('components/sidebar.tsx', code);
console.log('Updated components/sidebar.tsx');
