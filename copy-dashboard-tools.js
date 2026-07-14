const fs = require('fs');

function copyToDashboard(sourcePath, destPath, componentName) {
  if (!fs.existsSync(sourcePath)) return;
  let code = fs.readFileSync(sourcePath, 'utf8');
  
  // Remove Navbar and Footer imports and components
  code = code.replace(/import \{ Navbar \} from "\@\/components\/navbar"[\r\n]*/g, '');
  code = code.replace(/import \{ Footer \} from "\@\/components\/footer"[\r\n]*/g, '');
  code = code.replace(/<Navbar[^>]*>[\r\n]*/g, '');
  code = code.replace(/<Footer[^>]*>[\r\n]*/g, '');
  
  // Update the root wrapper class
  code = code.replace(/className="min-h-screen flex flex-col"/g, 'className="flex-1 flex flex-col"');
  
  // Rename component
  code = code.replace(/export default function \w+\(\) \{/g, `export default function ${componentName}() {`);
  
  const dir = destPath.substring(0, destPath.lastIndexOf('/'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(destPath, code);
  console.log(`Created ${destPath}`);
}

copyToDashboard('app/resources/page.tsx', 'app/dashboard/resources/page.tsx', 'DashboardResourcesPage');
copyToDashboard('app/tools/gpa-calculator/page.tsx', 'app/dashboard/tools/gpa-calculator/page.tsx', 'DashboardGPACalculatorPage');
copyToDashboard('app/tools/gpa-predictor/page.tsx', 'app/dashboard/tools/gpa-predictor/page.tsx', 'DashboardGPAPredictorPage');
