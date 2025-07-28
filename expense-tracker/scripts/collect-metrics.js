#!/usr/bin/env node

/**
 * Development Metrics Collection Script
 * Collects various development metrics for analysis and reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

function collectCodeMetrics() {
  const srcPath = path.join(__dirname, '..', 'src');
  
  let totalFiles = 0;
  let totalLines = 0;
  let componentFiles = 0;
  let testFiles = 0;
  let utilityFiles = 0;

  function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDirectory(fullPath);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        totalFiles++;
        
        // Count lines
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;
        totalLines += lines;
        
        // Categorize files
        if (file.includes('.test.') || file.includes('.spec.')) {
          testFiles++;
        } else if (file.endsWith('.tsx')) {
          componentFiles++;
        } else if (file.includes('utils') || file.includes('lib')) {
          utilityFiles++;
        }
      }
    });
  }

  if (fs.existsSync(srcPath)) {
    walkDirectory(srcPath);
  }

  return {
    totalFiles,
    totalLines,
    componentFiles,
    testFiles,
    utilityFiles,
    averageLinesPerFile: Math.round(totalLines / totalFiles) || 0
  };
}

function collectGitMetrics() {
  return {
    totalCommits: executeCommand('git rev-list --count HEAD') || 0,
    contributors: executeCommand('git shortlog -sn | wc -l') || 0,
    currentBranch: executeCommand('git branch --show-current') || 'unknown',
    lastCommitDate: executeCommand('git log -1 --format=%ci') || 'unknown',
    repoSize: executeCommand('git count-objects -vH | grep "size-pack" | awk \'{print $2}\'') || 'unknown'
  };
}

function collectTestMetrics() {
  // Try to extract test results from last test run
  let testResults = {
    totalTests: 0,
    passingTests: 0,
    failingTests: 0,
    coverage: 'N/A'
  };

  try {
    const testOutput = executeCommand('npm test -- --passWithNoTests --silent');
    
    // Parse test results (basic parsing)
    const testMatch = testOutput.match(/Tests:\s+(\d+)\s+passed/);
    if (testMatch) {
      testResults.passingTests = parseInt(testMatch[1]);
      testResults.totalTests = testResults.passingTests;
    }
    
    // Try to get coverage
    const coverageOutput = executeCommand('npm run test:coverage -- --silent');
    const coverageMatch = coverageOutput.match(/All files\s+\|\s+([\d.]+)/);
    if (coverageMatch) {
      testResults.coverage = `${coverageMatch[1]}%`;
    }
  } catch (error) {
    console.warn('Could not collect test metrics');
  }

  return testResults;
}

function collectBuildMetrics() {
  let buildMetrics = {
    lastBuildStatus: 'unknown',
    buildTime: 'unknown',
    bundleSize: 'unknown'
  };

  try {
    const buildStart = Date.now();
    executeCommand('npm run build');
    const buildTime = Date.now() - buildStart;
    
    buildMetrics.lastBuildStatus = 'success';
    buildMetrics.buildTime = `${(buildTime / 1000).toFixed(2)}s`;
    
    // Try to get bundle size from .next directory
    const nextDir = path.join(__dirname, '..', '.next');
    if (fs.existsSync(nextDir)) {
      const buildManifest = path.join(nextDir, 'build-manifest.json');
      if (fs.existsSync(buildManifest)) {
        const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
        const pages = Object.keys(manifest.pages || {}).length;
        buildMetrics.bundleSize = `${pages} pages generated`;
      }
    }
  } catch (error) {
    buildMetrics.lastBuildStatus = 'failed';
  }

  return buildMetrics;
}

function collectDependencyMetrics() {
  let depMetrics = {
    totalDependencies: 0,
    devDependencies: 0,
    outdatedPackages: 0,
    securityIssues: 0
  };

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    depMetrics.totalDependencies = Object.keys(packageJson.dependencies || {}).length;
    depMetrics.devDependencies = Object.keys(packageJson.devDependencies || {}).length;
    
    // Check for outdated packages
    const outdatedResult = executeCommand('npm outdated --json');
    if (outdatedResult) {
      const outdated = JSON.parse(outdatedResult);
      depMetrics.outdatedPackages = Object.keys(outdated).length;
    }
    
    // Security audit
    const auditResult = executeCommand('npm audit --json');
    if (auditResult) {
      const audit = JSON.parse(auditResult);
      depMetrics.securityIssues = audit.metadata?.vulnerabilities?.total || 0;
    }
  } catch (error) {
    console.warn('Could not collect dependency metrics');
  }

  return depMetrics;
}

function generateMetricsReport() {
  console.log('🔄 Collecting development metrics...');
  
  const metrics = {
    timestamp: new Date().toISOString(),
    code: collectCodeMetrics(),
    git: collectGitMetrics(),
    tests: collectTestMetrics(),
    build: collectBuildMetrics(),
    dependencies: collectDependencyMetrics()
  };

  // Save metrics to file
  const metricsDir = path.join(__dirname, '..', 'reports', 'metrics');
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }
  
  const metricsFile = path.join(metricsDir, `metrics-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  
  // Generate human-readable report
  const report = `# Development Metrics Report

**Generated**: ${metrics.timestamp}

## 📊 Code Metrics
- **Total Files**: ${metrics.code.totalFiles}
- **Total Lines of Code**: ${metrics.code.totalLines}
- **Component Files**: ${metrics.code.componentFiles}
- **Test Files**: ${metrics.code.testFiles}
- **Utility Files**: ${metrics.code.utilityFiles}
- **Average Lines per File**: ${metrics.code.averageLinesPerFile}

## 🔄 Git Metrics
- **Total Commits**: ${metrics.git.totalCommits}
- **Contributors**: ${metrics.git.contributors}
- **Current Branch**: ${metrics.git.currentBranch}
- **Last Commit**: ${metrics.git.lastCommitDate}
- **Repository Size**: ${metrics.git.repoSize}

## 🧪 Test Metrics
- **Total Tests**: ${metrics.tests.totalTests}
- **Passing Tests**: ${metrics.tests.passingTests}
- **Failing Tests**: ${metrics.tests.failingTests}
- **Test Coverage**: ${metrics.tests.coverage}

## 🔨 Build Metrics
- **Last Build Status**: ${metrics.build.lastBuildStatus}
- **Build Time**: ${metrics.build.buildTime}
- **Bundle Size**: ${metrics.build.bundleSize}

## 📦 Dependency Metrics
- **Total Dependencies**: ${metrics.dependencies.totalDependencies}
- **Dev Dependencies**: ${metrics.dependencies.devDependencies}
- **Outdated Packages**: ${metrics.dependencies.outdatedPackages}
- **Security Issues**: ${metrics.dependencies.securityIssues}

---
*Metrics saved to: ${metricsFile}*
`;

  const reportFile = path.join(metricsDir, `metrics-report-${new Date().toISOString().split('T')[0]}.md`);
  fs.writeFileSync(reportFile, report);
  
  console.log('✅ Metrics collection complete!');
  console.log(`📁 Metrics saved to: ${metricsFile}`);
  console.log(`📄 Report saved to: ${reportFile}`);
  
  return { metrics, reportFile, metricsFile };
}

if (require.main === module) {
  generateMetricsReport();
}

module.exports = { generateMetricsReport, collectCodeMetrics, collectGitMetrics };