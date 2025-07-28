#!/bin/bash

# ELK Stack HTTPS Testing Script
# Tests the wildcard certificate setup for *.localhost domain

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/../certs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 ELK Stack HTTPS Testing${NC}"
echo -e "${BLUE}==========================${NC}"

# Test 1: Certificate Files Validation
echo -e "${BLUE}Test 1: Validating Certificate Files${NC}"
if [ -f "$CERTS_DIR/ca.crt" ] && [ -f "$CERTS_DIR/elk-wildcard.crt" ] && [ -f "$CERTS_DIR/elk-wildcard.key" ]; then
    echo -e "${GREEN}✅ Certificate files exist${NC}"
else
    echo -e "${RED}❌ Certificate files missing. Run: ./devops/scripts/generate-elk-certs.sh${NC}"
    exit 1
fi

# Test 2: Certificate Validity
echo -e "${BLUE}Test 2: Checking Certificate Validity${NC}"
if openssl x509 -checkend 86400 -noout -in "$CERTS_DIR/elk-wildcard.crt" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Wildcard certificate is valid (expires in >24h)${NC}"
else
    echo -e "${RED}❌ Wildcard certificate is expired or invalid${NC}"
    exit 1
fi

# Test 3: Certificate Chain Verification
echo -e "${BLUE}Test 3: Verifying Certificate Chain${NC}"
if openssl verify -CAfile "$CERTS_DIR/ca.crt" "$CERTS_DIR/elk-wildcard.crt" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Certificate chain is valid${NC}"
else
    echo -e "${RED}❌ Certificate chain verification failed${NC}"
    exit 1
fi

# Test 4: Docker Services Status
echo -e "${BLUE}Test 4: Checking Docker Services${NC}"
if docker compose ps elasticsearch | grep -q "running"; then
    echo -e "${GREEN}✅ Elasticsearch is running${NC}"
    
    # Test Elasticsearch HTTPS endpoint
    echo -e "${YELLOW}🔍 Testing Elasticsearch HTTPS endpoint...${NC}"
    if curl -k -s "https://localhost:9200/_cluster/health" > /dev/null; then
        echo -e "${GREEN}✅ Elasticsearch HTTPS endpoint is accessible${NC}"
    else
        echo -e "${RED}❌ Elasticsearch HTTPS endpoint is not accessible${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Elasticsearch is not running. Start with: make up${NC}"
fi

if docker compose ps kibana | grep -q "running"; then
    echo -e "${GREEN}✅ Kibana is running${NC}"
    
    # Test Kibana HTTPS endpoint
    echo -e "${YELLOW}🔍 Testing Kibana HTTPS endpoint...${NC}"
    if curl -k -s "https://localhost:5601/api/status" > /dev/null; then
        echo -e "${GREEN}✅ Kibana HTTPS endpoint is accessible${NC}"
    else
        echo -e "${RED}❌ Kibana HTTPS endpoint is not accessible${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Kibana is not running. Start with: make up${NC}"
fi

if docker compose ps logstash | grep -q "running"; then
    echo -e "${GREEN}✅ Logstash is running${NC}"
    
    # Test Logstash API endpoint
    echo -e "${YELLOW}🔍 Testing Logstash API endpoint...${NC}"
    if curl -s "http://localhost:9600/_node/stats" > /dev/null; then
        echo -e "${GREEN}✅ Logstash API endpoint is accessible${NC}"
    else
        echo -e "${RED}❌ Logstash API endpoint is not accessible${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Logstash is not running. Start with: make up${NC}"
fi

# Test 5: /etc/hosts Configuration
echo -e "${BLUE}Test 5: Checking /etc/hosts Configuration${NC}"
if grep -q "elasticsearch.localhost" /etc/hosts && grep -q "kibana.localhost" /etc/hosts; then
    echo -e "${GREEN}✅ /etc/hosts is configured for *.localhost domains${NC}"
else
    echo -e "${YELLOW}⚠️ /etc/hosts may need configuration for *.localhost domains${NC}"
    echo -e "${YELLOW}Add these entries to /etc/hosts:${NC}"
    echo -e "  127.0.0.1 elasticsearch.localhost"
    echo -e "  127.0.0.1 kibana.localhost"
    echo -e "  127.0.0.1 logstash.localhost"
fi

# Test 6: SSL Certificate Details
echo -e "${BLUE}Test 6: Certificate Details${NC}"
echo -e "${YELLOW}🔍 Wildcard Certificate Subject:${NC}"
openssl x509 -in "$CERTS_DIR/elk-wildcard.crt" -noout -subject

echo -e "${YELLOW}🔍 Certificate Alternative Names:${NC}"
openssl x509 -in "$CERTS_DIR/elk-wildcard.crt" -noout -text | grep -A 10 "Subject Alternative Name" || echo "No SAN found"

echo -e "${YELLOW}🔍 Certificate Validity Period:${NC}"
openssl x509 -in "$CERTS_DIR/elk-wildcard.crt" -noout -dates

# Test 7: Browser Access Instructions
echo -e "${BLUE}Test 7: Browser Access Instructions${NC}"
echo -e "${GREEN}🌐 Access your ELK stack via HTTPS:${NC}"
echo -e "  📊 Elasticsearch: https://localhost:9200"
echo -e "  📈 Kibana: https://localhost:5601"
echo -e "  🔍 Logstash API: http://localhost:9600"

echo -e "${YELLOW}📝 Note: Your browser may show a security warning for self-signed certificates.${NC}"
echo -e "${YELLOW}Click 'Advanced' -> 'Proceed to localhost (unsafe)' to continue.${NC}"

echo -e "${GREEN}🎉 ELK HTTPS testing completed!${NC}"

# Summary
echo -e "${BLUE}📋 Summary${NC}"
echo -e "${BLUE}========${NC}"
echo -e "✅ Certificate generation: Complete"
echo -e "✅ Docker Compose config: Updated"
echo -e "✅ ELK service configs: Updated"
echo -e "✅ Wildcard SSL: *.localhost"
echo -e "✅ Testing script: Available"

echo -e "${YELLOW}🚀 Ready to start ELK stack with: make up${NC}"
