# Labia.AI - Diagrams Guide

## 📐 How to View and Edit Diagrams

This guide explains how to open and work with the Draw.io diagrams in this project.

---

## 📊 Available Diagrams

### 1. **UML Class Diagram** (`uml-diagram.drawio`)
Shows the object-oriented structure of the application.

**Contains**:
- Domain entities (User, Profile, Conversation, Message, Mission)
- Infrastructure services (LLM Providers, AI Service)
- Presentation layer (API Routers, Middleware)
- Relationships and dependencies

**Best for**: Understanding code structure and relationships

---

### 2. **System Architecture Diagram** (`architecture-diagram.drawio`)
Shows the complete system architecture with all layers.

**Contains**:
- Client Layer (Mobile, Web, Desktop apps)
- API Gateway Layer (FastAPI, Middleware)
- Application Layer (Endpoints, Services)
- Infrastructure Layer (LLM, Database, Cache, Monitoring)
- Deployment Layer (Docker, Kubernetes, AWS)

**Best for**: Understanding system design and deployment

---

## 🌐 Method 1: Online Viewer (Easiest)

### Step-by-step:

1. **Open your browser**
   - Go to: https://app.diagrams.net/

2. **Click "Open Existing Diagram"**
   - Or use the file menu: File → Open From → Device

3. **Select the diagram file**
   - Navigate to `docs/` folder
   - Choose either:
     - `uml-diagram.drawio`
     - `architecture-diagram.drawio`

4. **View the diagram**
   - Zoom in/out with mouse wheel or zoom controls
   - Pan by clicking and dragging
   - Click elements to see details

### ✅ Advantages:
- No installation required
- Works on any device with a browser
- Auto-saves to your device
- Free to use

### ❌ Disadvantages:
- Requires internet connection
- Files must be manually uploaded

---

## 💻 Method 2: Desktop App (Best for Editing)

### Installation:

#### **Windows**:
```bash
# Download from GitHub releases
https://github.com/jgraph/drawio-desktop/releases

# Or use Chocolatey
choco install drawio

# Or use Winget
winget install JGraph.Draw.io
```

#### **macOS**:
```bash
# Download from GitHub releases
https://github.com/jgraph/drawio-desktop/releases

# Or use Homebrew
brew install --cask drawio
```

#### **Linux**:
```bash
# Debian/Ubuntu
sudo snap install drawio

# Or download .deb/.rpm from
https://github.com/jgraph/drawio-desktop/releases
```

### Usage:

1. **Install the app** (see above)

2. **Open diagrams**:
   - File → Open
   - Navigate to `docs/`
   - Select `.drawio` file

3. **Edit diagrams**:
   - Click any element to edit
   - Drag to move
   - Right-click for more options
   - Use toolbar for shapes, connectors, text

4. **Save changes**:
   - File → Save
   - Or Ctrl+S (Cmd+S on Mac)

### ✅ Advantages:
- Works offline
- Faster performance
- Native file system integration
- Better for large diagrams
- Auto-save functionality

### ❌ Disadvantages:
- Requires installation
- Takes disk space (~200MB)

---

## 🔧 Method 3: VS Code Extension (Best for Developers)

### Installation:

1. **Open VS Code**

2. **Install Extension**:
   - Go to Extensions (Ctrl+Shift+X)
   - Search: "Draw.io Integration"
   - Install by: Henning Dieterichs
   - Or install from: https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio

3. **Open diagrams**:
   - Simply click on `.drawio` files in VS Code
   - Or right-click → "Open With" → "Draw.io Editor"

### ✅ Advantages:
- Integrates with your IDE
- No need to switch applications
- Works offline
- Git integration
- Side-by-side editing with code

### ❌ Disadvantages:
- Requires VS Code
- Less features than desktop app
- Can be slower with large diagrams

---

## 📝 Editing Diagrams

### Common Tasks:

#### **Add a new entity/component**:
1. Drag a shape from the left panel
2. Double-click to edit text
3. Right-click → "Edit Style" for colors

#### **Connect two elements**:
1. Click on first element
2. Click the blue arrow that appears
3. Drag to second element
4. Release to create connection

#### **Change colors (to match layer)**:
- Domain Layer (Yellow): `#fff2cc` (fill), `#d6b656` (stroke)
- Infrastructure (Green): `#d5e8d4` (fill), `#82b366` (stroke)
- Presentation (Red): `#f8cecc` (fill), `#b85450` (stroke)
- Client (Purple): `#e1d5e7` (fill), `#9673a6` (stroke)
- Implemented (Blue): `#dae8fc` (fill), `#6c8ebf` (stroke)
- Pending (Gray): `#f5f5f5` (fill), `#666666` (stroke)

#### **Add documentation**:
1. Right-click element
2. "Edit Data"
3. Add custom properties

#### **Export diagram**:
1. File → Export As
2. Choose format:
   - PNG (for documents)
   - SVG (for scaling)
   - PDF (for printing)
   - HTML (for web)

---

## 🎨 Diagram Conventions

### Shapes:

