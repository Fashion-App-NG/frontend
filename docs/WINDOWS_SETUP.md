# Windows Development Setup

## Cross-Platform UI Switching

The project now supports cross-platform UI switching that works on Windows, macOS, and Linux.

### Requirements

- Node.js (any recent version)
- Git for Windows (if using Git Bash)

### Usage

```bash
# Switch to Designer UI
npm run switch:designer

# Switch to AI UI  
npm run switch:ai

# Check current UI
npm run check:ui

# Start development with specific UI
npm run dev:designer
npm run dev:ai
```

### How It Works

1. **First tries**: Creating a symlink (fastest, best for development)
2. **Fallback**: Copies directory if symlinks fail (Windows without admin rights)
3. **Cross-platform**: Uses Node.js fs module (works everywhere)

### Troubleshooting

#### "Access Denied" on Windows
- Run Command Prompt as Administrator, OR
- Enable Developer Mode in Windows Settings

#### Symlinks Not Working
- The script automatically falls back to copying
- Everything will work, just slightly slower switching

#### Git Issues
- The `Auth` directory is git-ignored
- Only `Auth-AI/` and `Auth-Designer/` are tracked
- Use `npm run git:add-designer` for selective commits
```