#ifndef APP_H
#define APP_H

#include "infrastructure/IMenu.h"
#include "commands/ICommand.h"
#include <map>
#include <string>

/**
 * The main application controller.
 * Implements the main loop and command dispatching.
 */
class App {
private:
    IMenu* menu_;
    std::map<std::string, ICommand*> commands_;

public:
    // Dependency Injection of the menu and commands map
    App(IMenu* menu, std::map<std::string, ICommand*> commands);
    // Starts the infinite loop
    void run();
};

#endif