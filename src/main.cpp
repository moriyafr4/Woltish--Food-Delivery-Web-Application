#include "infrastructure/FileDataRepository.h"
#include "core/AppCommandProcessor.h"
#include "infrastructure/TcpServer.h" 
#include <iostream>
#include <string>

/**
 * Main Entry Point
 * Orchestrates the application by initializing the data source, 
 * registering commands, and starting the main loop.
 */
int main(int argc, char* argv[]) {
    // Make sure that the port is given (for example: ./recommender_app 8080)
    if (argc < 2) {
        std::cerr << "Error: Port argument is missing." << std::endl;
        std::cerr << "Usage: " << argv[0] << " <port_number>" << std::endl;
        return 1;
    }
    try {
        // Try to convert the port to string
        int port = std::stoi(argv[1]);
        // Define the database
        FileDataRepository* repo = new FileDataRepository("data/database.txt");
        // Define the command processor
        std::shared_ptr<ICommandProcessor> processor = std::make_shared<AppCommandProcessor>(repo);        // Define the TCP connection on socket 
        TcpServer server(port, processor);

        std::cout << "Server successfully initialized. Listening on port " << port << "..." << std::endl;
        server.start();
        
    }
    catch (const std::invalid_argument& e) {
        // If the port is not number
        std::cerr << "Error: Invalid port number provided." << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "Server Exception caught: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
