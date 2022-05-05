set -e

echo "Building the website..."

ls -l

bundle exec jekyll build -d _site

ls -l

echo "Done!"
