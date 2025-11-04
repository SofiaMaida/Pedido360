// REST API base (API Gateway o similar)
window.API_BASE =
  window.API_BASE ||
  localStorage.getItem('API_BASE') ||
  'https://hhjlmc50b2.execute-api.us-east-1.amazonaws.com';

// Socket.IO base (conectar directo a EC2/ALB/Nginx con soporte WebSocket)
// En dev: 'http://localhost:8080'
// En prod: dominio/URL pública del backend que acepte WebSocket (no API Gateway HTTP)
window.SOCKET_BASE =
  window.SOCKET_BASE ||
  localStorage.getItem('SOCKET_BASE') ||
  'http://localhost:8080';
