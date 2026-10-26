#pragma once
#include <memory>
#include "core/ICommandProcessor.h"

class TcpServer {
private:
    int server_port; // Variable to store the port number
    int server_fd; // File descriptor for the server
    bool running; // Boolean flag to control the execution state of the server loops
    std::shared_ptr<ICommandProcessor> processor;  // Smart pointer holding the abstract command processor
    
    // Private helper method to manage data exchange 
    void handleClient(int client_socket);

public:
    TcpServer(int port, std::shared_ptr<ICommandProcessor> proc); // constructor
    ~TcpServer(); // to make sure all sockets safe closed
    // Main method to initialize network structures and start accepting connections
    void start(); 
    // Method to break execution loops and close the server
    void stop();
};