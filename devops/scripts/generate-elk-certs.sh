#!/bin/bash

# ELK Stack Certificate Generation Script
# Generates self-signed wildcard certificate for *.localhost domain

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/../certs"
DOMAIN="localhost"
WILDCARD_DOMAIN="*.localhost"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 ELK Stack Certificate Generation${NC}"
echo -e "${BLUE}====================================${NC}"

# Create certificates directory
echo -e "${YELLOW}📁 Creating certificates directory...${NC}"
mkdir -p "$CERTS_DIR"
cd "$CERTS_DIR"

# Clean up existing certificates
echo -e "${YELLOW}🧹 Cleaning up existing certificates...${NC}"
rm -f ca.key ca.crt ca.srl
rm -f elk-wildcard.key elk-wildcard.crt elk-wildcard.csr
rm -f elasticsearch.key elasticsearch.crt
rm -f kibana.key kibana.crt
rm -f logstash.key logstash.crt

echo -e "${BLUE}Step 1: Generating Certificate Authority (CA)${NC}"
# Generate CA private key
openssl genrsa -out ca.key 4096

# Generate CA certificate
openssl req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=US/ST=CA/L=San Francisco/O=ft_transcendence/OU=DevOps/CN=ELK-CA"

echo -e "${GREEN}✅ CA certificate generated successfully${NC}"

echo -e "${BLUE}Step 2: Generating Wildcard Certificate for *.localhost${NC}"
# Generate wildcard private key
openssl genrsa -out elk-wildcard.key 4096

# Create certificate signing request for wildcard
openssl req -new -key elk-wildcard.key -out elk-wildcard.csr -subj "/C=US/ST=CA/L=San Francisco/O=ft_transcendence/OU=ELK/CN=*.localhost"

# Create extensions file for wildcard certificate
cat > elk-wildcard.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = elasticsearch.localhost
DNS.4 = kibana.localhost
DNS.5 = logstash.localhost
DNS.6 = elasticsearch
DNS.7 = kibana
DNS.8 = logstash
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate wildcard certificate signed by CA
openssl x509 -req -in elk-wildcard.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out elk-wildcard.crt -days 365 -extensions v3_req -extfile elk-wildcard.ext

echo -e "${GREEN}✅ Wildcard certificate generated successfully${NC}"

echo -e "${BLUE}Step 3: Creating service-specific certificate copies${NC}"
# Create copies for each service (same cert, different names for clarity)
cp elk-wildcard.crt elasticsearch.crt
cp elk-wildcard.key elasticsearch.key

cp elk-wildcard.crt kibana.crt
cp elk-wildcard.key kibana.key

cp elk-wildcard.crt logstash.crt
cp elk-wildcard.key logstash.key

echo -e "${GREEN}✅ Service certificates created successfully${NC}"

echo -e "${BLUE}Step 4: Setting correct permissions${NC}"
# Set appropriate permissions
chmod 644 *.crt
chmod 600 *.key
chmod 644 ca.crt

echo -e "${GREEN}✅ Permissions set correctly${NC}"

echo -e "${BLUE}Step 5: Verification${NC}"
# Verify the certificates
echo -e "${YELLOW}🔍 Verifying CA certificate...${NC}"
openssl x509 -in ca.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"

echo -e "${YELLOW}🔍 Verifying wildcard certificate...${NC}"
openssl x509 -in elk-wildcard.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After|DNS:|IP Address:)"

echo -e "${YELLOW}🔍 Verifying certificate chain...${NC}"
openssl verify -CAfile ca.crt elk-wildcard.crt

echo -e "${GREEN}🎉 Certificate generation completed successfully!${NC}"
echo -e "${BLUE}📋 Generated files:${NC}"
echo -e "  📄 ca.crt - Certificate Authority"
echo -e "  🔑 ca.key - CA Private Key"
echo -e "  📄 elk-wildcard.crt - Wildcard Certificate"
echo -e "  🔑 elk-wildcard.key - Wildcard Private Key"
echo -e "  📄 elasticsearch.crt - Elasticsearch Certificate (copy)"
echo -e "  🔑 elasticsearch.key - Elasticsearch Private Key (copy)"
echo -e "  📄 kibana.crt - Kibana Certificate (copy)"
echo -e "  🔑 kibana.key - Kibana Private Key (copy)"
echo -e "  📄 logstash.crt - Logstash Certificate (copy)"
echo -e "  🔑 logstash.key - Logstash Private Key (copy)"

echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Update docker-compose.yml with new certificate paths"
echo -e "  2. Update ELK service configurations"
echo -e "  3. Add entries to /etc/hosts if needed:"
echo -e "     127.0.0.1 elasticsearch.localhost"
echo -e "     127.0.0.1 kibana.localhost"
echo -e "  4. Test each service individually"

# Clean up temporary files
rm -f elk-wildcard.csr elk-wildcard.ext ca.srl

echo -e "${GREEN}✨ Ready for ELK stack HTTPS configuration!${NC}"
