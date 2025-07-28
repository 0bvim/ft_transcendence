#!/bin/bash

# ELK Stack User Setup Script with Fixed Passwords
# This script sets up Elasticsearch built-in users with predefined passwords from environment variables
# Usage: ./setup-elk-users.sh

set -e

echo "🔐 Setting up ELK Stack built-in users with fixed passwords..."

# Load environment variables
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env..."
    # Export variables from .env file, compatible with macOS
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            export "$line"
        fi
    done < .env
    echo "✅ Loaded environment variables from .env"
else
    echo "❌ .env file not found. Please create it from env.example"
    exit 1
fi

# Check if Elasticsearch is running
echo "🔍 Checking Elasticsearch availability..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -k -s https://localhost:9200 > /dev/null 2>&1; then
        echo "✅ Elasticsearch is running"
        break
    else
        echo "⏳ Waiting for Elasticsearch... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Elasticsearch is not responding after $max_attempts attempts"
    exit 1
fi

# Function to set user password
set_user_password() {
    local username=$1
    local password=$2
    
    echo "🔑 Setting password for user: $username"
    
    # Use the elastic user to set other user passwords
    response=$(curl -k -s -w "%{http_code}" -o /tmp/password_response.txt \
        -X POST "https://localhost:9200/_security/user/$username/_password" \
        -u "elastic:${CURRENT_ELASTIC_PASSWORD}" \
        -H "Content-Type: application/json" \
        -d "{\"password\":\"$password\"}")
    
    if [ "$response" = "200" ]; then
        echo "✅ Password set successfully for $username"
    else
        echo "⚠️  Response code $response for $username. Response:"
        cat /tmp/password_response.txt
        echo ""
    fi
}

# Function to determine the current elastic password and update if needed
setup_elastic_password() {
    echo "🔍 Determining current elastic user password..."
    
    # Try to authenticate with the desired password first
    auth_test_result=$(curl -k -s -w "%{http_code}" -o /tmp/auth_test.txt -u "elastic:${ELASTIC_PASSWORD}" https://localhost:9200/_security/user/elastic)
    
    if [ "$auth_test_result" = "200" ]; then
        echo "✅ Elastic user already has the desired password"
        CURRENT_ELASTIC_PASSWORD="${ELASTIC_PASSWORD}"
        return 0
    # Try with the previously auto-generated password
    else
        # Try with the previously auto-generated password
        auth_test_result2=$(curl -k -s -w "%{http_code}" -o /tmp/auth_test2.txt -u "elastic:GQOIsT5kFjbHDaZP1bTO" https://localhost:9200/_security/user/elastic)
    fi
    
    if [ "$auth_test_result2" = "200" ]; then
        echo "🔧 Found elastic user with auto-generated password, updating to fixed password"
        CURRENT_ELASTIC_PASSWORD="GQOIsT5kFjbHDaZP1bTO"
        
        # Update elastic password to the desired one
        response=$(curl -k -s -w "%{http_code}" -o /tmp/elastic_password_update.txt \
            -X POST "https://localhost:9200/_security/user/elastic/_password" \
            -u "elastic:${CURRENT_ELASTIC_PASSWORD}" \
            -H "Content-Type: application/json" \
            -d "{\"password\":\"${ELASTIC_PASSWORD}\"}")
        
        if [ "$response" = "200" ]; then
            echo "✅ Successfully updated elastic password to fixed password"
            CURRENT_ELASTIC_PASSWORD="${ELASTIC_PASSWORD}"
        else
            echo "❌ Failed to update elastic password. Response code: $response"
            cat /tmp/elastic_password_update.txt
            echo "⚠️ Continuing with current password for other users"
        fi
        return 0
    else
        echo "❌ Unable to authenticate with elastic user using known passwords"
        echo "Please check if Elasticsearch is properly initialized"
        return 1
    fi
}

# Set up the elastic user password (handles transition from auto-generated to fixed)
if ! setup_elastic_password; then
    echo "❌ Failed to set up elastic user password"
    exit 1
fi

# Set passwords for all built-in users
echo "🔐 Setting up all built-in user passwords..."

set_user_password "kibana_system" "${KIBANA_SYSTEM_PASSWORD}"
set_user_password "logstash_system" "${LOGSTASH_SYSTEM_PASSWORD}"
set_user_password "beats_system" "${BEATS_SYSTEM_PASSWORD}"
set_user_password "apm_system" "${APM_SYSTEM_PASSWORD}"
set_user_password "remote_monitoring_user" "${REMOTE_MONITORING_USER_PASSWORD}"

# Verify the setup
echo "🧪 Verifying user authentication..."

verify_user() {
    local username=$1
    local password=$2
    
    if curl -k -s -u "$username:$password" https://localhost:9200/_security/user/$username > /dev/null 2>&1; then
        echo "✅ $username authentication verified"
    else
        echo "❌ $username authentication failed"
    fi
}

verify_user "elastic" "${ELASTIC_PASSWORD}"
verify_user "kibana_system" "${KIBANA_SYSTEM_PASSWORD}"
verify_user "logstash_system" "${LOGSTASH_SYSTEM_PASSWORD}"

echo ""
echo "🎉 ELK Stack user setup completed!"
echo "📋 Summary:"
echo "   - elastic: ${ELASTIC_PASSWORD}"
echo "   - kibana_system: ${KIBANA_SYSTEM_PASSWORD}"
echo "   - logstash_system: ${LOGSTASH_SYSTEM_PASSWORD}"
echo "   - beats_system: ${BEATS_SYSTEM_PASSWORD}"
echo "   - apm_system: ${APM_SYSTEM_PASSWORD}"
echo "   - remote_monitoring_user: ${REMOTE_MONITORING_USER_PASSWORD}"
echo ""
echo "💡 These passwords are now fixed and will remain consistent across rebuilds!"

# Cleanup
rm -f /tmp/password_response.txt
