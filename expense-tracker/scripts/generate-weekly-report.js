#!/usr/bin/env node

/**
 * Weekly Development Report Generator
 * Automatically collects development metrics and generates a formatted report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn(`Warning: Command failed: ${command}`);
    return 'N/A';
  }
}

function getWeeklyGitStats() {
  const stats = {
    commits: executeCommand('git rev-list --count --since="1 week ago" HEAD'),
    additions: 0,
    deletions: 0,
    filesChanged: 0
  };

  try {
    const diffStats = executeCommand('git log --since="1 week ago" --stat --pretty=tformat: --numstat');
    const lines = diffStats.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const [added, deleted] = line.split('\t');
      if (!isNaN(parseInt(added))) stats.additions += parseInt(added);
      if (!isNaN(parseInt(deleted))) stats.deletions += parseInt(deleted);
      if (line.trim()) stats.filesChanged++;
    });
  } catch (error) {
    console.warn('Could not collect git diff stats');
  }

  return stats;
}

function getTestCoverage() {
  try {
    // Run tests with coverage and extract percentage
    const coverageOutput = executeCommand('npm run test:coverage -- --silent');
    const coverageMatch = coverageOutput.match(/All files\s+\|\s+([\d.]+)/);
    return coverageMatch ? `${coverageMatch[1]}%` : 'N/A';
  } catch (error) {
    return 'N/A';
  }
}

function getBuildMetrics() {
  try {
    const buildStart = Date.now();
    executeCommand('npm run build');
    const buildTime = Date.now() - buildStart;
    
    return {
      buildTime: `${(buildTime / 1000).toFixed(2)}s`,
      success: true
    };
  } catch (error) {
    return {
      buildTime: 'Failed',
      success: false
    };
  }
}

function generateReport() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const gitStats = getWeeklyGitStats();
  const testCoverage = getTestCoverage();
  const buildMetrics = getBuildMetrics();
  
  const currentBranch = executeCommand('git branch --show-current');
  const recentCommits = executeCommand('git log --oneline --since="1 week ago" -10');
  
  const report = `# Weekly Development Report

**Report Period**: ${weekAgo.toISOString().split('T')[0]} - ${now.toISOString().split('T')[0]}
**Generated**: ${now.toISOString()}
**Current Branch**: ${currentBranch}

## 📊 Development Metrics

- **Commits Made**: ${gitStats.commits}
- **Lines of Code Added**: ${gitStats.additions}
- **Lines of Code Removed**: ${gitStats.deletions}
- **Files Modified**: ${gitStats.filesChanged}
- **Net Lines of Code**: ${gitStats.additions - gitStats.deletions}
- **Test Coverage**: ${testCoverage}
- **Build Success**: ${buildMetrics.success ? '✅ Success' : '❌ Failed'}
- **Build Time**: ${buildMetrics.buildTime}

## 📝 Recent Commits

\`\`\`
${recentCommits || 'No commits in the last week'}
\`\`\`

## 🎯 Branch Status

\`\`\`bash
${executeCommand('git status --porcelain') || 'Working directory clean'}
\`\`\`

## 📈 Repository Health

- **Current Branch**: ${currentBranch}
- **Branch Tracking**: ${executeCommand('git branch -vv | grep "^\\*"')}
- **Untracked Files**: ${executeCommand('git ls-files --others --exclude-standard | wc -l')}
- **Modified Files**: ${executeCommand('git diff --name-only | wc -l')}

## 🧪 Testing Status

\`\`\`bash
${executeCommand('npm test -- --passWithNoTests --silent') || 'Tests not run'}
\`\`\`

## 📦 Package Status

- **Dependencies**: ${executeCommand('npm ls --depth=0 2>/dev/null | grep -c "├\\|└" || echo "N/A"')}
- **Outdated Packages**: ${executeCommand('npm outdated --depth=0 | wc -l')}
- **Security Audits**: ${executeCommand('npm audit --audit-level=moderate | grep "found" || echo "No issues found"')}

---

*Report generated automatically by generate-weekly-report.js*
*For manual metrics, please update the template sections above*
`;

  // Save report to file
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportFile = path.join(reportsDir, `weekly-report-${now.toISOString().split('T')[0]}.md`);
  fs.writeFileSync(reportFile, report);
  
  console.log('📊 Weekly Report Generated!');
  console.log(`📁 Report saved to: ${reportFile}`);
  console.log('\n' + report);
  
  return reportFile;
}

if (require.main === module) {
  generateReport();
}

module.exports = { generateReport };