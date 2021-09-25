Vincent's Notes of things learned:

## How devices communicate to each other

There's three components.

- Webapp (React)
- Core Backend
- Embedded device
- External Services

The embedded device has a raspberry pi server, this takes HTTP request and has its own arduino code running on it. We can run commands from the HTTP calls to this device from here

Backend acts as a stateless proxy from frontend, and also helps repackage requests to the embedded device to what it needs to communicate in

The database is MongoDB for quick reads/writes

The WebRTC bypasses the CoreBackend and talks from frontend TO external service TO embedded device

## Notes for install

Add the following tables in a mongo DB

- commands
- connections
- data
- locations
- test
- users