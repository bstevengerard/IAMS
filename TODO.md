# TODO: Fix WebSocket Connection Issues

## Backend Changes
- [ ] Install socket.io in backend
- [ ] Modify server.js to integrate socket.io
- [ ] Update attendanceController.js to emit real-time events on attendance mark

## Frontend Changes
- [ ] Install socket.io-client in frontend
- [ ] Create socket service in frontend/src/services/socket.js
- [ ] Update MarkAttendance component to emit attendance marked event
- [ ] Update AttendanceReports component to listen for attendance updates

## Testing
- [ ] Test WebSocket connection
- [ ] Test real-time attendance updates
