/**
 * Security Implementation Test Suite
 * Run this file to verify all security measures are working
 * 
 * Usage: npm run test:security
 */

// Simple CommonJS version for Node.js
const { validateAndSanitizeInput, validateEmail, validateUrl, validateUsername, validateUUID } = require('../lib/security/validation')

console.log('🔒 Testing Security Implementation...\n')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    const result = fn()
    if (result) {
      console.log(`✅ ${name}`)
      passed++
    } else {
      console.log(`❌ ${name}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`)
    failed++
  }
}

console.log('📋 Testing Input Validation...\n')

// Email Validation
test('Valid email accepted', () => validateEmail('test@example.com'))
test('Invalid email rejected', () => !validateEmail('invalid-email'))
test('Too long email rejected', () => !validateEmail('a'.repeat(300) + '@example.com'))

// URL Validation
test('Valid HTTPS URL accepted', () => validateUrl('https://example.com'))
test('Valid HTTP URL accepted', () => validateUrl('http://example.com'))
test('Invalid URL rejected', () => !validateUrl('not-a-url'))
test('Invalid protocol rejected', () => !validateUrl('javascript:alert(1)'))
test('FTP protocol rejected', () => !validateUrl('ftp://example.com'))

// Username Validation
test('Valid username accepted', () => validateUsername('user123'))
test('Username with hyphen accepted', () => validateUsername('user-name'))
test('Username with underscore accepted', () => validateUsername('user_name'))
test('Too short username rejected', () => !validateUsername('ab'))
test('Too long username rejected', () => !validateUsername('a'.repeat(31)))
test('Special characters rejected', () => !validateUsername('user@name'))

// UUID Validation
test('Valid UUID accepted', () => validateUUID('550e8400-e29b-41d4-a716-446655440000'))
test('Invalid UUID rejected', () => !validateUUID('not-a-uuid'))
test('Empty UUID rejected', () => !validateUUID(''))

console.log('\n🛡️ Testing XSS Protection...\n')

// XSS Detection
test('Script tag detected', () => {
  const result = validateAndSanitizeInput('<script>alert(1)</script>')
  return !result.valid && result.errors.some(e => e.includes('XSS'))
})

test('JavaScript protocol detected', () => {
  const result = validateAndSanitizeInput('javascript:alert(1)')
  return !result.valid && result.errors.some(e => e.includes('XSS'))
})

test('Event handler detected', () => {
  const result = validateAndSanitizeInput('<img onerror="alert(1)">')
  return !result.valid && result.errors.some(e => e.includes('XSS'))
})

console.log('\n💉 Testing SQL Injection Protection...\n')

// SQL Injection Detection
test('SELECT statement detected', () => {
  const result = validateAndSanitizeInput("'; SELECT * FROM users; --")
  return !result.valid && result.errors.some(e => e.includes('SQL'))
})

test('DROP statement detected', () => {
  const result = validateAndSanitizeInput('DROP TABLE users')
  return !result.valid && result.errors.some(e => e.includes('SQL'))
})

test('UNION statement detected', () => {
  const result = validateAndSanitizeInput("1' UNION SELECT password FROM users--")
  return !result.valid && result.errors.some(e => e.includes('SQL'))
})

console.log('\n🧹 Testing Sanitization...\n')

test('Clean text passes validation', () => {
  const result = validateAndSanitizeInput('This is clean text')
  return result.valid && result.sanitized === 'This is clean text'
})

test('Text length limited', () => {
  const result = validateAndSanitizeInput('a'.repeat(2000), 100)
  return result.sanitized.length === 100
})

test('Whitespace trimmed', () => {
  const result = validateAndSanitizeInput('  trimmed  ')
  return result.sanitized === 'trimmed'
})

console.log('\n📊 Test Results\n')
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`)

if (failed === 0) {
  console.log('🎉 All security tests passed! Your implementation is working correctly.\n')
  console.log('Next steps:')
  console.log('1. Run scripts/security_policies.sql in Supabase')
  console.log('2. Test rate limiting by making many requests')
  console.log('3. Check security headers in browser DevTools')
  console.log('4. Review docs/SECURITY_CHECKLIST.md before deployment\n')
} else {
  console.log('⚠️ Some tests failed. Please review the implementation.\n')
  process.exit(1)
}

console.log('🔒 Security test complete!')

