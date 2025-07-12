```bash
# Successful registration
curl -X POST -H "Content-Type: application/json" \
-d '{"username":"johndoe","email":"john.doe@email.com","password":"password1234"}' \
http://localhost:3000/register
# try register again with the same email to see if it fails
```

```bash
# login with valid credentials
curl -X POST -H "Content-Type: application/json" \
-d '{"login":"john.doe@email.com","password":"password1234"}' \
http://localhost:3000/login
```

```bash
# login with invalid credentials
curl -X POST -H "Content-Type: application/json" \
-d '{"login":"john.doe@email.com","password":"wrong-password"}' \
http://localhost:3000/login
```

```bash
# Get a valid access and refresh token
# you need to login with a user
# if you don't have a user, register first
curl -X POST -H "Content-Type: application/json" \
-d '{"login":"john.doe@email.com","password":"password1234"}' \
http://localhost:3000/login
```

```bash
# Copy the long refreshToken string from the response.
# Replace 'PASTE_YOUR_REFRESH_TOKEN_HERE' with the actual token
# You should have received a response with an access token and a refresh token.
curl -X POST -H "Content-Type: application/json" \
-d '{"token":"PASTE_YOUR_REFRESH_TOKEN_HERE"}' \
http://localhost:3000/refresh

# try again with the first token to see if it fails (cuz it is expired)
```

```bash
# delete user
curl -X DELETE http://localhost:3000/delete/{:id}
```