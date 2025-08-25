#!/usr/bin/env node

/**
 * Bundle size analyzer for the technology management system
 * This script helps measure the impact of code splitting optimizations
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function analyzeDirectory(dirPath, pattern = /\.(js|jsx|ts|tsx)$/) {
  let totalSize = 0
  let fileCount = 0
  const files = []

  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath)
      } else if (stat.isFile() && pattern.test(item)) {
        const size = stat.size
        totalSize += size
        fileCount++
        files.push({
          path: path.relative(process.cwd(), fullPath),
          size,
          formattedSize: formatBytes(size)
        })
      }
    }
  }

  walkDir(dirPath)
  
  return {
    totalSize,
    fileCount,
    files: files.sort((a, b) => b.size - a.size),
    formattedTotalSize: formatBytes(totalSize)
  }
}

function analyzeTechnologiesModule() {
  const technologiesPath = path.join(__dirname, '../app/dashboard/technologies')
  
  if (!fs.existsSync(technologiesPath)) {
    log('❌ Technologies module not found', 'red')
    return
  }

  log('📊 Analyzing Technologies Module Bundle Size', 'cyan')
  log('=' .repeat(50), 'cyan')

  const analysis = analyzeDirectory(technologiesPath)
  
  log(`\n📁 Total Files: ${analysis.fileCount}`, 'blue')
  log(`📦 Total Size: ${analysis.formattedTotalSize}`, 'blue')
  
  // Categorize files
  const categories = {
    components: [],
    hooks: [],
    utils: [],
    types: [],
    tests: [],
    other: []
  }

  analysis.files.forEach(file => {
    if (file.path.includes('__tests__')) {
      categories.tests.push(file)
    } else if (file.path.includes('/hooks/')) {
      categories.hooks.push(file)
    } else if (file.path.includes('/components/')) {
      categories.components.push(file)
    } else if (file.path.includes('utils')) {
      categories.utils.push(file)
    } else if (file.path.includes('types')) {
      categories.types.push(file)
    } else {
      categories.other.push(file)
    }
  })

  // Display categorized results
  Object.entries(categories).forEach(([category, files]) => {
    if (files.length > 0) {
      const categorySize = files.reduce((sum, file) => sum + file.size, 0)
      log(`\n📂 ${category.toUpperCase()}:`, 'yellow')
      log(`   Size: ${formatBytes(categorySize)} (${files.length} files)`, 'yellow')
      
      // Show largest files in each category
      files.slice(0, 3).forEach(file => {
        log(`   • ${file.path} - ${file.formattedSize}`, 'reset')
      })
      
      if (files.length > 3) {
        log(`   ... and ${files.length - 3} more files`, 'reset')
      }
    }
  })

  // Identify optimization opportunities
  log('\n🎯 Optimization Opportunities:', 'magenta')
  
  const largeFiles = analysis.files.filter(file => file.size > 10000) // > 10KB
  if (largeFiles.length > 0) {
    log('   Large files that could benefit from code splitting:', 'magenta')
    largeFiles.slice(0, 5).forEach(file => {
      log(`   • ${file.path} - ${file.formattedSize}`, 'reset')
    })
  }

  // Check for potential lazy loading candidates
  const modalFiles = analysis.files.filter(file => 
    file.path.toLowerCase().includes('modal') || 
    file.path.toLowerCase().includes('dialog')
  )
  
  if (modalFiles.length > 0) {
    log('\n   Modal/Dialog components (good candidates for lazy loading):', 'magenta')
    modalFiles.forEach(file => {
      log(`   • ${file.path} - ${file.formattedSize}`, 'reset')
    })
  }

  return analysis
}

function generateReport() {
  const timestamp = new Date().toISOString()
  const analysis = analyzeTechnologiesModule()
  
  if (!analysis) return

  const report = {
    timestamp,
    totalSize: analysis.totalSize,
    formattedTotalSize: analysis.formattedTotalSize,
    fileCount: analysis.fileCount,
    files: analysis.files,
    recommendations: [
      'Consider lazy loading modal components',
      'Split large utility files into smaller modules',
      'Use dynamic imports for rarely used components',
      'Implement tree shaking for unused exports'
    ]
  }

  // Save report to file
  const reportPath = path.join(__dirname, '../bundle-analysis.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  log(`\n💾 Report saved to: ${reportPath}`, 'green')
  
  return report
}

function compareWithPrevious() {
  const reportPath = path.join(__dirname, '../bundle-analysis.json')
  const previousReportPath = path.join(__dirname, '../bundle-analysis-previous.json')
  
  if (fs.existsSync(reportPath) && fs.existsSync(previousReportPath)) {
    try {
      const current = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      const previous = JSON.parse(fs.readFileSync(previousReportPath, 'utf8'))
      
      const sizeDiff = current.totalSize - previous.totalSize
      const percentChange = ((sizeDiff / previous.totalSize) * 100).toFixed(2)
      
      log('\n📈 Comparison with Previous Analysis:', 'cyan')
      log(`   Previous: ${previous.formattedTotalSize}`, 'reset')
      log(`   Current:  ${current.formattedTotalSize}`, 'reset')
      
      if (sizeDiff > 0) {
        log(`   Change:   +${formatBytes(sizeDiff)} (+${percentChange}%)`, 'red')
      } else if (sizeDiff < 0) {
        log(`   Change:   ${formatBytes(sizeDiff)} (${percentChange}%)`, 'green')
      } else {
        log(`   Change:   No change`, 'yellow')
      }
      
    } catch (error) {
      log('⚠️  Could not compare with previous report', 'yellow')
    }
  }
}

function main() {
  log('🚀 Bundle Size Analyzer', 'bright')
  log('Analyzing technology management system...', 'reset')
  
  // Backup previous report if it exists
  const reportPath = path.join(__dirname, '../bundle-analysis.json')
  const previousReportPath = path.join(__dirname, '../bundle-analysis-previous.json')
  
  if (fs.existsSync(reportPath)) {
    fs.copyFileSync(reportPath, previousReportPath)
  }
  
  // Generate new report
  generateReport()
  
  // Compare with previous
  compareWithPrevious()
  
  log('\n✅ Analysis complete!', 'green')
  log('\nNext steps:', 'bright')
  log('1. Review large files for code splitting opportunities', 'reset')
  log('2. Implement lazy loading for modal components', 'reset')
  log('3. Use dynamic imports for rarely used features', 'reset')
  log('4. Run this script again after optimizations to measure improvements', 'reset')
}

// Run the analyzer
if (require.main === module) {
  main()
}

module.exports = {
  analyzeTechnologiesModule,
  generateReport,
  compareWithPrevious,
  formatBytes
}
