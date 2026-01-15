# Troubleshooting Node.js Installation

## Step 1: Verify Homebrew is working

```bash
brew --version
```

If this doesn't work, run:
```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
brew --version
```

## Step 2: Check if Node.js is already installed but not in PATH

```bash
/opt/homebrew/bin/node --version
```

If this shows a version, Node.js is installed but not in your PATH.

## Step 3: Try installing Node.js again

```bash
brew install node
```

Watch for any error messages. If it says "already installed", that's fine.

## Step 4: Add Homebrew's bin directory to PATH (if not already done)

```bash
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Step 5: Verify Node.js is now accessible

```bash
node --version
npm --version
```

## Step 6: If still not working, try manual PATH fix

```bash
export PATH="/opt/homebrew/bin:$PATH"
node --version
npm --version
```

If this works, make it permanent:
```bash
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zprofile
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
```

## Alternative: Install Node.js using nvm (Node Version Manager)

If Homebrew installation continues to fail:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.zshrc

# Install latest LTS Node.js
nvm install --lts

# Use it
nvm use --lts

# Verify
node --version
npm --version
```

