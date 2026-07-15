#!/usr/bin/env bash
# Publish a post to X and LinkedIn immediately.
# Replace the account IDs with real ones from `posteahora accounts`.
set -euo pipefail

posteahora post "We just shipped something new 🚀 Check it out." \
  --to twitter:REPLACE_X_ID \
  --to linkedin:REPLACE_LINKEDIN_ID \
  --hashtags launch,product
