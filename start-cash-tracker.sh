#!/bin/bash

# Daily Cash Flow Tracker - Startup Script for Mac/Linux
# This script starts the cash flow tracker on localhost

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}     Daily Cash Flow Tracker${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Starting local server..."
echo "This will open in your default browser"
echo ""
echo "Please wait while the server starts..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies... This may take a few minutes...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Failed to install dependencies!${NC}"
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo -e "${GREEN}Dependencies installed successfully!${NC}"
    echo ""
fi

# Start the development server
echo -e "${GREEN}Starting development server...${NC}"
echo "Server will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo -e "${BLUE}========================================${NC}"
echo ""

# Open browser after a short delay
(sleep 3 && open "http://localhost:3000") 2>/dev/null || (sleep 3 && xdg-open "http://localhost:3000") 2>/dev/null &

npm run dev