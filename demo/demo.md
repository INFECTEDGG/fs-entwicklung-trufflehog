mkdir ~/trufflehog-test
cd ~/trufflehog-test

mkdir config src
touch README.md
touch config/secrets.txt
touch src/app.py


nano config/secrets.txt

# DEMO DATA ONLY
HHN_SECRET=HHN-DEMO-SECRET-1234567890

trufflehog filesystem ~/trufflehog-test