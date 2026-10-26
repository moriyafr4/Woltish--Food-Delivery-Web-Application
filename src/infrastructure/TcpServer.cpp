#include "TcpServer.h"
#include <iostream>
#include <sys/socket.h> 
#include <netinet/in.h> 
#include <unistd.h> 
#include <cstring>


// constructor - get the port and the command and set the fd as -1
TcpServer::TcpServer(int port, std::shared_ptr<ICommandProcessor> proc) 
    : server_port(port), server_fd(-1), running(false), processor(proc) {}

TcpServer::~TcpServer() {
    // release the socket
    stop(); 
}

void TcpServer::start() {
    // define a tcp (SOCK_STREAM) socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == -1) {
        // file descriptor will be -1 if there is an error
        perror("Socket creation failed");
        return;
    }

    // To reuse the same address without waiting some time we need to set SO_REUSEADDR to 1
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in address{}; // set the adress and clear memory
    address.sin_family = AF_INET;         
    address.sin_addr.s_addr = INADDR_ANY; // Listen on all network interfaces
    address.sin_port = htons(server_port); // convert the server to big endian

    // bind the socket and the address
    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        perror("Bind failed");
        close(server_fd);
        return;
    }
    // Set socket to passive listening mode with a request queue size limit of 3
    if (listen(server_fd, 3) < 0) {
        perror("Listen failed");
        close(server_fd);
        return;
    }

    // Raise flag to allow execution of main service loops
    running = true;

    // main loop - hanle one client every time
    while (running) {
        sockaddr_in client_addr{};
        socklen_t addr_len = sizeof(client_addr);

        // Block until a client connects
        int client_socket = accept(server_fd, (struct sockaddr*)&client_addr, &addr_len);
        
        if (client_socket >= 0) {
            // go to hanleClient and take care to the socket 
            handleClient(client_socket); 
            // Close client connection when the session ends 
            close(client_socket);     
        }
    }
}

// safe stop
void TcpServer::stop() {
    running = false;
    if (server_fd != -1) {
        close(server_fd); 
        server_fd = -1;
    }
}

// manage data from the client
void TcpServer::handleClient(int client_socket) {
    char buffer[1024];
    std::string session_buffer = ""; // general buffer

     
    while (running) {
        // read the buffer from the client socket
        ssize_t valread = read(client_socket, buffer, sizeof(buffer) - 1);
        
        // if there is an error
        if (valread <= 0) {
            break; 
        }
        
        buffer[valread] = '\0'; // set the last letter to \0
        session_buffer += buffer; // add it to the general buffer

        size_t pos;
        // Extract every complete command ending with a newline character
        while ((pos = session_buffer.find('\n')) != std::string::npos) {
            std::string command = session_buffer.substr(0, pos);
            // cancel the order from the buffer
            session_buffer.erase(0, pos + 1);

            // if the command empty continue 
            if (command.empty()) {
                continue;
            }

            // Pass clean command payload and goes to the exact command withot if and else
            std::string response = processor->processCommand(command);
            
            // Append the required output newline delimiter
            response += "\n";
            
            // Send the finalized response string back down to the client socket
            send(client_socket, response.c_str(), response.length(), 0);
        }
        
    }
}