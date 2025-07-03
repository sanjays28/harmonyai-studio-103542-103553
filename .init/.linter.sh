#!/bin/bash
cd /home/kavia/workspace/code-generation/harmonyai-studio-103542-103553/music_assistant_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

