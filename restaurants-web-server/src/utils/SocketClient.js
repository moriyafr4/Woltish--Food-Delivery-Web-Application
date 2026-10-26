const net = require('net');

class SocketClient {
  constructor(host = process.env.EX2_HOST || 'localhost', port = parseInt(process.env.EX2_PORT) || 5555) {
    this.host = host;
    this.port = port;
  }

   //Sends a raw command string to Ex2 server and resolves with the response.

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let responseBuffer = '';

      client.setTimeout(5000);

      client.connect(this.port, this.host, () => {
        client.write(command + '\n');
      });

      client.on('data', (data) => {
        responseBuffer += data.toString();

        const lines = responseBuffer.split('\n');
        const firstLine = lines[0];

        if (firstLine.startsWith('200')) {
          // RECOMMEND response: "200 Ok\n\n<products>" — two newlines total
          if (responseBuffer.includes('\n\n')) {
            client.destroy();
            resolve(responseBuffer.trim());
          }
        } else if (responseBuffer.includes('\n')) {
          // All other responses end with a single newline
          client.destroy();
          resolve(responseBuffer.trim());
        }
      });

      client.on('error', (err) => {
        client.destroy(); 
        reject(new Error(`Ex2 server connection error: ${err.message}`));
      });

      client.on('timeout', () => {
        client.destroy();
        reject(new Error('Ex2 server request timed out'));
      });

      client.on('close', () => {
        if (responseBuffer) resolve(responseBuffer.trim());
      });
    });
  }


  /**
   * POST <userId> <productId1> [productId2 ...]
   */
  async addUser(userId, productIds = []) {
    const args = [userId, ...productIds].join(' ');
    return this.sendCommand(`POST ${args}`);
  }

  /**
   * PATCH <userId> <productId1> [productId2 ...]
   */
  async updateUser(userId, productIds = []) {
    const args = [userId, ...productIds].join(' ');
    return this.sendCommand(`PATCH ${args}`);
  }

  /**
   * GET <userId> <productId>
   */
  async getRecommendations(userId, productId) {
    try {
      const response = await this.sendCommand(`GET ${userId} ${productId}`);

      if (response.startsWith('200')) {
        const parts = response.split('\n\n');
        const items = parts[1] ? parts[1].trim().split(' ').filter(Boolean) : [];
        return items;
      }
      return response; 
    } catch (error) {
      console.error('Failed to fetch recommendations:', error.message);
      return []; 
    }
  }

  /**
   * DELETE <userId>
   */
  async deleteUser(userId) {
    return this.sendCommand(`DELETE ${userId}`);
  }
}

module.exports = SocketClient;