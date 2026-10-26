#include "App.h"
#include <iostream>
#include <sstream>

//App Constructor
App::App(IMenu* menu, std::map<std::string, ICommand*> commands)
    : menu_(menu), commands_(commands) {
}

//Starts the application lifecycle.
//Runs an infinite loop that reads input until the input stream is closed (EOF).
void App::run() {
    while (true) {
        // Fetch the next command line from the menu interface
        std::string line = menu_->nextCommand();
        
        // Break the loop if the input stream has reached its end
        if (std::cin.eof()) {
            break;
        }

        // Ignore empty inputs
        if (line.empty()) {
            continue;
        }

        // Use stringstream to extract only the first word (the command name)
        std::istringstream iss(line);
        std::string commandName;
        iss >> commandName;

        // Check if the command exists in our registry before executing
        if (commands_.count(commandName)) {
            //commands_[commandName]->execute(line);
        }
    }
}