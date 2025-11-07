# Use official Apify SDK base image for Node.js
FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install NPM packages
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# Copy source code to the container
COPY . ./

# Run the actor
CMD npm start
