#!/bin/bash
set -euo pipefail
BASE='http://localhost:5000'
USERNAME="student$(date +%s)"
PASSWORD='PlantReview2026!'
COOKIE_JAR='.book-review-cookies'

record() {
  local file="$1"
  shift
  {
    printf '$'
    printf ' %q' "$@"
    printf '\n'
    "$@"
  } > "$file" 2>&1
}

record getallbooks curl -sS "$BASE/"
record getbooksbyISBN curl -sS "$BASE/isbn/1"
record getbooksbyauthor curl -sS "$BASE/author/Chinua%20Achebe"
record getbooksbytitle curl -sS "$BASE/title/Things%20Fall%20Apart"
record getbookreview curl -sS "$BASE/review/1"
record register curl -sS -X POST "$BASE/register" -H 'Content-Type: application/json' -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"
record login curl -sS -c "$COOKIE_JAR" -X POST "$BASE/customer/login" -H 'Content-Type: application/json' -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"
record reviewadded curl -sS -b "$COOKIE_JAR" -X PUT "$BASE/customer/auth/review/1" -H 'Content-Type: application/json' -d '{"review":"A thoughtful classic with memorable characters."}'
record deletereview curl -sS -b "$COOKIE_JAR" -X DELETE "$BASE/customer/auth/review/1"
rm -f "$COOKIE_JAR"
printf 'Saved: getallbooks getbooksbyISBN getbooksbyauthor getbooksbytitle getbookreview register login reviewadded deletereview\n'
printf 'Registered test username: %s\n' "$USERNAME"
