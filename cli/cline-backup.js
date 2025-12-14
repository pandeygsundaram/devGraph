#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CLINE_DATA_DIR = path.join(
  os.homedir(),
  '.config/Code/User/globalStorage/saoudrizwan.claude-dev/tasks'
);
const STATE_FILE = '.cline-backup-state.json';
const DEFAULT_OUTPUT_DIR = './cline-backups';

// Parse command line arguments
const args = process.argv.slice(2);
const forceBackup = args.includes('--force');
const outputDirIndex = args.indexOf('--output');
const OUTPUT_DIR = outputDirIndex >= 0 && args[outputDirIndex + 1] 
  ? args[outputDirIndex + 1] 
  : DEFAULT_OUTPUT_DIR;

// Utility functions
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading state file:', error.message);
  }
  return { backedUpTasks: [], lastBackupTimestamp: null };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function getBackupFilename() {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '-');
  return timestamp;
}

function formatMessageForMarkdown(msg) {
  const timestamp = formatTimestamp(msg.ts);
  let content = '';
  
  switch (msg.say) {
    case 'text':
      content = `**User**: ${msg.text}`;
      break;
    case 'user_feedback':
      content = `**User Feedback**: ${msg.text}`;
      break;
    case 'completion_result':
      content = `**Assistant**: ${msg.text}`;
      break;
    case 'reasoning':
      content = `**Assistant Reasoning**: ${msg.text}`;
      break;
    case 'api_req_started':
      content = '**[API Request Started]**';
      break;
    case 'checkpoint_created':
      content = '**[Checkpoint Created]**';
      break;
    default:
      if (msg.type === 'ask') {
        content = `**[System Ask]: ${msg.ask}**`;
      } else if (msg.text) {
        content = msg.text;
      }
  }
  
  return content ? `[${timestamp}] ${content}\n\n` : '';
}

function readTaskData(taskPath) {
  const data = {
    metadata: null,
    uiMessages: null,
    apiHistory: null
  };
  
  try {
    const metadataPath = path.join(taskPath, 'task_metadata.json');
    if (fs.existsSync(metadataPath)) {
      data.metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading metadata: ${error.message}`);
  }
  
  try {
    const uiMessagesPath = path.join(taskPath, 'ui_messages.json');
    if (fs.existsSync(uiMessagesPath)) {
      data.uiMessages = JSON.parse(fs.readFileSync(uiMessagesPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading ui_messages: ${error.message}`);
  }
  
  try {
    const apiHistoryPath = path.join(taskPath, 'api_conversation_history.json');
    if (fs.existsSync(apiHistoryPath)) {
      data.apiHistory = JSON.parse(fs.readFileSync(apiHistoryPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading api_conversation_history: ${error.message}`);
  }
  
  return data;
}

function generateMarkdown(tasks) {
  let markdown = '# Cline Chat Backup\n\n';
  markdown += `Backup Date: ${new Date().toLocaleString()}\n\n`;
  markdown += `Total Tasks: ${tasks.length}\n\n`;
  markdown += '---\n\n';
  
  for (const task of tasks) {
    markdown += `## Task: ${task.taskId}\n\n`;
    markdown += `**Started**: ${formatTimestamp(parseInt(task.taskId))}\n\n`;
    
    if (task.data.metadata) {
      const model = task.data.metadata.model_usage?.[0];
      if (model) {
        markdown += `**Model**: ${model.model_id} (${model.mode} mode)\n\n`;
      }
    }
    
    markdown += '### Conversation\n\n';
    
    if (task.data.uiMessages && Array.isArray(task.data.uiMessages)) {
      for (const msg of task.data.uiMessages) {
        const formatted = formatMessageForMarkdown(msg);
        if (formatted) {
          markdown += formatted;
        }
      }
    } else {
      markdown += '*No messages found*\n\n';
    }
    
    markdown += '\n---\n\n';
  }
  
  return markdown;
}

async function main() {
  console.log('🔍 Cline Chat Backup Tool\n');
  
  // Check if Cline data directory exists
  if (!fs.existsSync(CLINE_DATA_DIR)) {
    console.error(`❌ Error: Cline data directory not found at: ${CLINE_DATA_DIR}`);
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  }
  
  // Load state
  const state = forceBackup ? { backedUpTasks: [], lastBackupTimestamp: null } : loadState();
  console.log(`📋 Previously backed up tasks: ${state.backedUpTasks.length}`);
  
  // Get all task directories
  const taskDirs = fs.readdirSync(CLINE_DATA_DIR)
    .filter(name => {
      const fullPath = path.join(CLINE_DATA_DIR, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();
  
  console.log(`📂 Total tasks found: ${taskDirs.length}`);
  
  // Filter new tasks
  const newTasks = forceBackup 
    ? taskDirs 
    : taskDirs.filter(taskId => !state.backedUpTasks.includes(taskId));
  
  if (newTasks.length === 0) {
    console.log('✅ No new tasks to backup. All caught up!');
    return;
  }
  
  console.log(`✨ New tasks to backup: ${newTasks.length}\n`);
  
  // Process tasks
  const tasksData = [];
  for (const taskId of newTasks) {
    console.log(`Processing task: ${taskId}...`);
    const taskPath = path.join(CLINE_DATA_DIR, taskId);
    const data = readTaskData(taskPath);
    tasksData.push({ taskId, data });
  }
  
  // Generate backup files
  const backupFilename = getBackupFilename();
  
  // JSON backup
  const jsonPath = path.join(OUTPUT_DIR, `cline-backup-${backupFilename}.json`);
  const jsonData = {
    backupDate: new Date().toISOString(),
    totalTasks: tasksData.length,
    tasks: tasksData
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
  console.log(`\n💾 JSON backup saved: ${jsonPath}`);
  
  // Markdown backup
  const mdPath = path.join(OUTPUT_DIR, `cline-backup-${backupFilename}.md`);
  const markdown = generateMarkdown(tasksData);
  fs.writeFileSync(mdPath, markdown);
  console.log(`📄 Markdown backup saved: ${mdPath}`);
  
  // Update state
  state.backedUpTasks.push(...newTasks);
  state.lastBackupTimestamp = Date.now();
  saveState(state);
  
  console.log(`\n✅ Backup complete! Backed up ${newTasks.length} task(s).`);
  console.log(`📊 Total tasks tracked: ${state.backedUpTasks.length}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});