#!/bin/bash
cd "$(dirname "$0")"
echo "=================================================="
echo "    Starting Committee Fund & Payment Tracker     "
echo "=================================================="
echo ""
echo "Opening app in your browser at http://localhost:3000 ..."
echo ""
open http://localhost:3000
npm run dev