- **Rectangles**: Classes, Components, Services
- **Rounded Rectangles**: APIs, Endpoints
- **Cylinders**: Databases, Storage
- **Clouds**: External Services
- **Diamonds**: Decision Points

### Lines:

- **Solid line**: Active relationship/connection
- **Dashed line**: Future/pending relationship
- **Arrow**: Dependency direction
- **Diamond**: Composition/Aggregation

### Colors (UML Diagram):

- 🟨 **Yellow** = Domain Layer (Core business logic)
- 🟩 **Green** = Infrastructure Layer (External services)
- 🟥 **Red** = Presentation Layer (API, UI)

### Colors (Architecture Diagram):

- 🟦 **Blue** = Implemented component
- ⬜ **Gray (dashed)** = Pending/Future component
- 🟨 **Yellow** = API Gateway
- 🟩 **Green** = Application logic
- 🟥 **Red** = Infrastructure
- 🟪 **Purple** = Client applications

---

## 🔄 Keeping Diagrams Updated

### When to update UML diagram:

- ✅ Adding new entity classes
- ✅ Changing entity relationships
- ✅ Adding new services
- ✅ Modifying domain model
- ❌ Minor code changes
- ❌ Bug fixes

### When to update Architecture diagram:

- ✅ Adding new layer or component
- ✅ Changing infrastructure (DB, cache, etc.)
- ✅ Adding external service integration
- ✅ Deployment changes
- ❌ Internal refactoring
- ❌ UI changes only

### Update process:

1. **Open diagram** (using any method above)
2. **Make changes**
3. **Update status indicators** if applicable
4. **Save file**
5. **Commit to git** with message: `docs: update [diagram-name] - [reason]`
6. **Update this guide** if conventions change

---

## 📸 Exporting for Documentation

### For README files:

```bash
# Export as PNG (recommended)
File → Export As → PNG
- Zoom: 100%
- Border Width: 10px
- Background: White
- Save to: docs/images/
```

### For presentations:

```bash
# Export as PDF
File → Export As → PDF
- All pages
- Fit to page
```

### For web:

```bash
# Export as SVG (scalable)
File → Export As → SVG
- Embed images
- Include links
```

---

## 🆘 Troubleshooting

### Problem: "File won't open"

**Solution**:
- Ensure file extension is `.drawio`
- Try different method (online vs desktop)
- Check file is not corrupted (git pull again)

### Problem: "Diagram looks broken"

**Solution**:
- Clear browser cache (if online)
- Restart desktop app
- Re-download file from repository

### Problem: "Can't edit diagram"

**Solution**:
- Check file permissions
- Ensure you have write access
- Try saving a copy first

### Problem: "Colors are wrong"

**Solution**:
- Check color codes in "Edit Conventions" above
- Use color picker from existing elements
- Reset to default theme

---

## 📚 Additional Resources

### Official Documentation:
- Draw.io User Manual: https://www.drawio.com/doc/
- Video Tutorials: https://www.youtube.com/c/drawio

### UML Resources:
- UML Class Diagrams: https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-class-diagram-tutorial/
- UML Best Practices: https://www.uml-diagrams.org/

### Architecture Diagrams:
- C4 Model: https://c4model.com/
- Software Architecture Patterns: https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/

---

## 🎯 Quick Reference

| Task | Online | Desktop | VS Code |
|------|--------|---------|---------|
| View diagram | ✅ Best | ✅ Good | ✅ Good |
| Quick edits | ✅ Good | ✅ Best | ✅ Good |
| Offline work | ❌ No | ✅ Yes | ✅ Yes |
| Integration | ❌ No | ⚠️ Manual | ✅ Git |
| Export | ✅ Yes | ✅ Yes | ✅ Yes |
| Speed | ⚠️ Slow | ✅ Fast | ⚠️ Medium |

**Recommendation**:
- **For viewing**: Online method
- **For editing**: Desktop app
- **For developers**: VS Code extension

---

## 💡 Tips & Tricks

### Performance:

- Keep diagrams under 100 elements
- Use layers to organize complex diagrams
- Compress images before embedding
- Use simple shapes for better performance

### Organization:

- Group related elements (Ctrl+G)
- Use layers for different concerns
- Add notes for complex relationships
- Keep legend updated

### Collaboration:

- Export to PNG for reviews
- Use comments for feedback
- Version control with git
- Document major changes in commit messages

### Shortcuts:

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Save | Ctrl + S | Cmd + S |
| Undo | Ctrl + Z | Cmd + Z |
| Redo | Ctrl + Y | Cmd + Y |
| Copy | Ctrl + C | Cmd + C |
| Paste | Ctrl + V | Cmd + V |
| Delete | Delete | Delete |
| Zoom In | Ctrl + Mouse Wheel | Cmd + Mouse Wheel |
| Fit to Page | Ctrl + Shift + F | Cmd + Shift + F |

---

## 📧 Support

If you have issues with diagrams:

1. Check this guide first
2. Try different viewing method
3. Check Draw.io documentation
4. Ask in team chat
5. Create GitHub issue

---

**Last Updated**: 2025-10-18

**Maintained by**: Labia.AI Team

🇵🇷 **¡Wepa!**
