#include "ConsoleMenu.h"
#include <iostream>

/**
 * Reads the next available line from standard input.
 * return The complete line as a string, or an empty string if EOF is reached.
 */
std::string ConsoleMenu::nextCommand() {
    std::string line;
    if (std::getline(std::cin, line)) {
        return line;
    }
    return "";
}