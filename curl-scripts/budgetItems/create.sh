#!/bin/bash

API="http://localhost:4741"
URL_PATH="/items"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "item": {
      "transaction": "'"${TRANS}"'",
      "description": "'"${DESC}"'",
      "date": "'"${DATE}"'",
      "amount": "'"${AMT}"'",
      "category": "'"${CAT}"'"
    }
  }'

echo
