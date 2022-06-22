module.exports = {
  apps: [
    {
      script: 'docker compose up --build',
      name: 'enigma',
      kill_timeout: 20000,
    },
  ],
}
