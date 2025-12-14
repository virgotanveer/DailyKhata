#!/bin/bash

# Create a distributable package of the Daily Cash Flow Tracker
echo "Creating Daily Cash Flow Tracker package..."

# Create package directory
PACKAGE_DIR="Daily-Cash-Flow-Tracker-$(date +%Y%m%d)"
mkdir -p "$PACKAGE_DIR"

# Copy essential files
echo "Copying application files..."
cp -r src/ "$PACKAGE_DIR/"
cp package.json "$PACKAGE_DIR/"
cp README.md "$PACKAGE_DIR/"
cp QUICK_START.md "$PACKAGE_DIR/"
cp start-cash-tracker.bat "$PACKAGE_DIR/"
cp start-cash-tracker.sh "$PACKAGE_DIR/"

# Create installation instructions
cat > "$PACKAGE_DIR/INSTALLATION.txt" << 'EOF'
Daily Cash Flow Tracker - Installation Instructions

============================================

QUICK START (Recommended):
1. Windows: Double-click "start-cash-tracker.bat"
2. Mac/Linux: Double-click "start-cash-tracker.sh"

MANUAL INSTALLATION:
1. Install Node.js from https://nodejs.org/
2. Open terminal/command prompt in this folder
3. Run: npm install
4. Run: npm run dev
5. Open browser to: http://localhost:3000

============================================

WHAT'S INCLUDED:
- Complete cash flow tracker application
- 1-click startup scripts
- All dependencies handled automatically
- Modern, user-friendly interface
- PKR currency support
- Export functionality (CSV/JSON)

============================================

FEATURES:
✓ Add Cash In entries (Cash/Online payments)
✓ Add Cash Out entries (Expenses)
✓ Real-time calculations
✓ Separate transaction history
✓ Download data as CSV or JSON
✓ Mobile responsive design
✓ Opening balance tracking
✓ Closing balance calculation

============================================

Enjoy your Daily Cash Flow Tracker!
EOF

# Create a zip file
echo "Creating package archive..."
zip -r "$PACKAGE_DIR.zip" "$PACKAGE_DIR"

# Clean up
rm -rf "$PACKAGE_DIR"

echo "Package created: $PACKAGE_DIR.zip"
echo "You can distribute this file to users!"